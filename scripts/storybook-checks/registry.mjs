import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { diagnostic } from './diagnostics.mjs';
import { canonicalRepoPath } from './paths.mjs';

const TOP_FIELDS = new Set(['schemaVersion', 'exceptions', 'judgmentApprovals', 'protectedIds']);
const EXCEPTION_COMMON = ['id', 'rule', 'storyTitle', 'source', 'reason', 'reviewTrigger'];
const APPROVAL_FIELDS = ['id', 'kind', 'target', 'scope', 'reason', 'reviewTrigger'];
const PROTECTED_FIELDS = ['id', 'reason', 'reference'];
const APPROVAL_KINDS = new Set(['browser-safe-import', 'dynamic-asset', 'typing-limitation']);
const STORY_SOURCE_RE = /^src\/stories\/(?:.+\/)?[^/]+\.stories\.svelte$/;

function isRecord(value) {
  return value !== null && !Array.isArray(value) && typeof value === 'object';
}

function exactFields(item, allowed, file, diagnostics, label) {
  for (const key of Object.keys(item)) {
    if (!allowed.includes(key)) diagnostics.push(diagnostic('SB_REGISTRY_UNKNOWN_FIELD', `${label} has unknown field "${key}".`, file));
  }
  for (const key of allowed) {
    if (!(key in item)) diagnostics.push(diagnostic('SB_REGISTRY_SCHEMA', `${label} is missing required field "${key}".`, file));
  }
}

function nonblank(item, fields, file, diagnostics, label) {
  for (const key of fields) {
    if (typeof item[key] !== 'string' || !item[key].trim()) diagnostics.push(diagnostic('SB_REGISTRY_SCHEMA', `${label}.${key} must be a non-empty string.`, file));
  }
}

