import { readFileSync } from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
import { parse } from 'svelte/compiler';
import { sanitize, storyNameFromExport, toId } from '@storybook/csf';
import { canonicalRepoPath, getGitInventory, resolveLocalImport } from './paths.mjs';
import { createConstantScope, evaluateStatic, propertyName, resolveConstant, staticObjectKeys, UNRESOLVED } from './static-value.mjs';
import { diagnostic } from './diagnostics.mjs';

const STORY_RE = /^src\/stories\/(?:.+\/)?[^/]+\.stories\.svelte$/;
const COMPONENT_RE = /^src\/components\/[^/]+\.svelte$/;
const ASSET_KEYS = new Set(['src', 'srcset', 'fallbackSrc', 'fallbackSrcset', 'poster']);

export function walk(node, visit) {
  if (!node || typeof node !== 'object') return;
  visit(node);
  for (const [key, value] of Object.entries(node)) {
    if (key === 'parent' || key === 'metadata' || key === 'loc') continue;
    if (Array.isArray(value)) for (const child of value) walk(child, visit);
    else walk(value, visit);
  }
}

function collectConstants(program) {
  const constants = new Map();
  for (const node of program?.body ?? []) {
    if (node.type !== 'VariableDeclaration' || node.kind !== 'const') continue;
    for (const declaration of node.declarations ?? []) {
      if (declaration.id?.type === 'Identifier' && declaration.init) constants.set(declaration.id.name, declaration.init);
    }
  }
  const rootIdentifier = (node) => {
    while (node?.type === 'MemberExpression') node = node.object;
    return node?.type === 'Identifier' ? node.name : null;
  };
  const mutated = new Set();
  const mutatingMethods = new Set(['add', 'clear', 'copyWithin', 'delete', 'fill', 'pop', 'push', 'reverse', 'set', 'shift', 'sort', 'splice', 'unshift']);
  const addPatternNames = (pattern, target) => {
    if (pattern?.type === 'Identifier') target.add(pattern.name);
    else if (pattern?.type === 'ObjectPattern' || pattern?.type === 'ArrayPattern') for (const item of pattern.properties ?? pattern.elements ?? []) {
      if (item?.type === 'Property') addPatternNames(item.value, target);
      else if (item?.type === 'RestElement') addPatternNames(item.argument, target);
      else addPatternNames(item, target);
    }
    else if (pattern?.type === 'AssignmentPattern') addPatternNames(pattern.left, target);
  };
  const nestedBindings = (body) => {
    const names = new Set();
    for (const statement of body ?? []) {
      if (statement.type === 'VariableDeclaration') for (const declaration of statement.declarations ?? []) addPatternNames(declaration.id, names);
      if ((statement.type === 'FunctionDeclaration' || statement.type === 'ClassDeclaration') && statement.id) addPatternNames(statement.id, names);
    }
    return names;
  };
  const visitMutation = (node, shadowed = new Set()) => {
    if (!node || typeof node !== 'object') return;
    let active = shadowed;
    if (node !== program && node.type === 'BlockStatement') active = new Set([...active, ...nestedBindings(node.body)]);
    if (['FunctionDeclaration', 'FunctionExpression', 'ArrowFunctionExpression'].includes(node.type)) {
      active = new Set(active);
      for (const parameter of node.params ?? []) addPatternNames(parameter, active);
      if (node.id) addPatternNames(node.id, active);
    }
    if (node.type === 'CatchClause') {
      active = new Set(active);
      addPatternNames(node.param, active);
    }
    if (['ForStatement', 'ForInStatement', 'ForOfStatement'].includes(node.type)) {
      const declaration = node.type === 'ForStatement' ? node.init : node.left;
      if (declaration?.type === 'VariableDeclaration') {
        active = new Set(active);
        for (const item of declaration.declarations ?? []) addPatternNames(item.id, active);
      }
    }
    if (node.type === 'AssignmentExpression' || node.type === 'UpdateExpression') {
      const name = rootIdentifier(node.type === 'AssignmentExpression' ? node.left : node.argument);
      if (name && constants.has(name) && !active.has(name)) mutated.add(name);
    }
    if (node.type === 'CallExpression' && node.callee?.type === 'MemberExpression') {
      const owner = rootIdentifier(node.callee.object);
      const method = node.callee.computed ? propertyName(node.callee.property) : node.callee.property?.name;
      if (owner && constants.has(owner) && !active.has(owner) && mutatingMethods.has(method)) mutated.add(owner);
      if (node.callee.object?.type === 'Identifier' && node.callee.object.name === 'Object' && method === 'assign') {
        const target = rootIdentifier(node.arguments?.[0]);
        if (target && constants.has(target) && !active.has(target)) mutated.add(target);
      }
    }
    for (const [key, value] of Object.entries(node)) {
      if (key === 'parent' || key === 'metadata' || key === 'loc') continue;
      if (Array.isArray(value)) for (const child of value) visitMutation(child, active);
      else visitMutation(value, active);
    }
  };
  visitMutation(program);
  for (const name of mutated) constants.delete(name);
  return constants;
}

export function mutatedTopLevelTsConstants(script, names) {
  const mutated = new Set();
  const mutatingMethods = new Set(['add', 'clear', 'copyWithin', 'delete', 'fill', 'pop', 'push', 'reverse', 'set', 'shift', 'sort', 'splice', 'unshift']);
  const addBinding = (binding, target) => {
    if (!binding) return;
    if (ts.isIdentifier(binding)) target.add(binding.text);
    else if (ts.isObjectBindingPattern(binding) || ts.isArrayBindingPattern(binding)) for (const element of binding.elements) if (ts.isBindingElement(element)) addBinding(element.name, target);
  };
  const blockBindings = (statements) => {
    const bindings = new Set();
    for (const statement of statements ?? []) {
      if (ts.isVariableStatement(statement)) for (const declaration of statement.declarationList.declarations) addBinding(declaration.name, bindings);
      if ((ts.isFunctionDeclaration(statement) || ts.isClassDeclaration(statement)) && statement.name) bindings.add(statement.name.text);
    }
    return bindings;
  };
  const rootIdentifier = (node) => {
    while (node && (ts.isPropertyAccessExpression(node) || ts.isElementAccessExpression(node))) node = node.expression;
    return node && ts.isIdentifier(node) ? node.text : null;
  };
  const visit = (node, shadowed = new Set()) => {
    let active = shadowed;
    if (node !== script && (ts.isBlock(node) || ts.isModuleBlock(node))) active = new Set([...active, ...blockBindings(node.statements)]);
    if (ts.isFunctionLike(node)) {
      active = new Set(active);
      for (const parameter of node.parameters ?? []) addBinding(parameter.name, active);
      if ((ts.isFunctionDeclaration(node) || ts.isFunctionExpression(node)) && node.name) active.add(node.name.text);
    }
    if (ts.isCatchClause(node)) {
      active = new Set(active);
      addBinding(node.variableDeclaration?.name, active);
    }
    if (ts.isForStatement(node) || ts.isForInStatement(node) || ts.isForOfStatement(node)) {
      const declaration = node.initializer;
      if (declaration && ts.isVariableDeclarationList(declaration)) {
        active = new Set(active);
        for (const item of declaration.declarations) addBinding(item.name, active);
      }
    }
    if (ts.isBinaryExpression(node) && ts.isAssignmentOperator(node.operatorToken.kind)) {
      const name = rootIdentifier(node.left);
      if (name && names.has(name) && !active.has(name)) mutated.add(name);
    }
    if ((ts.isPrefixUnaryExpression(node) || ts.isPostfixUnaryExpression(node)) && [ts.SyntaxKind.PlusPlusToken, ts.SyntaxKind.MinusMinusToken].includes(node.operator)) {
      const name = rootIdentifier(node.operand);
      if (name && names.has(name) && !active.has(name)) mutated.add(name);
    }
    if (ts.isCallExpression(node) && (ts.isPropertyAccessExpression(node.expression) || ts.isElementAccessExpression(node.expression))) {
      const callee = node.expression;
      const owner = rootIdentifier(callee.expression);
      const method = ts.isPropertyAccessExpression(callee) ? callee.name.text : callee.argumentExpression && ts.isStringLiteral(callee.argumentExpression) ? callee.argumentExpression.text : null;
      if (owner && names.has(owner) && !active.has(owner) && mutatingMethods.has(method)) mutated.add(owner);
      if (ts.isIdentifier(callee.expression) && callee.expression.text === 'Object' && method === 'assign') {
        const target = rootIdentifier(node.arguments[0]);
        if (target && names.has(target) && !active.has(target)) mutated.add(target);
      }
    }
    ts.forEachChild(node, (child) => visit(child, active));
  };
  visit(script);
  return mutated;
}

function objectProperty(object, name) {
  return object?.properties?.find(
    (property) => property.type === 'Property' && !property.computed && propertyName(property.key) === name
  );
}

function attribute(component, name) {
  return component.attributes?.find((item) => item.type === 'Attribute' && item.name === name);
}

function attributeExpression(item) {
  if (!item) return undefined;
  if (item.value?.type === 'ExpressionTag') return item.value.expression;
  return undefined;
}

