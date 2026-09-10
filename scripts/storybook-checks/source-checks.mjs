import { builtinModules } from 'node:module';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
import { diagnostic } from './diagnostics.mjs';
import { canonicalRepoPath, resolveLocalImport } from './paths.mjs';
import { loadRegistry } from './registry.mjs';
import { collectLiveNetworkCalls, collectParsedComments, collectRuntimeImports, collectSvelteAssetReferences, containsStorybookMetadata, loadSourceModel, mutatedTopLevelTsConstants, objectProperty, STORY_RE, walk } from './source-model.mjs';
import { staticObjectKeys } from './static-value.mjs';

const ATOMIC_ROOTS = ['Brand', 'Foundations', 'Atoms', 'Molecules', 'Organisms', 'Templates'];
const RUNTIME_ALLOWLIST = new Set(['svelte', '@storybook/addon-svelte-csf']);
const NODE_BUILTINS = new Set([...builtinModules, ...builtinModules.map((item) => `node:${item}`)]);
const PROHIBITED_RUNTIME_SPECIFIERS = new Set(['astro:content', 'astro:env/server']);
const ASSET_KEYS = new Set(['src', 'srcset', 'fallbackSrc', 'fallbackSrcset', 'poster']);

function read(root, file, diagnostics) {
  try { return readFileSync(path.join(root, file), 'utf8'); }
  catch (error) {
    diagnostics.push(diagnostic('SB_CFG_MISSING', `Cannot read required file: ${error.message}`, file));
    return '';
  }
}

function tsName(node) {
  if (ts.isIdentifier(node) || ts.isStringLiteral(node) || ts.isNumericLiteral(node)) return node.text;
  return null;
}

function parseExportedConfig(source, file, diagnostics) {
  const parsed = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  for (const error of parsed.parseDiagnostics) diagnostics.push(diagnostic('SB_CFG_PARSE', ts.flattenDiagnosticMessageText(error.messageText, '\n'), file));
  const constants = new Map();
  let exported;
  for (const statement of parsed.statements) {
    if (ts.isVariableStatement(statement) && (statement.declarationList.flags & ts.NodeFlags.Const) !== 0) for (const declaration of statement.declarationList.declarations) {
      if (ts.isIdentifier(declaration.name) && declaration.initializer) constants.set(declaration.name.text, declaration.initializer);
    }
    if (ts.isExportAssignment(statement) && !statement.isExportEquals) exported = statement.expression;
  }
  const mutatedConstants = mutatedTopLevelTsConstants(parsed, new Set(constants.keys()));
  for (const name of mutatedConstants) constants.delete(name);
  const resolve = (node, seen = new Set()) => {
    while (node && (ts.isAsExpression(node) || ts.isSatisfiesExpression(node) || ts.isParenthesizedExpression(node))) node = node.expression;
    if (node && ts.isIdentifier(node) && constants.has(node.text) && !seen.has(node.text)) return resolve(constants.get(node.text), new Set([...seen, node.text]));
    return node;
  };
  const value = (node, seen = new Set()) => {
    node = resolve(node, seen);
    if (!node) return undefined;
    if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node) || ts.isNumericLiteral(node)) return node.text;
    if (node.kind === ts.SyntaxKind.TrueKeyword) return true;
    if (node.kind === ts.SyntaxKind.FalseKeyword) return false;
    if (ts.isArrayLiteralExpression(node)) return node.elements.map((item) => value(item, seen));
    if (!ts.isObjectLiteralExpression(node)) return undefined;
    const output = {};
    const keys = new Set();
    for (const property of node.properties) {
      if (ts.isPropertyAssignment(property)) {
        const name = tsName(property.name);
        if (name === null) diagnostics.push(diagnostic('SB_CFG_VALUE', 'Configuration keys must be static identifiers or literals.', file));
        else {
          if (keys.has(name)) diagnostics.push(diagnostic('SB_CFG_VALUE', `Configuration object contains duplicate key "${name}".`, file));
          keys.add(name);
          output[name] = value(property.initializer, seen);
        }
      } else if (ts.isShorthandPropertyAssignment(property)) {
        if (keys.has(property.name.text)) diagnostics.push(diagnostic('SB_CFG_VALUE', `Configuration object contains duplicate key "${property.name.text}".`, file));
        keys.add(property.name.text);
        output[property.name.text] = value(property.name, seen);
      }
      else if (ts.isSpreadAssignment(property)) {
        const spread = value(property.expression, seen);
        if (spread && typeof spread === 'object' && !Array.isArray(spread)) Object.assign(output, spread);
        else diagnostics.push(diagnostic('SB_CFG_VALUE', 'Configuration spreads must resolve to static object values.', file));
      }
    }
    return output;
  };
  const config = value(exported);
  if (!config || Array.isArray(config) || typeof config !== 'object') diagnostics.push(diagnostic('SB_CFG_VALUE', 'Default export must resolve to a static configuration object.', file));
  return config ?? {};
}

