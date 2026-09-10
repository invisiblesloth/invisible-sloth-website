import { readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { diagnostic } from './diagnostics.mjs';
import { canonicalRepoPath } from './paths.mjs';

function containsExactId(source, id) {
  const escaped = id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`(^|[^a-z0-9_-])${escaped}($|[^a-z0-9_-])`).test(source);
}

export function validateGeneratedIndex({ indexPath, sourceModel, registry, buildEvidence }) {
  const diagnostics = [];
  const displayPath = canonicalRepoPath(path.relative(sourceModel.root, indexPath)) ?? indexPath;
  const outputDir = path.resolve(path.dirname(indexPath));
  if (!buildEvidence?.success || path.resolve(buildEvidence.outputDir) !== outputDir) {
    diagnostics.push(diagnostic('SB_INDEX_MISSING', 'Generated index lacks successful build evidence for this exact output directory.', displayPath));
    return diagnostics;
  }
  try {
    const modified = statSync(indexPath).mtimeMs;
    if (!buildEvidence.startedAt || !buildEvidence.finishedAt || modified < buildEvidence.startedAt || modified > buildEvidence.finishedAt + 1000) {
      diagnostics.push(diagnostic('SB_INDEX_STALE', 'Generated index timestamp is outside this invocation successful build window.', displayPath));
      return diagnostics;
    }
  } catch (error) {
    diagnostics.push(diagnostic('SB_INDEX_MISSING', `Generated index is unavailable: ${error.message}`, displayPath));
    return diagnostics;
  }
  let index;
  try { index = JSON.parse(readFileSync(indexPath, 'utf8')); }
  catch (error) {
    diagnostics.push(diagnostic('SB_INDEX_PARSE', `Cannot parse generated index: ${error.message}`, displayPath));
    return diagnostics;
  }
  if (index?.v !== 5) {
    diagnostics.push(diagnostic('SB_INDEX_VERSION', `Unsupported Storybook index version ${JSON.stringify(index?.v)}; supported version is 5.`, displayPath));
    return diagnostics;
  }
  if (!index?.entries || Array.isArray(index.entries) || typeof index.entries !== 'object') {
    diagnostics.push(diagnostic('SB_INDEX_SHAPE', 'Storybook index entries must be an object.', displayPath));
    return diagnostics;
  }
  const byId = new Map();
  const bySource = new Map();
  for (const [key, entry] of Object.entries(index.entries)) {
    const validShape = entry && typeof entry === 'object' && typeof entry.id === 'string' && typeof entry.importPath === 'string' && typeof entry.type === 'string' && typeof entry.title === 'string' && typeof entry.name === 'string' && (entry.type !== 'story' || typeof entry.exportName === 'string');
    if (!validShape) {
      diagnostics.push(diagnostic('SB_INDEX_ENTRY', `Index entry "${key}" is structurally invalid.`, displayPath));
      continue;
    }
    if (key !== entry.id) diagnostics.push(diagnostic('SB_INDEX_ENTRY', `Index key "${key}" does not equal entry id "${entry.id}".`, displayPath));
    if (byId.has(entry.id)) diagnostics.push(diagnostic('SB_INDEX_DUPLICATE_ID', `Generated ID "${entry.id}" appears more than once.`, displayPath));
    byId.set(entry.id, entry);
    const source = canonicalRepoPath(entry.importPath);
    if (!source) diagnostics.push(diagnostic('SB_INDEX_PATH', `Index importPath "${entry.importPath}" is not a safe repository path.`, displayPath));
    else {
      if (!bySource.has(source)) bySource.set(source, []);
      bySource.get(source).push(entry);
    }
  }
  const expectedSources = new Set(sourceModel.stories.map((story) => story.file));
  for (const source of bySource.keys()) if (!expectedSources.has(source)) diagnostics.push(diagnostic('SB_INDEX_PATH', `Index contains unsupported story source "${source}".`, displayPath));
  for (const story of sourceModel.stories) {
    const entries = bySource.get(story.file) ?? [];
    const expectedIds = new Set([story.docsId, ...story.stories.filter((item) => !item.unresolved).map((item) => item.id)]);
    for (const entry of entries) {
      if (!expectedIds.has(entry.id)) diagnostics.push(diagnostic('SB_INDEX_ID', `Generated ${JSON.stringify(entry.type)} entry "${entry.id}" is not declared by ${story.file}.`, displayPath));
      if (entry.type !== 'story' && entry.type !== 'docs') diagnostics.push(diagnostic('SB_INDEX_ENTRY', `Generated entry "${entry.id}" has unsupported type ${JSON.stringify(entry.type)}.`, displayPath));
    }
    const docs = entries.filter((entry) => entry.type === 'docs' && entry.id === story.docsId && entry.title === story.title && entry.name === 'Docs');
    if (docs.length !== 1) diagnostics.push(diagnostic('SB_INDEX_DOCS', `Expected exactly one Docs entry "${story.docsId}" for ${story.file}; found ${docs.length}.`, displayPath));
    for (const expected of story.stories.filter((item) => !item.unresolved)) {
      const matches = entries.filter((entry) => entry.type === 'story' && entry.id === expected.id);
      if (matches.length !== 1) diagnostics.push(diagnostic('SB_INDEX_ID', `Expected exactly one story entry "${expected.id}"; found ${matches.length}.`, displayPath));
      else {
        const entry = matches[0];
        if (entry.title !== story.title || entry.name !== expected.name || entry.exportName !== expected.exportName) diagnostics.push(diagnostic('SB_INDEX_ENTRY', `Generated metadata for "${expected.id}" does not match source title, name, and exportName.`, displayPath));
      }
    }
  }
  for (const protectedId of registry?.protectedIds ?? []) {
    if (!byId.has(protectedId.id)) diagnostics.push(diagnostic('SB_PROTECTED_ID', `Protected ID "${protectedId.id}" does not resolve in this build.`, displayPath));
    try {
      const reference = readFileSync(path.join(sourceModel.root, protectedId.reference), 'utf8');
      if (!containsExactId(reference, protectedId.id)) diagnostics.push(diagnostic('SB_PROTECTED_ID', `Protected ID reference "${protectedId.reference}" no longer contains exact ID "${protectedId.id}".`, protectedId.reference));
    } catch (error) {
      diagnostics.push(diagnostic('SB_PROTECTED_ID', `Protected ID reference "${protectedId.reference}" cannot be read: ${error.message}`, protectedId.reference));
    }
  }
  return diagnostics;
}