function attributeString(item, constants) {
  if (!item) return undefined;
  if (Array.isArray(item.value) && item.value.length === 1 && item.value[0].type === 'Text') return item.value[0].data;
  const value = evaluateStatic(attributeExpression(item), constants);
  return typeof value === 'string' ? value : undefined;
}

function scriptKind(file) {
  if (file.endsWith('.jsx')) return ts.ScriptKind.JSX;
  if (file.endsWith('.tsx')) return ts.ScriptKind.TSX;
  if (/\.(?:js|mjs|cjs)$/.test(file)) return ts.ScriptKind.JS;
  return ts.ScriptKind.TS;
}

function implicitExportName(name) {
  const id = sanitize(name.replace(/([A-Z])/g, ' $1').trim());
  return id.split('-').map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join('');
}

function moduleText(source, ast) {
  if (!ast.module?.content) return '';
  return source.slice(ast.module.content.start, ast.module.content.end);
}

function entityName(node) {
  if (!node) return '';
  if (ts.isIdentifier(node)) return node.text;
  if (ts.isQualifiedName(node)) return `${entityName(node.left)}.${entityName(node.right)}`;
  return node.getText();
}

function collectOwnedProps(source, ast, file, root, diagnostics, required = true) {
  const text = moduleText(source, ast);
  const script = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  const inspectTypeProgram = (sourceFile) => {
    const aliases = new Map();
    const importedTypes = new Map();
    for (const statement of sourceFile.statements) {
      if (ts.isTypeAliasDeclaration(statement)) {
        aliases.set(statement.name.text, statement.type);
        if (statement.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.DefaultKeyword)) aliases.set('default', statement.type);
      }
      if (ts.isInterfaceDeclaration(statement)) {
        aliases.set(statement.name.text, statement);
        if (statement.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.DefaultKeyword)) aliases.set('default', statement);
      }
      if (!ts.isImportDeclaration(statement) || !ts.isStringLiteral(statement.moduleSpecifier) || !statement.importClause) continue;
      if (statement.importClause.name) importedTypes.set(statement.importClause.name.text, { importedName: 'default', specifier: statement.moduleSpecifier.text });
      if (statement.importClause.namedBindings && ts.isNamedImports(statement.importClause.namedBindings)) {
        for (const imported of statement.importClause.namedBindings.elements) importedTypes.set(imported.name.text, { importedName: imported.propertyName?.text ?? imported.name.text, specifier: statement.moduleSpecifier.text });
      }
    }
    return { aliases, importedTypes };
  };
  const { aliases, importedTypes } = inspectTypeProgram(script);
  let propsTypeName;
  walk(ast.instance?.content, (node) => {
    if (propsTypeName || node.type !== 'VariableDeclarator' || node.id?.type !== 'ObjectPattern') return;
    let init = node.init;
    while (init && ['TSAsExpression', 'TSTypeAssertion'].includes(init.type)) init = init.expression;
    if (init?.type !== 'CallExpression' || init.callee?.type !== 'Identifier' || init.callee.name !== '$props') return;
    const annotation = node.id.typeAnnotation?.typeAnnotation;
    if (annotation?.type === 'TSTypeReference' && annotation.typeName?.type === 'Identifier') propsTypeName = annotation.typeName.name;
  });
  const exported = propsTypeName && [...script.statements].find(
    (statement) =>
      (ts.isTypeAliasDeclaration(statement) || ts.isInterfaceDeclaration(statement)) &&
      statement.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword) &&
      statement.name.text === propsTypeName
  );
  const output = new Map();
  const active = new Set();
  const unresolved = new Set();
  let hasNativeContract = false;
  const nativeExcludedProps = new Set();
  const contextCache = new Map();
  const addMembers = (members, sourceFile = script, props = output) => {
    for (const member of members ?? []) {
      if (ts.isIndexSignatureDeclaration(member)) {
        const parameter = member.parameters?.[0];
        if (member.parameters?.length !== 1 || parameter?.type?.kind !== ts.SyntaxKind.StringKeyword) unresolved.add(`${sourceFile.fileName}:unsupported index signature`);
        else hasNativeContract = true;
        continue;
      }
      if (!ts.isPropertySignature(member) || !member.name) {
        unresolved.add(`${sourceFile.fileName}:${member.getText(sourceFile)}`);
        continue;
      }
      if (!ts.isIdentifier(member.name) && !ts.isStringLiteral(member.name) && !ts.isNumericLiteral(member.name)) {
        unresolved.add(`${sourceFile.fileName}:${member.name.getText(sourceFile)}`);
        continue;
      }
      const name = member.name.getText(sourceFile).replace(/^['"]|['"]$/g, '');
      const typeText = member.type?.getText(sourceFile) ?? '';
      const compact = typeText.replace(/\s+/g, '');
      const snippet = /(^|[|<(])Snippet(?:<[^>]*>)?([|>)\[]|$)/.test(compact) &&
        compact.split('|').every((part) => /^(Snippet(?:<.*>)?|undefined|null)$/.test(part));
      props.set(name, { name, snippet, node: member });
    }
  };
  const loadTypeContext = (fromFile, specifier) => {
    const resolved = resolveLocalImport(root, fromFile, specifier, new Set());
    if (!resolved || !/\.(?:svelte|[cm]?[jt]sx?)$/.test(resolved)) return null;
    if (contextCache.has(resolved)) return contextCache.get(resolved);
    let importedSource;
    try { importedSource = readFileSync(path.join(root, resolved), 'utf8'); } catch { return null; }
    if (resolved.endsWith('.svelte')) {
      try {
        const importedAst = parse(importedSource, { modern: true, filename: resolved });
        importedSource = moduleText(importedSource, importedAst);
      } catch { return null; }
    }
    const importedScript = ts.createSourceFile(resolved, importedSource, ts.ScriptTarget.Latest, true, scriptKind(resolved));
    const { aliases: importedAliases, importedTypes: imports } = inspectTypeProgram(importedScript);
    const context = { file: resolved, script: importedScript, aliases: importedAliases, importedTypes: imports };
    contextCache.set(resolved, context);
    return context;
  };
  const rootContext = { file, script, aliases, importedTypes };
  const literalTypeKeys = (type) => {
    if (!type) return { keys: new Set(), complete: false };
    if (ts.isUnionTypeNode(type)) {
      const parts = type.types.map(literalTypeKeys);
      return { keys: new Set(parts.flatMap((item) => [...item.keys])), complete: parts.every((item) => item.complete) };
    }
    if (ts.isLiteralTypeNode(type) && (ts.isStringLiteral(type.literal) || ts.isNumericLiteral(type.literal))) return { keys: new Set([String(type.literal.text)]), complete: true };
    return { keys: new Set(), complete: false };
  };
  const importedTypeIdentity = (name, context) => context.importedTypes.get(name);
  const isSvelteNativeType = (type, context) => {
    if (ts.isTypeReferenceNode(type) || ts.isExpressionWithTypeArguments(type)) {
      const name = entityName(ts.isTypeReferenceNode(type) ? type.typeName : type.expression);
      const imported = importedTypeIdentity(name, context);
      return imported?.specifier === 'svelte/elements' && (imported.importedName === 'SvelteHTMLElements' || /HTML.*Attributes$/.test(imported.importedName));
    }
    if (ts.isIndexedAccessTypeNode(type) && ts.isTypeReferenceNode(type.objectType)) {
      const imported = importedTypeIdentity(entityName(type.objectType.typeName), context);
      return imported?.specifier === 'svelte/elements' && imported.importedName === 'SvelteHTMLElements';
    }
    return false;
  };
  const containsNativeType = (type, context = rootContext, visiting = new Set()) => {
    if (!type) return false;
    if (isSvelteNativeType(type, context)) return true;
    if (ts.isTypeAliasDeclaration(type)) return containsNativeType(type.type, context, visiting);
    if (ts.isInterfaceDeclaration(type)) {
      return (type.heritageClauses ?? []).some((clause) =>
        clause.types.some((inherited) => containsNativeType(inherited, context, visiting))
      );
    }
    if (ts.isIntersectionTypeNode(type) || ts.isUnionTypeNode(type)) {
      return type.types.some((item) => containsNativeType(item, context, visiting));
    }
    if (ts.isParenthesizedTypeNode(type)) return containsNativeType(type.type, context, visiting);
    if (ts.isTypeReferenceNode(type) || ts.isExpressionWithTypeArguments(type)) {
      const name = entityName(ts.isTypeReferenceNode(type) ? type.typeName : type.expression);
      if (['Omit', 'Pick', 'Partial', 'Required', 'Readonly'].includes(name)) {
        return containsNativeType(type.typeArguments?.[0], context, visiting);
      }
      const identity = `${context.file}:${name}`;
      if (visiting.has(identity)) return false;
      const nextVisiting = new Set([...visiting, identity]);
      if (context.aliases.has(name)) return containsNativeType(context.aliases.get(name), context, nextVisiting);
      const imported = context.importedTypes.get(name);
      if (!imported) return false;
      const importedContext = loadTypeContext(context.file, imported.specifier);
      return Boolean(importedContext?.aliases.has(imported.importedName) &&
        containsNativeType(importedContext.aliases.get(imported.importedName), importedContext, nextVisiting));
    }
    if (ts.isIdentifier(type)) {
      const name = type.text;
      const identity = `${context.file}:${name}`;
      if (visiting.has(identity)) return false;
      const nextVisiting = new Set([...visiting, identity]);
      if (context.aliases.has(name)) return containsNativeType(context.aliases.get(name), context, nextVisiting);
      const imported = context.importedTypes.get(name);
      if (!imported) return false;
      const importedContext = loadTypeContext(context.file, imported.specifier);
      return Boolean(importedContext?.aliases.has(imported.importedName) &&
        containsNativeType(importedContext.aliases.get(imported.importedName), importedContext, nextVisiting));
    }
    return false;
  };
  const resolve = (type, context = rootContext, props = output) => {
    if (!type) return;
    if (ts.isTypeAliasDeclaration(type)) return resolve(type.type, context, props);
    if (ts.isInterfaceDeclaration(type)) {
      addMembers(type.members, context.script, props);
      for (const clause of type.heritageClauses ?? []) for (const inherited of clause.types) resolve(inherited, context, props);
      return;
    }
    if (ts.isTypeLiteralNode(type)) return addMembers(type.members, context.script, props);
    if (ts.isIntersectionTypeNode(type)) return type.types.forEach((item) => resolve(item, context, props));
    if (ts.isUnionTypeNode(type)) {
      const unionProps = new Map();
      for (const item of type.types) {
        // Resolve each branch before merging so projections cannot erase or
        // reclassify a property contributed by another branch.
        const branchProps = new Map();
        resolve(item, context, branchProps);
        for (const [name, prop] of branchProps) {
          const previous = unionProps.get(name);
          unionProps.set(name, { ...prop, snippet: prop.snippet && (previous?.snippet ?? true) });
        }
      }
      for (const [name, prop] of unionProps) props.set(name, prop);
      return;
    }
    if (ts.isParenthesizedTypeNode(type)) return resolve(type.type, context, props);
    if (ts.isTypeReferenceNode(type) || ts.isExpressionWithTypeArguments(type)) {
      const name = entityName(ts.isTypeReferenceNode(type) ? type.typeName : type.expression);
      if (name === 'Omit' || name === 'Pick') {
        const nativeBase = containsNativeType(type.typeArguments?.[0], context);
        if (name === 'Pick' && nativeBase) {
          unresolved.add(`Pick over native attributes ${type.getText(context.script)}`);
          return;
        }
        const existing = new Set(props.keys());
        resolve(type.typeArguments?.[0], context, props);
        const selected = literalTypeKeys(type.typeArguments?.[1]);
        if (!selected.complete) unresolved.add(`${name} key set ${type.typeArguments?.[1]?.getText(context.script) ?? '<missing>'}`);
        if (name === 'Omit' && nativeBase && selected.complete) {
          for (const key of selected.keys) nativeExcludedProps.add(key);
        }
        for (const key of [...props.keys()]) {
          if (existing.has(key)) continue;
          if ((name === 'Omit' && selected.keys.has(key)) || (name === 'Pick' && !selected.keys.has(key))) props.delete(key);
        }
        return;
      }
      if (name === 'Partial' || name === 'Required' || name === 'Readonly') return resolve(type.typeArguments?.[0], context, props);
      if (isSvelteNativeType(type, context)) {
        hasNativeContract = true;
        return;
      }
      const identity = `${context.file}:${name}`;
      if (active.has(identity)) {
        unresolved.add(`cyclic type reference ${identity}`);
        return;
      }
      active.add(identity);
      if (context.aliases.has(name)) resolve(context.aliases.get(name), context, props);
      else if (context.importedTypes.has(name)) {
        const imported = context.importedTypes.get(name);
        const importedContext = loadTypeContext(context.file, imported.specifier);
        if (importedContext?.aliases.has(imported.importedName)) resolve(importedContext.aliases.get(imported.importedName), importedContext, props);
        else unresolved.add(`${context.file}:${name}`);
      } else unresolved.add(`${context.file}:${name}`);
      active.delete(identity);
      return;
    }
    if (isSvelteNativeType(type, context)) {
      hasNativeContract = true;
      return;
    }
    if (ts.isIdentifier(type)) {
      const identity = `${context.file}:${type.text}`;
      if (active.has(identity)) {
        unresolved.add(`cyclic type reference ${identity}`);
        return;
      }
      active.add(identity);
      if (context.aliases.has(type.text)) resolve(context.aliases.get(type.text), context, props);
      else if (context.importedTypes.has(type.text)) {
        const imported = context.importedTypes.get(type.text);
        const importedContext = loadTypeContext(context.file, imported.specifier);
        if (importedContext?.aliases.has(imported.importedName)) resolve(importedContext.aliases.get(imported.importedName), importedContext, props);
        else unresolved.add(`${context.file}:${type.text}`);
      } else unresolved.add(`${context.file}:${type.text}`);
      active.delete(identity);
      return;
    }
    unresolved.add(`${context.file}:${type.getText?.(context.script) ?? type.kind}`);
  };
  if (exported) resolve(exported);
  // Imported intersections cannot be expanded without a full TS program. The
  // component's typed $props destructuring is the authoritative owned surface
  // and fills those names in while preserving snippet classifications above.
  walk(ast.instance?.content, (node) => {
    if (node.type !== 'VariableDeclarator' || node.id?.type !== 'ObjectPattern') return;
    let init = node.init;
    while (init && ['TSAsExpression', 'TSTypeAssertion'].includes(init.type)) init = init.expression;
    if (init?.type !== 'CallExpression' || init.callee?.type !== 'Identifier' || init.callee.name !== '$props') return;
    for (const property of node.id.properties ?? []) {
      if (property.type !== 'Property') continue;
      const name = propertyName(property.key);
      if (name && !output.has(name)) output.set(name, { name, snippet: false, node: property });
    }
  });
  if (required && !exported) diagnostics.push(diagnostic('SB_PROP_UNRESOLVED', 'Eligible component must export a resolvable props type associated with its $props() annotation.', file));
  if (required && unresolved.size) diagnostics.push(diagnostic('SB_PROP_UNRESOLVED', `Component prop contract contains unsupported or unresolved type syntax: ${[...unresolved].sort().join(', ')}.`, file));
  return { props: output, hasNativeContract, nativeExcludedProps };
}

function detectsNativeAttributeForwarding(ast, hasNativeContract) {
  if (!hasNativeContract) return false;
  const restBindings = new Set();
  const declarations = [];
  walk(ast.instance?.content, (node) => {
    if (node.type === 'VariableDeclarator' && node.id?.type === 'Identifier' && node.init) declarations.push(node);
    if (node.type !== 'VariableDeclarator' || node.id?.type !== 'ObjectPattern') return;
    let init = node.init;
    while (init && ['TSAsExpression', 'TSTypeAssertion'].includes(init.type)) init = init.expression;
    if (init?.type !== 'CallExpression' || init.callee?.type !== 'Identifier' || init.callee.name !== '$props') return;
    for (const property of node.id.properties ?? []) {
      if (property.type === 'RestElement' && property.argument?.type === 'Identifier') restBindings.add(property.argument.name);
    }
  });
  const forwardedBindings = new Set(restBindings);
  const isDirectForwardingDerivation = (node) => {
    while (node && ['TSAsExpression', 'TSTypeAssertion', 'TSNonNullExpression', 'TSSatisfiesExpression'].includes(node.type)) node = node.expression;
    if (node?.type === 'Identifier') return forwardedBindings.has(node.name);
    if (node?.type !== 'CallExpression' || node.callee?.type !== 'Identifier' || node.callee.name !== '$derived' || node.arguments?.length !== 1) return false;
    let value = node.arguments[0];
    while (value && ['TSAsExpression', 'TSTypeAssertion', 'TSNonNullExpression', 'TSSatisfiesExpression'].includes(value.type)) value = value.expression;
    if (value?.type === 'Identifier') return forwardedBindings.has(value.name);
    return value?.type === 'CallExpression' && value.arguments?.some((argument) => argument.type === 'Identifier' && forwardedBindings.has(argument.name));
  };
  let changed = true;
  while (changed) {
    changed = false;
    for (const declaration of declarations) {
      if (forwardedBindings.has(declaration.id.name)) continue;
      if (isDirectForwardingDerivation(declaration.init)) {
        forwardedBindings.add(declaration.id.name);
        changed = true;
      }
    }
  }
  let forwards = false;
  walk(ast.fragment, (node) => {
    if (node.type === 'SpreadAttribute' && node.expression?.type === 'Identifier' && forwardedBindings.has(node.expression.name)) forwards = true;
  });
  return forwards;
}

function importsFromProgram(program) {
  const imports = [];
  if (!program) return imports;
  for (const statement of program.body ?? []) {
    if (statement.type === 'ExportAllDeclaration' || (statement.type === 'ExportNamedDeclaration' && statement.source)) {
      const runtimeSpecifiers = statement.type === 'ExportAllDeclaration' || (statement.specifiers ?? []).some((specifier) => specifier.exportKind !== 'type');
      if (statement.exportKind !== 'type' && runtimeSpecifiers) imports.push({
        specifier: statement.source.value,
        runtime: true,
        bindings: new Map(),
        importedNames: new Map(),
        node: statement,
      });
      continue;
    }
    if (statement.type !== 'ImportDeclaration') continue;
    const runtimeSpecifiers = (statement.specifiers ?? []).filter(
      (specifier) => statement.importKind !== 'type' && specifier.importKind !== 'type'
    );
    imports.push({
      specifier: statement.source.value,
      runtime: runtimeSpecifiers.length > 0 || (statement.specifiers ?? []).length === 0,
      bindings: new Map(runtimeSpecifiers.map((item) => [item.local.name, statement.source.value])),
      importedNames: new Map(runtimeSpecifiers.map((item) => [
        item.local.name,
        item.type === 'ImportSpecifier' ? (item.imported.name ?? item.imported.value) : 'default',
      ])),
      node: statement,
    });
  }
  return imports;
}

export function collectRuntimeImports(file, source) {
  const imports = [];
  if (file.endsWith('.svelte')) {
    const ast = parse(source, { modern: true, filename: file });
    for (const program of [ast.module?.content, ast.instance?.content].filter(Boolean)) {
      imports.push(...importsFromProgram(program).filter((item) => item.runtime).map((item) => ({ specifier: item.specifier, node: item.node })));
      walk(program, (node) => {
        if (node.type === 'ImportExpression') {
          const specifier = node.source?.type === 'Literal' && typeof node.source.value === 'string' ? node.source.value : null;
          imports.push({ specifier, node });
        } else if (node.type === 'CallExpression' && node.callee?.type === 'Identifier' && node.callee.name === 'require') {
          const argument = node.arguments?.[0];
          const specifier = node.arguments?.length === 1 && argument?.type === 'Literal' && typeof argument.value === 'string'
            ? argument.value
            : null;
          imports.push({ specifier, node });
        }
      });
    }
    return imports;
  }
  if (!/\.[cm]?[jt]sx?$/.test(file)) return imports;
  const script = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, scriptKind(file));
  const visit = (node) => {
    if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier)) {
      const clause = node.importClause;
      const runtime = !clause || (!clause.isTypeOnly && (Boolean(clause.name) || !clause.namedBindings || ts.isNamespaceImport(clause.namedBindings) || clause.namedBindings.elements.some((item) => !item.isTypeOnly)));
      if (runtime) imports.push({ specifier: node.moduleSpecifier.text, node });
    } else if (ts.isExportDeclaration(node) && node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) {
      const runtime = !node.isTypeOnly && (!node.exportClause || !ts.isNamedExports(node.exportClause) || node.exportClause.elements.some((item) => !item.isTypeOnly));
      if (runtime) imports.push({ specifier: node.moduleSpecifier.text, node });
    } else if (ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword) {
      const specifier = node.arguments.length === 1 && ts.isStringLiteral(node.arguments[0]) ? node.arguments[0].text : null;
      imports.push({ specifier, node });
    } else if (ts.isCallExpression(node) && ts.isIdentifier(node.expression) && node.expression.text === 'require') {
      const specifier = node.arguments.length === 1 && ts.isStringLiteral(node.arguments[0]) ? node.arguments[0].text : null;
      imports.push({ specifier, node });
    }
    ts.forEachChild(node, visit);
  };
  visit(script);
  return imports;
}