function checkConfiguration(model, diagnostics) {
  const main = read(model.root, '.storybook/main.ts', diagnostics);
  const preview = read(model.root, '.storybook/preview.ts', diagnostics);
  const storyPattern = '../src/stories/**/*.stories.svelte';
  const mainConfig = parseExportedConfig(main, '.storybook/main.ts', diagnostics);
  const previewConfig = parseExportedConfig(preview, '.storybook/preview.ts', diagnostics);
  if (!Array.isArray(mainConfig.stories) || mainConfig.stories.length !== 1 || mainConfig.stories[0] !== storyPattern) diagnostics.push(diagnostic('SB_CFG_VALUE', `Storybook stories must be exactly ["${storyPattern}"].`, '.storybook/main.ts'));
  for (const required of ['@storybook/addon-svelte-csf', '@storybook/addon-docs', '@storybook/addon-a11y', '@storybook/svelte-vite']) {
    const present = required === '@storybook/svelte-vite' ? mainConfig.framework?.name === required : mainConfig.addons?.includes(required);
    if (!present) diagnostics.push(diagnostic('SB_CFG_VALUE', `Storybook must preserve "${required}".`, '.storybook/main.ts'));
  }
  if (mainConfig.framework?.options?.docgen !== false) diagnostics.push(diagnostic('SB_CFG_VALUE', 'Storybook framework options must preserve docgen: false.', '.storybook/main.ts'));
  const viewports = previewConfig.parameters?.viewport?.options ?? {};
  for (const [key, name, width, height] of [['compact', 'Compact', 430, 932], ['medium', 'Medium', 744, 1133], ['extended', 'Extended', 1024, 1366], ['large', 'Large', 1512, 982]]) {
    const viewport = viewports[key];
    if (!viewport || !String(viewport.name ?? '').startsWith(name) || viewport.styles?.width !== `${width}px` || viewport.styles?.height !== `${height}px`) diagnostics.push(diagnostic('SB_CFG_VALUE', `Preview must preserve ${name} viewport ${width}x${height}.`, '.storybook/preview.ts'));
  }
  const initialViewport = previewConfig.initialGlobals?.viewport;
  if (initialViewport?.value !== 'large' || initialViewport?.isRotated !== false) diagnostics.push(diagnostic('SB_CFG_VALUE', 'Preview must initialize the Large viewport without rotation.', '.storybook/preview.ts'));
  const order = previewConfig.parameters?.options?.storySort?.order;
  if (!Array.isArray(order) || ATOMIC_ROOTS.some((root, index) => order[index] !== root)) diagnostics.push(diagnostic('SB_CFG_VALUE', `Preview storySort must begin with Atomic roots in order: ${ATOMIC_ROOTS.join(', ')}.`, '.storybook/preview.ts'));
}

function checkStoryLikeFiles(model, diagnostics) {
  for (const file of model.allPaths ?? []) {
    if (STORY_RE.test(file) || file.startsWith('scripts/storybook-checks/fixtures/') || !/\.(?:svelte|[cm]?[jt]sx?)$/.test(file)) continue;
    if (/\.stories\.(?:svelte|[cm]?[jt]sx?)$/.test(file)) {
      diagnostics.push(diagnostic('SB_DISCOVERY_EXCLUDED', 'Story-like file is outside src/stories/**/*.stories.svelte.', file));
      continue;
    }
    let source;
    try { source = readFileSync(path.join(model.root, file), 'utf8'); } catch { continue; }
    if (containsStorybookMetadata(file, source)) diagnostics.push(diagnostic('SB_DISCOVERY_EXCLUDED', 'Story-like file is outside src/stories/**/*.stories.svelte.', file));
  }
}

function subjectProps(subjects, model) {
  const props = new Map();
  for (const subject of subjects) {
    const component = model.components.get(subject);
    for (const [name, value] of component?.props ?? []) {
      const existing = props.get(name);
      props.set(name, { ...value, snippet: existing ? existing.snippet && value.snippet : value.snippet, subjects: [...(existing?.subjects ?? []), subject] });
    }
  }
  return props;
}

function argTypeExplanation(entry) {
  const value = entry?.value ?? {};
  return typeof value.description === 'string' ? value.description.trim() : '';
}

function hasFalseControl(entry) {
  return entry?.value?.control === false;
}