export function loadRegistry(model) {
  const file = '.storybook/inventory.json';
  const diagnostics = [];
  let registry;
  try {
    registry = JSON.parse(readFileSync(path.join(model.root, file), 'utf8'));
  } catch (error) {
    return { registry: null, diagnostics: [diagnostic('SB_REGISTRY_PARSE', `Cannot parse registry: ${error.message}`, file)] };
  }
  if (!registry || Array.isArray(registry) || typeof registry !== 'object') {
    return { registry: null, diagnostics: [diagnostic('SB_REGISTRY_SCHEMA', 'Registry root must be an object.', file)] };
  }
  for (const key of Object.keys(registry)) if (!TOP_FIELDS.has(key)) diagnostics.push(diagnostic('SB_REGISTRY_UNKNOWN_FIELD', `Registry has unknown top-level field "${key}".`, file));
  for (const key of TOP_FIELDS) if (!(key in registry)) diagnostics.push(diagnostic('SB_REGISTRY_SCHEMA', `Registry is missing top-level field "${key}".`, file));
  if (registry.schemaVersion !== 1) diagnostics.push(diagnostic('SB_REGISTRY_SCHEMA', `Unsupported registry schemaVersion ${JSON.stringify(registry.schemaVersion)}; expected 1.`, file));
  for (const key of ['exceptions', 'judgmentApprovals', 'protectedIds']) if (!Array.isArray(registry[key])) diagnostics.push(diagnostic('SB_REGISTRY_SCHEMA', `Registry.${key} must be an array.`, file));
  if (diagnostics.length) return { registry, diagnostics };

  const ids = new Set();
  const isTrackedFile = (value) => {
    const normalized = canonicalRepoPath(value);
    return normalized && model.inventory.trackedPaths.has(normalized) && existsSync(path.join(model.root, normalized));
  };
  const requireCanonicalPath = (value, label) => {
    const normalized = canonicalRepoPath(value);
    if (typeof value === 'string' && normalized !== value) diagnostics.push(diagnostic('SB_REGISTRY_SCHEMA', `${label} must be a canonical repository-relative POSIX path.`, file));
    return normalized;
  };
  const registerId = (entry, label) => {
    if (ids.has(entry.id)) diagnostics.push(diagnostic('SB_REGISTRY_DUPLICATE_ID', `Duplicate registry entry id "${entry.id}".`, file));
    ids.add(entry.id);
    nonblank(entry, ['id'], file, diagnostics, label);
  };
  for (const [index, entry] of registry.exceptions.entries()) {
    if (!isRecord(entry)) {
      diagnostics.push(diagnostic('SB_REGISTRY_SCHEMA', `Exception at index ${index} must be an object.`, file));
      continue;
    }
    const label = `Exception ${JSON.stringify(entry.id)}`;
    registerId(entry, label);
    if (entry.rule === 'component-coverage') {
      exactFields(entry, [...EXCEPTION_COMMON, 'components'], file, diagnostics, label);
      if (!Array.isArray(entry.components) || entry.components.length === 0) diagnostics.push(diagnostic('SB_REGISTRY_SCHEMA', `${label}.components must be a non-empty array.`, file));
      else {
        const components = new Set();
        for (const [componentIndex, component] of entry.components.entries()) {
          if (typeof component !== 'string' || !component.trim()) {
            diagnostics.push(diagnostic('SB_REGISTRY_SCHEMA', `${label}.components[${componentIndex}] must be a non-empty string.`, file));
            continue;
          }
          const normalized = requireCanonicalPath(component, `${label}.components[${componentIndex}]`);
          if (components.has(normalized)) diagnostics.push(diagnostic('SB_REGISTRY_SCHEMA', `${label}.components contains duplicate component "${component}".`, file));
          components.add(normalized);
          if (!isTrackedFile(component)) diagnostics.push(diagnostic('SB_REGISTRY_MISSING_PATH', `${label} references missing or untracked component "${component}".`, file));
          else if (!model.eligibleComponentPaths?.has(normalized)) diagnostics.push(diagnostic('SB_REGISTRY_SCHEMA', `${label} component "${component}" is not an eligible top-level Svelte component.`, file));
        }
      }
    } else if (entry.rule === 'primary-component-metadata') exactFields(entry, EXCEPTION_COMMON, file, diagnostics, label);
    else {
      diagnostics.push(diagnostic('SB_REGISTRY_UNKNOWN_RULE', `${label} has unknown rule "${entry.rule}".`, file));
      exactFields(entry, EXCEPTION_COMMON, file, diagnostics, label);
    }
    nonblank(entry, EXCEPTION_COMMON, file, diagnostics, label);
    requireCanonicalPath(entry.source, `${label}.source`);
    if (!isTrackedFile(entry.source)) diagnostics.push(diagnostic('SB_REGISTRY_MISSING_PATH', `${label} references missing or untracked source "${entry.source}".`, file));
    else if (!STORY_SOURCE_RE.test(entry.source)) diagnostics.push(diagnostic('SB_REGISTRY_SCHEMA', `${label}.source must match src/stories/**/*.stories.svelte.`, file));
  }
  for (const [index, entry] of registry.judgmentApprovals.entries()) {
    if (!isRecord(entry)) {
      diagnostics.push(diagnostic('SB_REGISTRY_SCHEMA', `Approval at index ${index} must be an object.`, file));
      continue;
    }
    const label = `Approval ${JSON.stringify(entry.id)}`;
    registerId(entry, label);
    exactFields(entry, APPROVAL_FIELDS, file, diagnostics, label);
    nonblank(entry, APPROVAL_FIELDS, file, diagnostics, label);
    if (!APPROVAL_KINDS.has(entry.kind)) diagnostics.push(diagnostic('SB_REGISTRY_UNKNOWN_KIND', `${label} has unknown kind "${entry.kind}".`, file));
    requireCanonicalPath(entry.scope, `${label}.scope`);
    if (!isTrackedFile(entry.scope)) diagnostics.push(diagnostic('SB_REGISTRY_MISSING_PATH', `${label} references missing or untracked scope "${entry.scope}".`, file));
  }
  for (const [index, entry] of registry.protectedIds.entries()) {
    if (!isRecord(entry)) {
      diagnostics.push(diagnostic('SB_REGISTRY_SCHEMA', `Protected ID at index ${index} must be an object.`, file));
      continue;
    }
    const label = `Protected ID ${JSON.stringify(entry.id)}`;
    registerId(entry, label);
    exactFields(entry, PROTECTED_FIELDS, file, diagnostics, label);
    nonblank(entry, PROTECTED_FIELDS, file, diagnostics, label);
    requireCanonicalPath(entry.reference, `${label}.reference`);
    if (!isTrackedFile(entry.reference)) diagnostics.push(diagnostic('SB_REGISTRY_MISSING_PATH', `${label} references missing or untracked path "${entry.reference}".`, file));
  }
  return { registry, diagnostics };
}