export function collectLiveNetworkCalls(file, source) {
  const names = new Set(['fetch', 'XMLHttpRequest', 'WebSocket', 'EventSource']);
  const browserGlobals = new Set(['window', 'globalThis', 'self']);
  const collectFromText = (text, kind = ts.ScriptKind.TS) => {
    const calls = [];
    const script = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, kind);
    const addBinding = (name, target) => {
      if (!name) return;
      if (ts.isIdentifier(name)) target.add(name.text);
      else if (ts.isObjectBindingPattern(name) || ts.isArrayBindingPattern(name)) for (const element of name.elements) if (ts.isBindingElement(element)) addBinding(element.name, target);
    };
    const statementBindings = (statements) => {
      const bindings = new Set();
      for (const statement of statements ?? []) {
        if (ts.isVariableStatement(statement)) for (const declaration of statement.declarationList.declarations) addBinding(declaration.name, bindings);
        if ((ts.isFunctionDeclaration(statement) || ts.isClassDeclaration(statement)) && statement.name) bindings.add(statement.name.text);
        if (ts.isImportDeclaration(statement) && statement.importClause && !statement.importClause.isTypeOnly) {
          if (statement.importClause.name) bindings.add(statement.importClause.name.text);
          const imported = statement.importClause.namedBindings;
          if (imported && ts.isNamespaceImport(imported)) bindings.add(imported.name.text);
          if (imported && ts.isNamedImports(imported)) for (const item of imported.elements) if (!item.isTypeOnly) bindings.add(item.name.text);
        }
      }
      return bindings;
    };
    const isBound = (name, scopes) => scopes.some((scope) => scope.has(name));
    const visit = (node, scopes) => {
      let activeScopes = scopes;
      if (ts.isSourceFile(node) || ts.isBlock(node) || ts.isModuleBlock(node)) activeScopes = [statementBindings(node.statements), ...activeScopes];
      if (ts.isFunctionLike(node)) {
        const bindings = new Set();
        for (const parameter of node.parameters ?? []) addBinding(parameter.name, bindings);
        if ((ts.isFunctionExpression(node) || ts.isFunctionDeclaration(node)) && node.name) bindings.add(node.name.text);
        activeScopes = [bindings, ...activeScopes];
      }
      if (ts.isCatchClause(node)) {
        const bindings = new Set();
        addBinding(node.variableDeclaration?.name, bindings);
        activeScopes = [bindings, ...activeScopes];
      }
      if (ts.isForStatement(node) || ts.isForInStatement(node) || ts.isForOfStatement(node)) {
        const initializer = node.initializer;
        if (initializer && ts.isVariableDeclarationList(initializer)) {
          const bindings = new Set();
          for (const declaration of initializer.declarations) addBinding(declaration.name, bindings);
          activeScopes = [bindings, ...activeScopes];
        }
      }
      if (ts.isCallExpression(node) || ts.isNewExpression(node)) {
        const expression = node.expression;
        if (ts.isIdentifier(expression) && names.has(expression.text) && !isBound(expression.text, activeScopes)) calls.push(node);
        const owner = (ts.isPropertyAccessExpression(expression) || ts.isElementAccessExpression(expression)) && ts.isIdentifier(expression.expression) ? expression.expression.text : null;
        const member = ts.isPropertyAccessExpression(expression)
          ? expression.name.text
          : ts.isElementAccessExpression(expression) && expression.argumentExpression && ts.isStringLiteral(expression.argumentExpression)
            ? expression.argumentExpression.text
            : null;
        if (owner && browserGlobals.has(owner) && !isBound(owner, activeScopes) && names.has(member)) calls.push(node);
      }
      ts.forEachChild(node, (child) => visit(child, activeScopes));
    };
    visit(script, []);
    return calls;
  };
  if (file.endsWith('.svelte')) {
    const ast = parse(source, { modern: true, filename: file });
    const scriptCalls = [ast.module?.content, ast.instance?.content]
      .filter(Boolean)
      .flatMap((program) => collectFromText(source.slice(program.start, program.end)));
    const templateCalls = [];
    const topBindings = new Set();
    const addPattern = (pattern, target) => {
      if (!pattern) return;
      if (pattern.type === 'Identifier') target.add(pattern.name);
      else if (pattern.type === 'ObjectPattern' || pattern.type === 'ArrayPattern') for (const item of pattern.properties ?? pattern.elements ?? []) {
        if (item?.type === 'Property') addPattern(item.value, target);
        else if (item?.type === 'RestElement') addPattern(item.argument, target);
        else addPattern(item, target);
      }
      else if (pattern.type === 'AssignmentPattern') addPattern(pattern.left, target);
    };
    const addStatements = (statements, target) => {
      for (const statement of statements ?? []) {
        if (statement.type === 'VariableDeclaration') for (const declaration of statement.declarations ?? []) addPattern(declaration.id, target);
        if ((statement.type === 'FunctionDeclaration' || statement.type === 'ClassDeclaration') && statement.id) addPattern(statement.id, target);
        if (statement.type === 'ImportDeclaration') for (const specifier of statement.specifiers ?? []) addPattern(specifier.local, target);
      }
    };
    for (const program of [ast.module?.content, ast.instance?.content].filter(Boolean)) addStatements(program.body, topBindings);
    const isBound = (name, scopes) => scopes.some((scope) => scope.has(name));
    const visitTemplate = (node, scopes = [topBindings]) => {
      if (!node || typeof node !== 'object') return;
      if (node.type === 'EachBlock') {
        visitTemplate(node.expression, scopes);
        const bindings = new Set();
        addPattern(node.context, bindings);
        if (node.index) bindings.add(node.index);
        visitTemplate(node.body, [bindings, ...scopes]);
        visitTemplate(node.fallback, scopes);
        return;
      }
      if (node.type === 'AwaitBlock') {
        visitTemplate(node.expression, scopes);
        visitTemplate(node.pending, scopes);
        const valueBindings = new Set();
        addPattern(node.value, valueBindings);
        visitTemplate(node.then, [valueBindings, ...scopes]);
        const errorBindings = new Set();
        addPattern(node.error, errorBindings);
        visitTemplate(node.catch, [errorBindings, ...scopes]);
        return;
      }
      if (node.type === 'SnippetBlock') {
        const bindings = new Set();
        for (const parameter of node.parameters ?? []) addPattern(parameter, bindings);
        visitTemplate(node.body, [bindings, ...scopes]);
        return;
      }
      let activeScopes = scopes;
      if (node.type === 'BlockStatement') {
        const bindings = new Set();
        addStatements(node.body, bindings);
        activeScopes = [bindings, ...activeScopes];
      }
      if (['FunctionDeclaration', 'FunctionExpression', 'ArrowFunctionExpression'].includes(node.type)) {
        const bindings = new Set();
        for (const parameter of node.params ?? []) addPattern(parameter, bindings);
        if (node.id) addPattern(node.id, bindings);
        activeScopes = [bindings, ...activeScopes];
      }
      if (node.type === 'CatchClause') {
        const bindings = new Set();
        addPattern(node.param, bindings);
        activeScopes = [bindings, ...activeScopes];
      }
      if (node.type === 'CallExpression' || node.type === 'NewExpression') {
        const expression = node.callee;
        if (expression?.type === 'Identifier' && names.has(expression.name) && !isBound(expression.name, activeScopes)) templateCalls.push(node);
        const owner = expression?.type === 'MemberExpression' && expression.object?.type === 'Identifier' ? expression.object.name : null;
        const member = expression?.type === 'MemberExpression'
          ? expression.computed ? propertyName(expression.property) : expression.property?.name
          : null;
        if (owner && browserGlobals.has(owner) && names.has(member) && !isBound(owner, activeScopes)) templateCalls.push(node);
      }
      for (const [key, value] of Object.entries(node)) {
        if (key === 'loc' || key === 'metadata' || key === 'parent') continue;
        if (Array.isArray(value)) for (const child of value) visitTemplate(child, activeScopes);
        else visitTemplate(value, activeScopes);
      }
    };
    visitTemplate(ast.fragment);
    return [...scriptCalls, ...templateCalls];
  }
  if (!/\.[cm]?[jt]sx?$/.test(file)) return [];
  return collectFromText(source, scriptKind(file));
}