function argTypeOmissions(story, diagnostics) {
  const omissions = new Map();
  const moduleStart = story.ast.module?.content?.start ?? 0;
  const moduleEnd = story.ast.module?.content?.end ?? 0;
  let comments = [];
  try { comments = collectParsedComments(story.file, story.source); }
  catch { comments = []; }
  for (const comment of comments) {
    if (comment.start < moduleStart || comment.end > moduleEnd || story.source.slice(comment.start, comment.start + 2) !== '//') continue;
    const value = comment.text.trim();
    if (!/^storybook-check: omit-argtype\b/.test(value)) continue;
    const match = value.match(/^storybook-check: omit-argtype\s+([A-Za-z_$][\w$-]*)\s+--\s+(\S(?:.*\S)?)\s*$/);
    if (!match) {
      diagnostics.push({ code: 'SB_ARGTYPE_OMISSION_INVALID', file: story.file, line: comment.line, column: 1, message: 'argTypes omission must name one prop and include a non-empty reason after "--".' });
      continue;
    }
    const [, prop, reason] = match;
    if (omissions.has(prop)) diagnostics.push({ code: 'SB_ARGTYPE_OMISSION_DUPLICATE', file: story.file, line: comment.line, column: 1, message: `Duplicate argTypes omission for "${prop}".` });
    else omissions.set(prop, { prop, reason, line: comment.line });
  }
  return omissions;
}

function checkStories(model, registry, diagnostics) {
  const byTitle = new Map(model.stories.filter((story) => story.title).map((story) => [story.title, story]));
  const coverage = new Set();
  const exceptionsBySource = new Map();
  for (const exception of registry?.exceptions ?? []) {
    if (!exception || typeof exception !== 'object') continue;
    if (exceptionsBySource.has(exception.source)) diagnostics.push(diagnostic('SB_REGISTRY_STALE', `Multiple exceptions target source "${exception.source}".`, '.storybook/inventory.json'));
    else exceptionsBySource.set(exception.source, exception);
  }
  const allIds = new Set();
  const usedExceptions = new Set();

  for (const story of model.stories) {
    if (story.docsId) {
      if (allIds.has(story.docsId)) diagnostics.push(diagnostic('SB_CSF_DUPLICATE', `Duplicate generated Docs ID "${story.docsId}".`, story.file, story.meta));
      allIds.add(story.docsId);
    }
    if (!story.title) diagnostics.push(diagnostic('SB_CSF_UNRESOLVED', 'defineMeta.title must be a static non-empty string.', story.file, story.meta));
    else {
      const [root, rest] = story.title.split('/', 2);
      if (!ATOMIC_ROOTS.includes(root) || !rest) diagnostics.push(diagnostic('SB_TITLE_ORDER', `Title "${story.title}" must use the Atomic hierarchy.`, story.file, story.meta));
    }
    if (!story.tags.includes('autodocs')) diagnostics.push(diagnostic('SB_AUTODOCS', 'Story metadata must include the autodocs tag.', story.file, story.meta));
    const exception = exceptionsBySource.get(story.file);
    if (exception) usedExceptions.add(exception.id);
    let subjects = [];
    if (exception?.rule === 'component-coverage') {
      subjects = exception.components;
      for (const component of subjects) coverage.add(component);
      if (exception.storyTitle !== story.title) diagnostics.push(diagnostic('SB_REGISTRY_STALE', `Exception "${exception.id}" title no longer matches its source.`, '.storybook/inventory.json'));
      const directRuntimeImports = new Set(
        story.imports
          .filter((item) => item.runtime && (item.specifier.startsWith('.') || item.specifier.startsWith('/')))
          .map((item) => resolveLocalImport(model.root, story.file, item.specifier, model.allPaths))
          .filter(Boolean)
      );
      for (const component of subjects) if (!directRuntimeImports.has(component)) diagnostics.push(diagnostic('SB_REGISTRY_STALE', `Exception "${exception.id}" component "${component}" is no longer a direct runtime import of its story family.`, '.storybook/inventory.json'));
    } else if (story.componentPath && model.components.has(story.componentPath)) {
      subjects = [story.componentPath];
      if (model.eligibleComponentPaths.has(story.componentPath)) coverage.add(story.componentPath);
    } else if (exception?.rule === 'primary-component-metadata') {
      if (exception.storyTitle !== story.title || story.hasComponentMetadata) diagnostics.push(diagnostic('SB_REGISTRY_STALE', `Exception "${exception.id}" no longer matches absent primary metadata.`, '.storybook/inventory.json'));
    } else diagnostics.push(diagnostic('SB_PRIMARY_METADATA', 'Story family needs resolvable Svelte primary component metadata from a runtime import or an exception.', story.file, story.meta));

    const props = subjectProps(subjects, model);
    const forwardsNativeAttribute = (name) => subjects.some((subject) => {
      const component = model.components.get(subject);
      return component?.forwardsNativeAttributes && !component.nativeExcludedProps?.has(name);
    });
    const omissions = argTypeOmissions(story, diagnostics);
    const usedOmissions = new Set();
    for (const [name, prop] of props) {
      if (prop.snippet || story.argTypes.has(name)) continue;
      if (omissions.has(name)) usedOmissions.add(name);
      else diagnostics.push(diagnostic('SB_ARGTYPE_MISSING', `Explicit prop "${name}" is missing family-level argTypes documentation.`, story.file, story.meta));
    }
    for (const omission of omissions.values()) if (!usedOmissions.has(omission.prop)) diagnostics.push({ code: 'SB_ARGTYPE_OMISSION_STALE', file: story.file, line: omission.line, column: 1, message: `argTypes omission for "${omission.prop}" does not match an undocumented explicit non-snippet prop.` });
    for (const [name, entry] of story.argTypes) {
      const explanation = argTypeExplanation(entry);
      if (!explanation) diagnostics.push(diagnostic('SB_ARGTYPE_EXPLANATION', `argTypes entry "${name}" needs a non-empty description.`, story.file, entry.node));
      if (props.has(name)) continue;
      const description = explanation.toLowerCase();
      const category = entry.value?.table?.category;
      const rejectedOrComposition = hasFalseControl(entry) &&
        (description.includes('not forwarded') || description.includes('rejected') || description.includes('passed through'));
      const forwardedNative = hasFalseControl(entry) && forwardsNativeAttribute(name) &&
        (category === 'Forwarded native attribute' || description.includes('forwarded'));
      if (!rejectedOrComposition && category !== 'Story-only argument' && !forwardedNative) diagnostics.push(diagnostic('SB_ARGTYPE_OBSOLETE', `argTypes entry "${name}" is not a supported, rejected, forwarded-native, or story-only input.`, story.file, entry.node));
    }
    for (const name of story.controlInclude) if (!story.argTypes.has(name)) diagnostics.push(diagnostic('SB_CONTROL_OBSOLETE', `Control "${name}" has no argTypes documentation.`, story.file, story.meta));
    const validArgs = new Set([...props.keys(), ...story.argTypes.keys()]);
    const validateArgs = (args, label, node) => {
      if (args.unresolved) diagnostics.push(diagnostic('SB_ARGS_UNRESOLVED', `${label} is not a statically resolvable object or contains an unresolvable spread/computed key.`, story.file, node));
      for (const name of args.keys) {
        if (!validArgs.has(name)) diagnostics.push(diagnostic('SB_ARG_UNSUPPORTED', `${label} uses unsupported arg "${name}".`, story.file, node));
        else if (!story.argTypes.has(name)) diagnostics.push(diagnostic('SB_ARGTYPE_MISSING', `${label} arg "${name}" lacks family-level argTypes documentation.`, story.file, node));
      }
    };
    validateArgs(story.metaArgs, 'Meta args', story.meta);
    const exports = new Set();
    for (const item of story.stories) {
      if (item.unresolved) diagnostics.push(diagnostic('SB_CSF_UNRESOLVED', 'Story requires a static name or exportName.', story.file, item.node));
      else {
        if (exports.has(item.exportName)) diagnostics.push(diagnostic('SB_CSF_DUPLICATE', `Duplicate effective exportName "${item.exportName}".`, story.file, item.node));
        exports.add(item.exportName);
        if (allIds.has(item.id)) diagnostics.push(diagnostic('SB_CSF_DUPLICATE', `Duplicate generated story ID "${item.id}".`, story.file, item.node));
        allIds.add(item.id);
        validateArgs(item.args, `Story "${item.exportName}" args`, item.node);
        for (const name of item.controlInclude ?? []) if (!story.argTypes.has(name)) diagnostics.push(diagnostic('SB_CONTROL_OBSOLETE', `Story "${item.exportName}" control "${name}" has no argTypes documentation.`, story.file, item.node));
      }
    }
  }
  for (const component of model.eligibleComponentPaths) if (!coverage.has(component)) diagnostics.push(diagnostic('SB_COVERAGE_MISSING', 'Eligible component has no primary metadata coverage or component-coverage exception.', component));
  for (const exception of registry?.exceptions ?? []) {
    if (!usedExceptions.has(exception.id)) diagnostics.push(diagnostic('SB_REGISTRY_STALE', `Exception "${exception.id}" source does not resolve to a discovered story family.`, '.storybook/inventory.json'));
    else if (!byTitle.has(exception.storyTitle)) diagnostics.push(diagnostic('SB_REGISTRY_STALE', `Exception "${exception.id}" references a missing story title.`, '.storybook/inventory.json'));
  }
}

