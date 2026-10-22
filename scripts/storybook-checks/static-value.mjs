export const UNRESOLVED = Symbol('unresolved');

// Values inherited from the module keep that scope for their own dependencies.
// Unresolved local bindings still shadow the parent through localBindings.
export function createConstantScope(parent, local, localBindings) {
  const constants = new Map([
    ...[...parent].filter(([name]) => !localBindings.has(name)),
    ...local,
  ]);
  constants.scopeFor = (name) => localBindings.has(name) ? constants : parent;
  return constants;
}

export function resolveConstant(name, constants) {
  const scope = constants.scopeFor?.(name) ?? constants;
  return { node: scope.get(name), constants: scope };
}

export function propertyName(node) {
  if (!node) return null;
  if (node.type === 'Identifier') return node.name;
  if (node.type === 'Literal' || node.type === 'StringLiteral') return String(node.value ?? node.text);
  return null;
}

export function evaluateStatic(node, constants = new Map(), seen = new Set()) {
  if (!node) return UNRESOLVED;
  if (node.type === 'Literal') return node.value;
  if (node.type === 'Identifier') {
    if (node.name === 'undefined') return undefined;
    const binding = resolveConstant(node.name, constants);
    if (!binding.node || seen.has(binding.node)) return UNRESOLVED;
    return evaluateStatic(binding.node, binding.constants, new Set([...seen, binding.node]));
  }
  if (node.type === 'TSAsExpression' || node.type === 'TSTypeAssertion' || node.type === 'TSNonNullExpression' || node.type === 'TSSatisfiesExpression') {
    return evaluateStatic(node.expression, constants, seen);
  }
  if (node.type === 'TemplateLiteral') {
    if (node.expressions.length) return UNRESOLVED;
    return node.quasis.map((part) => part.value.cooked).join('');
  }
  if (node.type === 'BinaryExpression' && node.operator === '+') {
    const left = evaluateStatic(node.left, constants, seen);
    const right = evaluateStatic(node.right, constants, seen);
    return left === UNRESOLVED || right === UNRESOLVED ? UNRESOLVED : left + right;
  }
  if (node.type === 'ArrayExpression') {
    const output = [];
    for (const element of node.elements) {
      if (!element) continue;
      if (element.type === 'SpreadElement') {
        const spread = evaluateStatic(element.argument, constants, seen);
        if (!Array.isArray(spread)) return UNRESOLVED;
        output.push(...spread);
      } else {
        const value = evaluateStatic(element, constants, seen);
        if (value === UNRESOLVED) return UNRESOLVED;
        output.push(value);
      }
    }
    return output;
  }
  if (node.type === 'ObjectExpression') {
    const output = {};
    for (const property of node.properties) {
      if (property.type === 'SpreadElement') {
        const spread = evaluateStatic(property.argument, constants, seen);
        if (!spread || spread === UNRESOLVED || Array.isArray(spread) || typeof spread !== 'object') return UNRESOLVED;
        Object.assign(output, spread);
        continue;
      }
      if (property.type !== 'Property' || property.computed) return UNRESOLVED;
      const key = propertyName(property.key);
      const value = evaluateStatic(property.value, constants, seen);
      if (key === null || value === UNRESOLVED) return UNRESOLVED;
      output[key] = value;
    }
    return output;
  }
  return UNRESOLVED;
}

export function staticObjectKeys(node, constants = new Map(), seen = new Set()) {
  if (!node) return { keys: [], unresolved: true };
  if (node.type === 'TSAsExpression' || node.type === 'TSTypeAssertion' || node.type === 'TSNonNullExpression' || node.type === 'TSSatisfiesExpression') {
    return staticObjectKeys(node.expression, constants, seen);
  }
  if (node.type === 'Identifier') {
    const binding = resolveConstant(node.name, constants);
    if (!binding.node || seen.has(binding.node)) return { keys: [], unresolved: true };
    return staticObjectKeys(binding.node, binding.constants, new Set([...seen, binding.node]));
  }
  if (node.type !== 'ObjectExpression') return { keys: [], unresolved: true };
  const keys = [];
  let unresolved = false;
  for (const property of node.properties) {
    if (property.type === 'SpreadElement') {
      const spread = staticObjectKeys(property.argument, constants, seen);
      keys.push(...spread.keys);
      unresolved ||= spread.unresolved;
    } else if (property.type === 'Property' && !property.computed) {
      const key = propertyName(property.key);
      if (key === null) unresolved = true;
      else keys.push(key);
    } else unresolved = true;
  }
  return { keys, unresolved };
}