export function containsStorybookMetadata(file, source) {
  if (file.endsWith('.svelte')) {
    let ast;
    try { ast = parse(source, { modern: true, filename: file }); }
    catch { return false; }
    let found = false;
    for (const program of [ast.module?.content, ast.instance?.content].filter(Boolean)) {
      const defineMetaBindings = new Set();
      for (const item of importsFromProgram(program)) {
        if (item.specifier !== '@storybook/addon-svelte-csf') continue;
        for (const [local, imported] of item.importedNames) if (imported === 'defineMeta') defineMetaBindings.add(local);
      }
      walk(program, (node) => {
        if (node.type === 'CallExpression' && node.callee?.type === 'Identifier' && defineMetaBindings.has(node.callee.name)) found = true;
      });
    }
    walk(ast.fragment, (node) => {
      if (node.type === 'Component' && node.name === 'Story') found = true;
    });
    return found;
  }
  if (!/\.[cm]?[jt]sx?$/.test(file)) return false;
  const script = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, scriptKind(file));
  const constants = new Map();
  for (const statement of script.statements) {
    if (!ts.isVariableStatement(statement)) continue;
    for (const declaration of statement.declarationList.declarations) {
      if (ts.isIdentifier(declaration.name) && declaration.initializer) constants.set(declaration.name.text, declaration.initializer);
    }
  }
  const resolve = (node, seen = new Set()) => {
    while (node && (ts.isAsExpression(node) || ts.isSatisfiesExpression(node) || ts.isParenthesizedExpression(node))) node = node.expression;
    if (node && ts.isIdentifier(node) && constants.has(node.text) && !seen.has(node.text)) return resolve(constants.get(node.text), new Set([...seen, node.text]));
    return node;
  };
  let hasMeta = false;
  let hasStoryExport = false;
  for (const statement of script.statements) {
    if (ts.isExportAssignment(statement) && !statement.isExportEquals) {
      const metadata = resolve(statement.expression);
      if (metadata && ts.isObjectLiteralExpression(metadata)) {
        const csfMetaKeys = new Set(['title', 'component', 'tags', 'parameters', 'decorators', 'args', 'argTypes', 'render']);
        hasMeta ||= metadata.properties.some((property) => property.name && csfMetaKeys.has(tsNameText(property.name, script)));
      }
    }
    if (!statement.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword)) continue;
    hasStoryExport ||= ts.isVariableStatement(statement) || ts.isFunctionDeclaration(statement) || ts.isClassDeclaration(statement);
  }
  return hasMeta && hasStoryExport;
}