function checkImports(model, registry, diagnostics) {
  const approvals = new Map((registry?.judgmentApprovals ?? []).filter((item) => item.kind === 'browser-safe-import').map((item) => [`${item.scope}\0${item.target}`, item]));
  const used = new Set();
  model.browserDependencyPaths = new Set();
  const scannedDependencies = new Set();
  const roots = [...model.stories];
  try {
    roots.push({ file: '.storybook/preview.ts', source: readFileSync(path.join(model.root, '.storybook/preview.ts'), 'utf8') });
  } catch {}
  for (const story of roots) {
    const visited = new Set([story.file]);
    const scanDependency = (file) => {
      if (visited.has(file) || scannedDependencies.has(file)) return;
      visited.add(file);
      scannedDependencies.add(file);
      model.browserDependencyPaths.add(file);
      let source;
      try { source = readFileSync(path.join(model.root, file), 'utf8'); }
      catch (error) {
        diagnostics.push(diagnostic('SB_SOURCE_MISSING', `Cannot read imported Storybook dependency: ${error.message}`, file));
        return;
      }
      let imports;
      try { imports = collectRuntimeImports(file, source); }
      catch (error) {
        diagnostics.push(diagnostic('SB_SOURCE_PARSE', `Cannot parse imported Storybook dependency: ${error.message}`, file, error));
        return;
      }
      for (const item of imports) {
        const specifier = item.specifier;
        if (typeof specifier !== 'string') {
          diagnostics.push(diagnostic('SB_IMPORT_PROHIBITED', 'Runtime dynamic import specifiers must be static string literals.', file));
          continue;
        }
        if (/^(?:https?:)?\/\//.test(specifier)) diagnostics.push(diagnostic('SB_IMPORT_PROHIBITED', `Remote runtime import "${specifier}" is prohibited in the story dependency graph.`, file));
        else if (specifier.startsWith('.') || specifier.startsWith('/')) {
          const resolved = resolveLocalImport(model.root, file, specifier, model.allPaths);
          if (!resolved) diagnostics.push(diagnostic('SB_IMPORT_MISSING', `Runtime import "${specifier}" cannot be resolved.`, file));
          else if (/^src\/(?:pages|layouts|content)(?:\/|$)/.test(resolved) || resolved === 'src/content.config.ts') diagnostics.push(diagnostic('SB_IMPORT_PROHIBITED', `Runtime import "${resolved}" is prohibited in the story dependency graph.`, file));
          else scanDependency(resolved);
        } else if (NODE_BUILTINS.has(specifier) || PROHIBITED_RUNTIME_SPECIFIERS.has(specifier)) diagnostics.push(diagnostic('SB_IMPORT_PROHIBITED', `Server-only runtime import "${specifier}" is prohibited in the story dependency graph.`, file));
        else if (!RUNTIME_ALLOWLIST.has(specifier)) {
          const key = `${file}\0${specifier}`;
          if (approvals.has(key)) used.add(approvals.get(key).id);
          else diagnostics.push(diagnostic('SB_IMPORT_APPROVAL_REQUIRED', `Bare runtime import "${specifier}" is not proven browser-safe.`, file));
        }
      }
      if (collectLiveNetworkCalls(file, source).length) diagnostics.push(diagnostic('SB_IMPORT_PROHIBITED', 'Live network APIs are prohibited in the story dependency graph.', file));
    };
    let rootImports;
    try { rootImports = collectRuntimeImports(story.file, story.source); }
    catch (error) {
      diagnostics.push(diagnostic('SB_SOURCE_PARSE', `Cannot parse Storybook imports: ${error.message}`, story.file, error));
      rootImports = [];
    }
    for (const item of rootImports) {
      const specifier = item.specifier;
      if (typeof specifier !== 'string') {
        diagnostics.push(diagnostic('SB_IMPORT_PROHIBITED', 'Runtime dynamic import specifiers must be static string literals.', story.file, item.node));
        continue;
      }
      if (/^(?:https?:)?\/\//.test(specifier)) diagnostics.push(diagnostic('SB_IMPORT_PROHIBITED', `Remote runtime import "${specifier}" is prohibited in stories.`, story.file, item.node));
      else if (specifier.startsWith('.') || specifier.startsWith('/')) {
        const resolved = resolveLocalImport(model.root, story.file, specifier, model.allPaths);
        if (!resolved) diagnostics.push(diagnostic('SB_IMPORT_MISSING', `Runtime import "${specifier}" cannot be resolved.`, story.file, item.node));
        else if (/^src\/(?:pages|layouts|content)(?:\/|$)/.test(resolved) || resolved === 'src/content.config.ts') diagnostics.push(diagnostic('SB_IMPORT_PROHIBITED', `Runtime import "${resolved}" is prohibited in stories.`, story.file, item.node));
        else scanDependency(resolved);
      } else if (NODE_BUILTINS.has(specifier) || PROHIBITED_RUNTIME_SPECIFIERS.has(specifier)) diagnostics.push(diagnostic('SB_IMPORT_PROHIBITED', `Server-only runtime import "${specifier}" is prohibited in stories.`, story.file, item.node));
      else if (!RUNTIME_ALLOWLIST.has(specifier)) {
        const key = `${story.file}\0${specifier}`;
        if (approvals.has(key)) used.add(approvals.get(key).id);
        else diagnostics.push(diagnostic('SB_IMPORT_APPROVAL_REQUIRED', `Bare runtime import "${specifier}" is not proven browser-safe.`, story.file, item.node));
      }
    }
    if (collectLiveNetworkCalls(story.file, story.source).length) diagnostics.push(diagnostic('SB_IMPORT_PROHIBITED', 'Live network APIs are prohibited in Storybook browser runtime sources.', story.file));
  }
  for (const approval of approvals.values()) if (!used.has(approval.id)) diagnostics.push(diagnostic('SB_REGISTRY_STALE', `Approval "${approval.id}" no longer matches an unproven runtime import.`, '.storybook/inventory.json'));
}

function checkTypingApprovals(model, registry, diagnostics) {
  const stories = new Map(model.stories.map((story) => [story.file, story]));
  const expressionUsesIdentifier = (candidate, name) => {
    let found = false;
    const visit = (node) => {
      if (found || !node || typeof node !== 'object') return;
      if (node.type === 'Identifier') {
        found = node.name === name;
        return;
      }
      if (node.type === 'Property') {
        if (node.computed) visit(node.key);
        visit(node.value);
        return;
      }
      if (node.type === 'MemberExpression') {
        visit(node.object);
        if (node.computed) visit(node.property);
        return;
      }
      for (const [key, value] of Object.entries(node)) {
        if (key === 'parent' || key === 'metadata' || key === 'loc') continue;
        if (Array.isArray(value)) for (const child of value) visit(child);
        else visit(value);
      }
    };
    visit(candidate);
    return found;
  };
  const attributeValue = (attribute) => attribute?.value?.type === 'ExpressionTag' ? attribute.value.expression : undefined;
  for (const approval of (registry?.judgmentApprovals ?? []).filter((item) => item.kind === 'typing-limitation')) {
    const match = approval.target.match(/^binding\.([A-Za-z_$][\w$]*)$/);
    const story = stories.get(approval.scope);
    const bindings = match && story
      ? [story.moduleContext.constants.get(match[1]), story.instanceContext.constants.get(match[1])].filter(Boolean)
      : [];
    const binding = bindings.length === 1 ? bindings[0] : null;
    let node = binding;
    let assertions = 0;
    let passesThroughUnknown = false;
    while (node && ['TSAsExpression', 'TSTypeAssertion'].includes(node.type)) {
      assertions += 1;
      passesThroughUnknown ||= node.typeAnnotation?.type === 'TSUnknownKeyword';
      node = node.expression;
    }
    let usedAsStoryInput = false;
    if (story) {
      usedAsStoryInput ||= expressionUsesIdentifier(objectProperty(story.meta, 'args')?.value, match?.[1]);
      for (const item of story.stories) {
        const argsAttribute = item.node.attributes?.find((attribute) => attribute.type === 'Attribute' && attribute.name === 'args');
        usedAsStoryInput ||= expressionUsesIdentifier(attributeValue(argsAttribute), match?.[1]);
        walk(item.node.fragment, (node) => {
          if (usedAsStoryInput || node.type !== 'Component') return;
          for (const attribute of node.attributes ?? []) {
            if (attribute.type === 'SpreadAttribute') usedAsStoryInput ||= expressionUsesIdentifier(attribute.expression, match?.[1]);
            else if (attribute.type === 'Attribute') usedAsStoryInput ||= expressionUsesIdentifier(attributeValue(attribute), match?.[1]);
          }
        });
      }
    }
    if (!match || !story || !binding || bindings.length !== 1 || assertions < 2 || !passesThroughUnknown || !usedAsStoryInput) diagnostics.push(diagnostic('SB_REGISTRY_STALE', `Typing approval "${approval.id}" must target one unambiguous current binding, double-asserted through unknown and consumed as an args value or rendered component input in its story scope.`, '.storybook/inventory.json'));
  }
}

function assetExists(root, url) {
  const clean = url.split(/[?#]/, 1)[0];
  if (!clean.startsWith('/') || clean.startsWith('//')) return true;
  const relative = canonicalRepoPath(clean.slice(1));
  if (!relative) return false;
  const target = path.join(root, 'public', relative);
  return existsSync(target) && statSync(target).isFile();
}

function checkAssets(model, registry, diagnostics) {
  const dynamic = (registry?.judgmentApprovals ?? []).filter((item) => item.kind === 'dynamic-asset');
  const approvals = new Map(dynamic.map((item) => [`${item.scope}\0${item.target}`, item]));
  const used = new Set();
  const seenReferences = new Set();
  const directiveLinesByFile = new Map();
  const usedDirectivesByFile = new Map();
  const directiveLines = (file) => {
    if (directiveLinesByFile.has(file)) return directiveLinesByFile.get(file);
    let source = '';
    try { source = readFileSync(path.join(model.root, file), 'utf8'); }
    catch { source = ''; }
    const lines = new Set();
    let comments = [];
    try { comments = collectParsedComments(file, source); }
    catch { comments = []; }
    for (const comment of comments) {
      const value = comment.text.trim();
      if (!/^storybook-check: allow-missing-asset\b/.test(value)) continue;
      if (/^storybook-check: allow-missing-asset\s+--\s+\S(?:.|\s)*$/.test(value)) lines.add(comment.line);
      else diagnostics.push({ code: 'SB_ASSET_DIRECTIVE_INVALID', file, line: comment.line, column: 1, message: 'allow-missing-asset directive requires a non-empty reason after "--".' });
    }
    directiveLinesByFile.set(file, lines);
    usedDirectivesByFile.set(file, new Set());
    return lines;
  };
  const validateReference = (story, reference) => {
      const referenceFile = reference.file ?? story.file;
      const line = reference.line;
      const identity = reference.unresolved
        ? [referenceFile, line, reference.column, reference.key, reference.approvalTarget].join('\0')
        : [referenceFile, line, reference.column, reference.value].join('\0');
      if (seenReferences.has(identity)) return;
      seenReferences.add(identity);
      if (reference.unresolved) {
        const approval = approvals.get(`${referenceFile}\0${reference.approvalTarget}`);
        if (approval) used.add(approval.id);
        else diagnostics.push({ code: 'SB_ASSET_APPROVAL_REQUIRED', file: referenceFile, line, column: reference.column, message: `Asset expression for "${reference.key}" is not statically resolvable; add a narrow dynamic-asset approval for "${reference.approvalTarget}" or make it static.` });
        return;
      }
      const candidates = /srcset/i.test(reference.key) ? reference.value.split(',').map((part) => part.trim().split(/\s+/, 1)[0]) : [reference.value];
      const remote = candidates.filter((candidate) => /^(?:https?:)?\/\//i.test(candidate.trim()));
      for (const candidate of remote) diagnostics.push({ code: 'SB_ASSET_REMOTE', file: referenceFile, line, column: reference.column, message: `Remote asset "${candidate}" is prohibited; Storybook fixtures must be local and deterministic.` });
      const missing = candidates.filter((candidate) => !assetExists(model.root, candidate));
      if (!missing.length) return;
      const directiveLine = line - 1;
      const availableDirectives = directiveLines(referenceFile);
      const usedDirectives = usedDirectivesByFile.get(referenceFile);
      const approved = availableDirectives.has(directiveLine) && !usedDirectives.has(directiveLine);
      if (approved) usedDirectives.add(directiveLine);
      else for (const candidate of missing) diagnostics.push({ code: 'SB_ASSET_MISSING', file: referenceFile, line, column: reference.column, message: `Static asset "${candidate}" does not resolve under public/.` });
  };
  for (const story of model.stories) {
    for (const reference of story.assetReferences) validateReference(story, reference);
    if (story.file === 'src/stories/Image.stories.svelte') {
      const stateDeclarations = [];
      const setterDeclarations = [];
      const renderedSpreads = [];
      walk(story.ast.instance?.content, (node) => {
        if (node.type !== 'VariableDeclarator' || node.id?.type !== 'Identifier') return;
        if (node.id.name === 'debugImageProps' && node.init?.type === 'CallExpression' && node.init.callee?.type === 'Identifier' && node.init.callee.name === '$state') stateDeclarations.push(node);
        if (node.id.name === 'setDebugScenario' && ['ArrowFunctionExpression', 'FunctionExpression'].includes(node.init?.type)) setterDeclarations.push(node);
      });
      walk(story.ast.fragment, (node) => {
        if (node.type !== 'Component' || node.name !== 'Image') return;
        if (node.attributes?.some((item) => item.type === 'SpreadAttribute' && item.expression?.type === 'Identifier' && item.expression.name === 'debugImageProps')) renderedSpreads.push(node);
      });
      const setter = setterDeclarations.length === 1 ? setterDeclarations[0].init : null;
      const imageImport = story.imports.find((item) => item.runtime && item.bindings.has('Image'));
      const imageComponentPath = imageImport ? resolveLocalImport(model.root, story.file, imageImport.bindings.get('Image'), model.allPaths) : null;
      const propsParameter = setter?.params?.[1];
      let updatesStateFromProps = false;
      if (propsParameter?.type === 'Identifier') for (const statement of setter.body?.type === 'BlockStatement' ? setter.body.body : []) {
        const node = statement.type === 'ExpressionStatement' ? statement.expression : null;
        if (!node || node.type !== 'AssignmentExpression' || node.operator !== '=' || node.left?.type !== 'Identifier' || node.left.name !== 'debugImageProps' || node.right?.type !== 'ObjectExpression') continue;
        const spreads = node.right.properties?.filter((item) => item.type === 'SpreadElement').map((item) => item.argument);
        updatesStateFromProps ||= spreads?.length === 2 && spreads[0]?.type === 'Identifier' && spreads[0].name === 'debugImageProps' && spreads[1]?.type === 'Identifier' && spreads[1].name === propsParameter.name;
      }
      const graph = imageComponentPath === 'src/components/Image.svelte' && stateDeclarations.length === 1 && setterDeclarations.length === 1 && renderedSpreads.length === 1 && updatesStateFromProps;
      const updateFields = new Set();
      const collectUpdateFields = (node) => {
        if (node.type !== 'CallExpression' || node.callee?.type !== 'Identifier' || node.callee.name !== 'setDebugScenario') return;
        const resolved = staticObjectKeys(node.arguments?.[1], story.constants);
        if (!resolved.unresolved) for (const key of resolved.keys) if (ASSET_KEYS.has(key)) updateFields.add(key);
      };
      walk(story.ast.fragment, (node) => {
        if (node.type === 'Attribute' && typeof node.name === 'string' && node.name.startsWith('on')) walk(node.value, collectUpdateFields);
      });
      for (const field of updateFields) {
        const target = `binding.debugImageProps.${field}`;
        const approval = approvals.get(`${story.file}\0${target}`);
        if (graph && approval) used.add(approval.id);
        else if (graph) diagnostics.push(diagnostic('SB_ASSET_APPROVAL_REQUIRED', `Image debug scenario updates "${field}" through debugImageProps without approval "${target}".`, story.file));
      }
    }
  }
  for (const file of model.browserDependencyPaths ?? []) {
    if (STORY_RE.test(file)) continue;
    for (const reference of collectSvelteAssetReferences(model.root, file)) {
      const publicComponentInput = reference.unresolved && /^src\/(?:components|icons)\//.test(file);
      if (!publicComponentInput) validateReference({ file }, reference);
    }
  }
  for (const file of model.allPaths ?? []) if (/^src\/.*\.(?:svelte|[cm]?[jt]sx?)$/.test(file)) directiveLines(file);
  for (const [file, lines] of directiveLinesByFile) {
    const usedDirectives = usedDirectivesByFile.get(file);
    for (const line of lines) if (!usedDirectives.has(line)) diagnostics.push({ code: 'SB_ASSET_DIRECTIVE_STALE', file, line, column: 1, message: 'allow-missing-asset directive does not immediately precede a missing static asset literal.' });
  }
  for (const approval of dynamic) if (!used.has(approval.id)) diagnostics.push(diagnostic('SB_REGISTRY_STALE', `Approval "${approval.id}" no longer matches an unresolved asset expression or the approved Image debug dataflow.`, '.storybook/inventory.json'));
}

function checkIdFixtureVersions(model, diagnostics) {
  const fixtureDirectory = 'scripts/storybook-checks/fixtures/index';
  const packageFile = path.join(model.root, 'package.json');
  if (!existsSync(packageFile)) return;
  let captures = [];
  try { captures = readdirSync(path.join(model.root, fixtureDirectory)).filter((file) => /^explicit-ids\.storybook-[0-9][^/]*\.json$/.test(file)); }
  catch {}
  if (captures.length !== 1) {
    diagnostics.push(diagnostic('SB_ID_FIXTURE_VERSION', `Expected exactly one versioned explicit-ID capture; found ${captures.length}.`, fixtureDirectory));
    return;
  }
  const fixtureFile = `${fixtureDirectory}/${captures[0]}`;
  const fixture = path.join(model.root, fixtureFile);
  try {
    const captured = JSON.parse(readFileSync(fixture, 'utf8'));
    const capturedStorybookVersion = captured.toolchain?.storybook;
    if (captures[0] !== `explicit-ids.storybook-${capturedStorybookVersion}.json`) diagnostics.push(diagnostic('SB_ID_FIXTURE_VERSION', `Captured Storybook version ${JSON.stringify(capturedStorybookVersion)} does not match fixture filename ${JSON.stringify(captures[0])}.`, fixtureFile));
    for (const packageName of ['storybook', '@storybook/addon-svelte-csf', '@storybook/svelte-vite', '@storybook/csf']) {
      const installed = JSON.parse(readFileSync(path.join(model.root, 'node_modules', packageName, 'package.json'), 'utf8')).version;
      if (captured.toolchain?.[packageName] !== installed) diagnostics.push(diagnostic('SB_ID_FIXTURE_VERSION', `Captured ${packageName} version ${JSON.stringify(captured.toolchain?.[packageName])} does not match installed ${installed}.`, fixtureFile));
    }
  } catch (error) {
    diagnostics.push(diagnostic('SB_ID_FIXTURE_VERSION', `Cannot validate captured ID fixture versions: ${error.message}`, fixtureFile));
  }
}

export function validateSource({ root }) {
  const model = loadSourceModel(root);
  const diagnostics = [...model.diagnostics];
  checkConfiguration(model, diagnostics);
  checkStoryLikeFiles(model, diagnostics);
  const { registry, diagnostics: registryDiagnostics } = loadRegistry(model);
  diagnostics.push(...registryDiagnostics);
  if (registry && registryDiagnostics.length === 0) {
    checkStories(model, registry, diagnostics);
    checkImports(model, registry, diagnostics);
    checkTypingApprovals(model, registry, diagnostics);
    checkAssets(model, registry, diagnostics);
  }
  checkIdFixtureVersions(model, diagnostics);
  return { model, registry, diagnostics };
}