export function collectParsedComments(file, source) {
  const comments = new Map();
  const add = (text, start, end) => {
    if (typeof start !== 'number' || typeof end !== 'number' || comments.has(start)) return;
    const before = source.slice(0, Math.max(start, end - 1));
    comments.set(start, { text, start, end, line: before.split(/\r?\n/).length });
  };
  if (file.endsWith('.svelte')) {
    const ast = parse(source, { modern: true, filename: file });
    for (const program of [ast.module?.content, ast.instance?.content].filter(Boolean)) walk(program, (node) => {
      if (node.type === 'Line' || node.type === 'Block') add(node.value, node.start, node.end);
    });
    walk(ast.fragment, (node) => {
      if (node.type === 'Comment') add(node.data, node.start, node.end);
      if (node.type === 'Line' || node.type === 'Block') add(node.value, node.start, node.end);
    });
    const css = ast.css?.content;
    if (css) {
      const text = source.slice(css.start, css.end);
      let quote = null;
      for (let index = 0; index < text.length; index += 1) {
        const character = text[index];
        if (quote) {
          if (character === '\\') index += 1;
          else if (character === quote) quote = null;
          continue;
        }
        if (character === '"' || character === "'") {
          quote = character;
          continue;
        }
        if (character !== '/' || text[index + 1] !== '*') continue;
        const close = text.indexOf('*/', index + 2);
        const end = close === -1 ? text.length : close + 2;
        add(text.slice(index + 2, close === -1 ? text.length : close), css.start + index, css.start + end);
        index = end - 1;
      }
    }
    return [...comments.values()];
  }
  if (!/\.[cm]?[jt]sx?$/.test(file)) return [];
  const scanner = ts.createScanner(ts.ScriptTarget.Latest, false, ts.LanguageVariant.Standard, source);
  for (let token = scanner.scan(); token !== ts.SyntaxKind.EndOfFileToken; token = scanner.scan()) {
    if (token !== ts.SyntaxKind.SingleLineCommentTrivia && token !== ts.SyntaxKind.MultiLineCommentTrivia) continue;
    const raw = scanner.getTokenText();
    add(token === ts.SyntaxKind.SingleLineCommentTrivia ? raw.slice(2) : raw.slice(2, -2), scanner.getTokenPos(), scanner.getTextPos());
  }
  return [...comments.values()];
}

function tsNameText(node, sourceFile) {
  if (ts.isIdentifier(node) || ts.isStringLiteral(node) || ts.isNumericLiteral(node)) return node.text;
  return node.getText(sourceFile).replace(/^['"]|['"]$/g, '');
}

function parseFile(root, file, diagnostics) {
  let source;
  try {
    source = readFileSync(path.join(root, file), 'utf8');
  } catch (error) {
    diagnostics.push(diagnostic('SB_SOURCE_MISSING', `Cannot read tracked Storybook source: ${error.message}`, file));
    return null;
  }
  try {
    const ast = parse(source, { modern: true, filename: file });
    const makeContext = (program) => {
      const imports = program ? importsFromProgram(program) : [];
      const bindingImports = new Map();
      const bindingImportedNames = new Map();
      for (const item of imports) {
        for (const [key, value] of item.bindings) bindingImports.set(key, value);
        for (const [key, value] of item.importedNames) bindingImportedNames.set(key, value);
      }
      // A binding still shadows the module scope when its value cannot be
      // resolved (for example, let or a subsequently mutated const).
      const bindings = new Set(bindingImports.keys());
      const addBinding = (pattern) => {
        if (!pattern) return;
        if (pattern.type === 'Identifier') bindings.add(pattern.name);
        else if (pattern.type === 'ObjectPattern' || pattern.type === 'ArrayPattern') {
          for (const item of pattern.properties ?? pattern.elements ?? []) {
            addBinding(item?.type === 'Property' ? item.value : item);
          }
        } else if (pattern.type === 'RestElement') addBinding(pattern.argument);
        else if (pattern.type === 'AssignmentPattern') addBinding(pattern.left);
      };
      for (const statement of program?.body ?? []) {
        const declaration = statement.type === 'ExportNamedDeclaration' ? statement.declaration : statement;
        if (declaration?.type === 'VariableDeclaration') {
          for (const item of declaration.declarations) addBinding(item.id);
        } else if (declaration?.type === 'FunctionDeclaration' || declaration?.type === 'ClassDeclaration') addBinding(declaration.id);
      }
      return { constants: program ? collectConstants(program) : new Map(), imports, bindingImports, bindingImportedNames, bindings };
    };
    const moduleContext = makeContext(ast.module?.content);
    const instanceContext = makeContext(ast.instance?.content);
    const mergeContextMap = (field) => new Map([
      ...[...moduleContext[field]].filter(([name]) => !instanceContext.bindings.has(name)),
      ...instanceContext[field],
    ]);
    const templateContext = {
      constants: createConstantScope(moduleContext.constants, instanceContext.constants, instanceContext.bindings),
      imports: [...moduleContext.imports, ...instanceContext.imports],
      bindingImports: mergeContextMap('bindingImports'),
      bindingImportedNames: mergeContextMap('bindingImportedNames'),
    };
    return {
      root,
      file,
      source,
      ast,
      moduleContext,
      instanceContext,
      templateContext,
      constants: templateContext.constants,
      imports: templateContext.imports,
      bindingImports: templateContext.bindingImports,
      bindingImportedNames: templateContext.bindingImportedNames,
    };
  } catch (error) {
    diagnostics.push(diagnostic('SB_SOURCE_PARSE', error.message, file, error));
    return null;
  }
}

function importedObject(record, node, context = record.templateContext) {
  if (node?.type !== 'Identifier') return null;
  const specifier = context.bindingImports.get(node.name);
  const importedName = context.bindingImportedNames.get(node.name);
  if ((!specifier?.startsWith('.') && !specifier?.startsWith('/')) || !importedName || importedName === 'default') return null;
  const file = resolveLocalImport(record.root, record.file, specifier, new Set());
  if (!file || !/\.[cm]?[jt]sx?$/.test(file)) return null;
  let source;
  try { source = readFileSync(path.join(record.root, file), 'utf8'); } catch { return null; }
  const script = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, scriptKind(file));
  const constants = new Map();
  const exportedConstants = new Set();
  for (const statement of script.statements) {
    if (!ts.isVariableStatement(statement) || (statement.declarationList.flags & ts.NodeFlags.Const) === 0) continue;
    const exported = statement.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword);
    for (const declaration of statement.declarationList.declarations) if (ts.isIdentifier(declaration.name) && declaration.initializer) {
      constants.set(declaration.name.text, declaration.initializer);
      if (exported) exportedConstants.add(declaration.name.text);
    }
  }
  const mutated = mutatedTopLevelTsConstants(script, new Set(constants.keys()));
  for (const name of mutated) constants.delete(name);
  return { file, source, script, constants, importedName, declaration: exportedConstants.has(importedName) ? constants.get(importedName) : undefined };
}

function collectAssetReferences(record, meta, storyNodes) {
  const references = [];
  const activeObjects = new Set();
  const objectResults = new Map();
  const position = (node) => {
    if (node?.loc?.start) return { line: node.loc.start.line, column: node.loc.start.column + 1 };
    const offset = typeof node?.start === 'number' ? node.start : 0;
    const before = record.source.slice(0, offset);
    return { line: before.split(/\r?\n/).length, column: offset - Math.max(before.lastIndexOf('\n'), before.lastIndexOf('\r')) };
  };
  const positionAt = (offset) => {
    const before = record.source.slice(0, offset);
    return { line: before.split(/\r?\n/).length, column: offset - Math.max(before.lastIndexOf('\n'), before.lastIndexOf('\r')) };
  };
  const scanStyleUrls = (text, offset, node) => {
    const pattern = /url\(\s*(?:(['"])(.*?)\1|([^)'"\s][^)]*))\s*\)/giu;
    for (const match of text.matchAll(pattern)) {
      const value = (match[2] ?? match[3] ?? '').trim();
      const location = positionAt(offset + (match.index ?? 0));
      if (value.includes('{') || value.includes('}')) references.push({ file: record.file, key: 'style url', node, ...location, unresolved: true, approvalTarget: `expression.style-url@${location.line}` });
      else references.push({ file: record.file, key: 'style url', value, node, ...location, unresolved: false });
    }
  };
  const add = (key, valueNode, node, context = record.templateContext) => {
    const value = evaluateStatic(valueNode, context.constants);
    if (typeof value === 'string') references.push({ file: record.file, key, value, node, ...position(node), unresolved: false });
    else if (value === UNRESOLVED && !['ObjectExpression', 'ArrayExpression'].includes(valueNode?.type)) {
      const imported = importedObject(record, valueNode, context);
      if (imported?.declaration) {
        const unwrap = (candidate) => {
          while (candidate && (ts.isAsExpression(candidate) || ts.isSatisfiesExpression(candidate) || ts.isParenthesizedExpression(candidate) || ts.isNonNullExpression(candidate))) candidate = candidate.expression;
          return candidate;
        };
        const stringValue = (candidate, resolving = new Set()) => {
          candidate = unwrap(candidate);
          if (ts.isStringLiteral(candidate) || ts.isNoSubstitutionTemplateLiteral(candidate)) return candidate.text;
          if (ts.isIdentifier(candidate) && imported.constants.has(candidate.text) && !resolving.has(candidate.text)) return stringValue(imported.constants.get(candidate.text), new Set([...resolving, candidate.text]));
          if (ts.isBinaryExpression(candidate) && candidate.operatorToken.kind === ts.SyntaxKind.PlusToken) {
            const left = stringValue(candidate.left, resolving);
            const right = stringValue(candidate.right, resolving);
            return typeof left === 'string' && typeof right === 'string' ? left + right : undefined;
          }
          return undefined;
        };
        const point = imported.script.getLineAndCharacterOfPosition(imported.declaration.getStart(imported.script));
        const location = { line: point.line + 1, column: point.character + 1 };
        const importedValue = stringValue(imported.declaration);
        if (typeof importedValue === 'string') references.push({ file: imported.file, key, value: importedValue, node: imported.declaration, ...location, unresolved: false });
        else references.push({ file: imported.file, key, node: imported.declaration, ...location, unresolved: true, approvalTarget: `binding.${imported.importedName}.${key}` });
        return;
      }
      const binding = valueNode?.type === 'Identifier' ? valueNode.name : null;
      const location = position(node);
      references.push({ file: record.file, key, node, ...location, unresolved: true, approvalTarget: binding ? `binding.${binding}.${key}` : `expression.${key}@${location.line}` });
    }
  };
  const scanObject = (node, context = record.templateContext, resolving = new Set()) => {
    while (node && ['TSAsExpression', 'TSTypeAssertion', 'TSNonNullExpression', 'TSSatisfiesExpression'].includes(node.type)) node = node.expression;
    if (!node) return false;
    if (node.type === 'Identifier') {
      const binding = resolveConstant(node.name, context.constants);
      if (!binding.node || resolving.has(binding.node)) return false;
      const bindingContext = binding.constants === record.moduleContext.constants ? record.moduleContext : context;
      return scanObject(binding.node, bindingContext, new Set([...resolving, binding.node]));
    }
    if (node.type !== 'ObjectExpression') return false;
    if (objectResults.has(node)) return objectResults.get(node);
    if (activeObjects.has(node)) return false;
    activeObjects.add(node);
    let resolved = true;
    for (const property of node.properties ?? []) {
      if (property.type === 'SpreadElement') resolved = scanObject(property.argument, context, resolving) && resolved;
      else if (property.type === 'Property' && !property.computed) {
        const key = propertyName(property.key);
        if (ASSET_KEYS.has(key)) add(key, property.value, property, context);
        else scanObject(property.value, context, resolving);
      } else resolved = false;
    }
    activeObjects.delete(node);
    objectResults.set(node, resolved);
    return resolved;
  };
  const scanImportedObject = (node, context = record.templateContext) => {
    const imported = importedObject(record, node, context);
    if (!imported?.declaration) return false;
    const { file, script, constants, importedName } = imported;
    const seen = new Set();
    const positionTs = (value) => {
      const point = script.getLineAndCharacterOfPosition(value.getStart(script));
      return { line: point.line + 1, column: point.character + 1 };
    };
    const unwrap = (value) => {
      while (value && (ts.isAsExpression(value) || ts.isSatisfiesExpression(value) || ts.isParenthesizedExpression(value) || ts.isNonNullExpression(value))) value = value.expression;
      return value;
    };
    const stringValue = (value, resolving = new Set()) => {
      value = unwrap(value);
      if (ts.isStringLiteral(value) || ts.isNoSubstitutionTemplateLiteral(value)) return value.text;
      if (ts.isIdentifier(value) && constants.has(value.text) && !resolving.has(value.text)) return stringValue(constants.get(value.text), new Set([...resolving, value.text]));
      if (ts.isBinaryExpression(value) && value.operatorToken.kind === ts.SyntaxKind.PlusToken) {
        const left = stringValue(value.left, resolving);
        const right = stringValue(value.right, resolving);
        return typeof left === 'string' && typeof right === 'string' ? left + right : undefined;
      }
      return undefined;
    };
    const addTs = (key, value, owner) => {
      const staticValue = stringValue(value);
      const location = positionTs(owner);
      if (typeof staticValue === 'string') references.push({ file, key, value: staticValue, node: owner, ...location, unresolved: false });
      else references.push({ file, key, node: owner, ...location, unresolved: true, approvalTarget: `binding.${importedName}.${key}` });
    };
    const scan = (value) => {
      value = unwrap(value);
      if (!value) return false;
      if (ts.isIdentifier(value)) {
        if (seen.has(value.text) || !constants.has(value.text)) return false;
        seen.add(value.text);
        const resolved = scan(constants.get(value.text));
        seen.delete(value.text);
        return resolved;
      }
      if (!ts.isObjectLiteralExpression(value)) return false;
      let resolved = true;
      for (const property of value.properties) {
        if (ts.isSpreadAssignment(property)) resolved = scan(property.expression) && resolved;
        else if (ts.isPropertyAssignment(property) || ts.isShorthandPropertyAssignment(property)) {
          const key = property.name.getText(script).replace(/^['"]|['"]$/g, '');
          const initializer = ts.isShorthandPropertyAssignment(property) ? property.name : property.initializer;
          if (ASSET_KEYS.has(key)) addTs(key, initializer, property);
          else scan(initializer);
        } else resolved = false;
      }
      return resolved;
    };
    return scan(imported.declaration);
  };
  for (const value of record.moduleContext.constants.values()) scanObject(value, record.moduleContext);
  for (const value of record.instanceContext.constants.values()) scanObject(value, record.templateContext);
  const metaArgs = objectProperty(meta, 'args')?.value;
  scanObject(metaArgs, record.moduleContext);
  scanImportedObject(metaArgs, record.moduleContext);
  for (const storyNode of storyNodes) {
    const args = attributeExpression(attribute(storyNode, 'args'));
    scanObject(args, record.templateContext);
    scanImportedObject(args, record.templateContext);
  }
  const scanScenarioCall = (node) => {
    if (node.type === 'CallExpression' && node.callee?.type === 'Identifier' && node.callee.name === 'setDebugScenario') scanObject(node.arguments?.[1], record.templateContext);
  };
  walk(record.ast.instance?.content, scanScenarioCall);
  walk(record.ast.fragment, scanScenarioCall);
  walk(record.ast.fragment, (node) => {
    for (const item of node.attributes ?? []) {
      if (item.type === 'Attribute' && item.name === 'style') {
        if (Array.isArray(item.value) && item.value.length === 1 && item.value[0].type === 'Text') scanStyleUrls(item.value[0].data, item.value[0].start ?? item.start ?? node.start ?? 0, item);
        else {
          const value = evaluateStatic(attributeExpression(item), record.templateContext.constants);
          if (typeof value === 'string') scanStyleUrls(value, item.start ?? node.start ?? 0, item);
        }
      }
      if (item.type === 'Attribute' && ASSET_KEYS.has(item.name)) {
        if (Array.isArray(item.value) && item.value.length === 1 && item.value[0].type === 'Text') references.push({ file: record.file, key: item.name, value: item.value[0].data, node: item, ...position(item), unresolved: false });
        else add(item.name, attributeExpression(item), item, record.templateContext);
        continue;
      }
      if (item.type !== 'SpreadAttribute') continue;
      const nativeAssetElement = node.type === 'RegularElement' && ['img', 'source', 'video', 'audio'].includes(node.name);
      const componentSpecifier = node.type === 'Component' ? record.bindingImports.get(node.name) : undefined;
      const imageComponent = componentSpecifier?.endsWith('/Image.svelte');
      if (!nativeAssetElement && !imageComponent) continue;
      const localResolved = scanObject(item.expression, record.templateContext);
      const importedResolved = scanImportedObject(item.expression, record.templateContext);
      const isApprovedImageFlow = record.file === 'src/stories/Image.stories.svelte' && item.expression?.type === 'Identifier' && item.expression.name === 'debugImageProps';
      if (!localResolved && !importedResolved && !isApprovedImageFlow) {
        const location = position(item);
        const binding = item.expression?.type === 'Identifier' ? item.expression.name : null;
        references.push({ file: record.file, key: 'asset spread', node: item, ...location, unresolved: true, approvalTarget: binding ? `binding.${binding}.*` : `expression.asset-spread@${location.line}` });
      }
    }
  });
  walk(record.ast.css, (node) => {
    if (node.type !== 'Declaration') return;
    const start = node.start ?? record.ast.css?.content?.start ?? 0;
    scanStyleUrls(record.source.slice(start, node.end ?? start), start, node);
  });
  return references;
}

export function collectSvelteAssetReferences(root, file) {
  if (!file.endsWith('.svelte')) return [];
  const record = parseFile(root, file, []);
  if (!record) return [];
  return collectAssetReferences(record, null, []);
}

function importedObjectKeys(record, node, context) {
  const imported = importedObject(record, node, context);
  if (!imported) return null;
  const { script, constants, importedName, declaration } = imported;
  const keys = [];
  const resolve = (value, seen = new Set()) => {
    while (ts.isAsExpression(value) || ts.isSatisfiesExpression(value) || ts.isParenthesizedExpression(value)) value = value.expression;
    if (ts.isIdentifier(value)) {
      if (seen.has(value.text) || !constants.has(value.text)) return false;
      return resolve(constants.get(value.text), new Set([...seen, value.text]));
    }
    if (!ts.isObjectLiteralExpression(value)) return false;
    for (const property of value.properties) {
      if (ts.isSpreadAssignment(property)) {
        if (!resolve(property.expression, seen)) return false;
      } else if (ts.isPropertyAssignment(property) || ts.isShorthandPropertyAssignment(property)) {
        keys.push(property.name.getText(script).replace(/^['"]|['"]$/g, ''));
      } else return false;
    }
    return true;
  };
  if (!declaration || !resolve(declaration, new Set([importedName]))) return { keys: [], unresolved: true };
  return { keys, unresolved: false };
}

function objectKeys(record, node, context = record.templateContext) {
  const local = staticObjectKeys(node, context.constants);
  if (!local.unresolved) return local;
  return importedObjectKeys(record, node, context) ?? local;
}

function parseArgTypes(node, constants, diagnostics, file) {
  const entries = new Map();
  const partialValue = (valueNode, seen = new Set()) => {
    const value = evaluateStatic(valueNode, constants, seen);
    if (value !== UNRESOLVED) return value;
    while (valueNode && ['TSAsExpression', 'TSTypeAssertion', 'TSNonNullExpression', 'TSSatisfiesExpression'].includes(valueNode.type)) valueNode = valueNode.expression;
    if (valueNode?.type === 'Identifier') {
      const binding = resolveConstant(valueNode.name, constants);
      if (binding.node && !seen.has(binding.node)) return partialValue(binding.node, new Set([...seen, binding.node]));
    }
    if (valueNode?.type !== 'ObjectExpression') return UNRESOLVED;
    const output = {};
    for (const property of valueNode.properties) {
      if (property.type !== 'Property' || property.computed) continue;
      const key = propertyName(property.key);
      const child = partialValue(property.value, seen);
      if (key !== null && child !== UNRESOLVED) output[key] = child;
    }
    return output;
  };
  if (!node) return entries;
  if (node.type !== 'ObjectExpression') {
    diagnostics.push(diagnostic('SB_CSF_UNRESOLVED', 'defineMeta.argTypes must be one static object literal.', file, node));
    return entries;
  }
  for (const item of node.properties) {
    if (item.type !== 'Property' || item.computed) {
      diagnostics.push(diagnostic('SB_CSF_UNRESOLVED', 'defineMeta.argTypes cannot contain spreads, computed keys, or methods.', file, item));
      continue;
    }
    const name = propertyName(item.key);
    if (!name) continue;
    if (entries.has(name)) diagnostics.push(diagnostic('SB_CSF_DUPLICATE', `Duplicate argTypes key "${name}".`, file, item));
    const value = partialValue(item.value);
    entries.set(name, { name, node: item, value: value === UNRESOLVED ? {} : value });
  }
  return entries;
}

function resolveLocalExpression(node, constants, seen = new Set()) {
  while (node && ['TSAsExpression', 'TSTypeAssertion', 'TSNonNullExpression', 'TSSatisfiesExpression'].includes(node.type)) node = node.expression;
  if (node?.type === 'Identifier') {
    const binding = resolveConstant(node.name, constants);
    if (binding.node && !seen.has(binding.node)) return resolveLocalExpression(binding.node, binding.constants, new Set([...seen, binding.node]));
  }
  return node;
}

function parseControlInclude(record, parametersNode, diagnostics, label, ownerNode, context = record.templateContext) {
  if (!parametersNode) return [];
  const parameters = evaluateStatic(parametersNode, context.constants);
  let include;
  if (parameters !== UNRESOLVED && parameters && !Array.isArray(parameters) && typeof parameters === 'object') include = parameters.controls?.include;
  else {
    const resolved = resolveLocalExpression(parametersNode, context.constants);
    if (resolved?.type !== 'ObjectExpression') {
      diagnostics.push(diagnostic('SB_CSF_UNRESOLVED', `${label} parameters cannot be inspected for controls.`, record.file, ownerNode));
      return [];
    }
    const controlsProperty = objectProperty(resolved, 'controls');
    if (!controlsProperty) {
      if (resolved.properties.some((item) => item.type === 'SpreadElement')) diagnostics.push(diagnostic('SB_CSF_UNRESOLVED', `${label} parameters contain an unresolved spread that may configure controls.`, record.file, ownerNode));
      return [];
    }
    const controls = evaluateStatic(controlsProperty.value, context.constants);
    if (controls === UNRESOLVED || !controls || Array.isArray(controls) || typeof controls !== 'object') {
      diagnostics.push(diagnostic('SB_CSF_UNRESOLVED', `${label} parameters.controls must be a static object.`, record.file, controlsProperty));
      return [];
    }
    include = controls.include;
  }
  if (include === undefined) return [];
  if (!Array.isArray(include) || include.some((item) => typeof item !== 'string')) {
    diagnostics.push(diagnostic('SB_CSF_UNRESOLVED', `${label} parameters.controls.include must be a static array of strings.`, record.file, ownerNode));
    return [];
  }
  return include;
}

function parseStoryControls(record, node, diagnostics) {
  const parametersAttribute = attribute(node, 'parameters');
  return parseControlInclude(record, attributeExpression(parametersAttribute), diagnostics, 'Story', parametersAttribute);
}

function parseStory(record, node, title, metaId, diagnostics) {
  const nameAttribute = attribute(node, 'name');
  const exportAttribute = attribute(node, 'exportName');
  const name = attributeString(nameAttribute, record.constants);
  const explicitExport = attributeString(exportAttribute, record.constants);
  if ((nameAttribute && typeof name !== 'string') || (exportAttribute && typeof explicitExport !== 'string')) return { node, unresolved: true, args: { keys: [], unresolved: false } };
  if (!name && !explicitExport) return { node, unresolved: true, args: { keys: [], unresolved: false } };
  const exportName = explicitExport ?? implicitExportName(name);
  try { new Function(exportName, `var ${exportName}`); }
  catch { return { node, unresolved: true, args: { keys: [], unresolved: false } }; }
  const displayName = name ?? storyNameFromExport(exportName);
  const argsAttribute = attribute(node, 'args');
  const args = argsAttribute
    ? objectKeys(record, attributeExpression(argsAttribute))
    : { keys: [], unresolved: false };
  return {
    node,
    name: displayName,
    exportName,
    id: toId(metaId ?? title, storyNameFromExport(exportName)),
    args,
    controlInclude: parseStoryControls(record, node, diagnostics),
    unresolved: false,
    asChild: Boolean(attribute(node, 'asChild')),
  };
}

function parseStoryFile(record, diagnostics) {
  let metaCall;
  let storyBinding = false;
  walk(record.ast.module?.content, (node) => {
    if (node.type === 'CallExpression' && node.callee?.type === 'Identifier' && node.callee.name === 'defineMeta') {
      if (metaCall) diagnostics.push(diagnostic('SB_CSF_DUPLICATE', 'Story file contains more than one defineMeta call.', record.file, node));
      else metaCall = node;
    }
  });
  if (!metaCall || metaCall.arguments?.[0]?.type !== 'ObjectExpression') {
    diagnostics.push(diagnostic('SB_CSF_UNRESOLVED', 'Story metadata must be one static defineMeta object.', record.file, metaCall));
    return null;
  }
  const defineMetaImport = record.moduleContext.imports.some((item) =>
    item.runtime && item.specifier === '@storybook/addon-svelte-csf' && item.bindings.get('defineMeta') === item.specifier && item.importedNames.get('defineMeta') === 'defineMeta'
  );
  if (!defineMetaImport) diagnostics.push(diagnostic('SB_CSF_UNRESOLVED', 'defineMeta must be a runtime named import from @storybook/addon-svelte-csf.', record.file, metaCall));
  walk(record.ast.module?.content, (node) => {
    if (node.type !== 'VariableDeclarator' || node.init !== metaCall || node.id?.type !== 'ObjectPattern') return;
    storyBinding = node.id.properties?.some((property) =>
      property.type === 'Property' && propertyName(property.key) === 'Story' && property.value?.type === 'Identifier' && property.value.name === 'Story'
    );
  });
  if (!storyBinding) diagnostics.push(diagnostic('SB_CSF_UNRESOLVED', 'Story must be destructured from the inspected defineMeta call.', record.file, metaCall));
  const meta = metaCall.arguments[0];
  const metaKeys = new Set();
  for (const item of meta.properties) {
    if (item.type !== 'Property' || item.computed) {
      diagnostics.push(diagnostic('SB_CSF_UNRESOLVED', 'defineMeta metadata cannot contain spreads, computed keys, or methods.', record.file, item));
      continue;
    }
    const name = propertyName(item.key);
    if (!name) continue;
    if (metaKeys.has(name)) diagnostics.push(diagnostic('SB_CSF_DUPLICATE', `Duplicate defineMeta key "${name}".`, record.file, item));
    metaKeys.add(name);
  }
  const titleValue = evaluateStatic(objectProperty(meta, 'title')?.value, record.moduleContext.constants);
  const idValue = evaluateStatic(objectProperty(meta, 'id')?.value, record.moduleContext.constants);
  const tagsValue = evaluateStatic(objectProperty(meta, 'tags')?.value, record.moduleContext.constants);
  const componentNode = objectProperty(meta, 'component')?.value;
  const componentImport = componentNode?.type === 'Identifier'
    ? record.moduleContext.imports.find((item) => item.runtime && item.bindings.has(componentNode.name))
    : undefined;
  const componentSpecifier = componentImport?.bindings.get(componentNode.name);
  const componentPath = componentSpecifier
    ? resolveLocalImport(record.root, record.file, componentSpecifier, new Set())
    : undefined;
  const metaArgsProperty = objectProperty(meta, 'args');
  const metaArgs = metaArgsProperty
    ? objectKeys(record, metaArgsProperty.value, record.moduleContext)
    : { keys: [], unresolved: false };
  const idProperty = objectProperty(meta, 'id');
  if (idProperty && (typeof idValue !== 'string' || !idValue.trim())) diagnostics.push(diagnostic('SB_CSF_UNRESOLVED', 'defineMeta.id must be a static non-empty string when present.', record.file, idProperty));
  const argTypes = parseArgTypes(objectProperty(meta, 'argTypes')?.value, record.moduleContext.constants, diagnostics, record.file);
  const parametersProperty = objectProperty(meta, 'parameters');
  const controlInclude = parseControlInclude(record, parametersProperty?.value, diagnostics, 'Metadata', parametersProperty, record.moduleContext);
  const stories = [];
  const storyNodes = [];
  walk(record.ast.fragment, (node) => {
    if (node.type === 'Component' && node.name === 'Story') {
      storyNodes.push(node);
      stories.push(parseStory(record, node, typeof titleValue === 'string' ? titleValue : '', typeof idValue === 'string' ? idValue : undefined, diagnostics));
    }
  });
  return {
    ...record,
    meta,
    title: typeof titleValue === 'string' ? titleValue : undefined,
    metaId: typeof idValue === 'string' ? idValue : undefined,
    tags: Array.isArray(tagsValue) ? tagsValue : [],
    hasComponentMetadata: Boolean(componentNode),
    componentBinding: componentNode?.name,
    componentSpecifier,
    componentPath,
    metaArgs,
    argTypes,
    controlInclude,
    stories,
    assetReferences: collectAssetReferences(record, meta, storyNodes),
    docsId: typeof titleValue === 'string' ? toId(typeof idValue === 'string' ? idValue : titleValue, 'Docs') : undefined,
  };
}

export function loadSourceModel(root) {
  const diagnostics = [];
  let inventory;
  try {
    inventory = getGitInventory(root);
  } catch (error) {
    diagnostics.push(diagnostic('SB_DISCOVERY_GIT', `Unable to enumerate Git files: ${error.message}`, '<repository>'));
    return { root, diagnostics, stories: [], components: new Map(), inventory: { trackedPaths: new Set(), untrackedCandidatePaths: new Set() } };
  }
  const all = new Set([...inventory.trackedPaths, ...inventory.untrackedCandidatePaths]);
  const storyPaths = [...all].filter((file) => STORY_RE.test(file)).sort();
  const componentPaths = [...all].filter((file) => COMPONENT_RE.test(file)).sort();
  const components = new Map();
  for (const file of componentPaths) {
    const record = parseFile(root, file, diagnostics);
    if (record) {
      const contract = collectOwnedProps(record.source, record.ast, file, root, diagnostics);
      components.set(file, {
        ...record,
        props: contract.props,
        nativeExcludedProps: contract.nativeExcludedProps,
        forwardsNativeAttributes: detectsNativeAttributeForwarding(record.ast, contract.hasNativeContract),
      });
    }
  }
  const stories = [];
  for (const file of storyPaths) {
    const record = parseFile(root, file, diagnostics);
    if (!record) continue;
    const story = parseStoryFile(record, diagnostics);
    if (story) stories.push(story);
  }
  // Primary metadata may intentionally point at a story-only Svelte helper.
  for (const story of stories) {
    if (!story.componentPath || components.has(story.componentPath) || !story.componentPath.endsWith('.svelte')) continue;
    const record = parseFile(root, story.componentPath, diagnostics);
    if (record) {
      const contract = collectOwnedProps(record.source, record.ast, story.componentPath, root, diagnostics, false);
      components.set(story.componentPath, {
        ...record,
        eligible: false,
        props: contract.props,
        nativeExcludedProps: contract.nativeExcludedProps,
        forwardsNativeAttributes: detectsNativeAttributeForwarding(record.ast, contract.hasNativeContract),
      });
    }
  }
  return { root, diagnostics, stories, components, eligibleComponentPaths: new Set(componentPaths), inventory, allPaths: all };
}

export { STORY_RE, COMPONENT_RE, implicitExportName, objectProperty };
