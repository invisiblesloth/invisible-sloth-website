import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync, statSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { validateGeneratedIndex } from './index-checks.mjs';

const temporaryDirectories = new Set();

after(() => {
  for (const root of temporaryDirectories) rmSync(root, { recursive: true, force: true });
});

function fixture(overrides = {}) {
  const root = mkdtempSync(path.join(os.tmpdir(), 'storybook-index-test-'));
  temporaryDirectories.add(root);
  const outputDir = path.join(root, 'out');
  mkdirSync(outputDir);
  const indexPath = path.join(outputDir, 'index.json');
  const entry = { id: 'atoms-thing--default', type: 'story', title: 'Atoms/Thing', name: 'Default', exportName: 'Default', importPath: './src/stories/Thing.stories.svelte' };
  const docs = { id: 'atoms-thing--docs', type: 'docs', title: 'Atoms/Thing', name: 'Docs', importPath: 'src/stories/Thing.stories.svelte' };
  writeFileSync(indexPath, JSON.stringify(overrides.index ?? { v: 5, entries: { [entry.id]: entry, [docs.id]: docs } }));
  const time = statSync(indexPath).mtimeMs;
  const sourceModel = { root, stories: [{ file: 'src/stories/Thing.stories.svelte', title: 'Atoms/Thing', docsId: docs.id, stories: [{ id: entry.id, name: 'Default', exportName: 'Default', unresolved: false }] }] };
  const buildEvidence = overrides.evidence ?? { success: true, outputDir, startedAt: time - 10, finishedAt: time + 10 };
  return { indexPath, sourceModel, registry: overrides.registry ?? { protectedIds: [] }, buildEvidence };
}

test('accepts both canonical generated importPath forms', () => {
  assert.deepEqual(validateGeneratedIndex(fixture()), []);
});

test('rejects unsupported index versions', () => {
  const input = fixture({ index: { v: 4, entries: {} } });
  assert.deepEqual(validateGeneratedIndex(input).map((item) => item.code), ['SB_INDEX_VERSION']);
});

test('reports malformed and structurally invalid generated indexes', () => {
  const malformed = fixture();
  writeFileSync(malformed.indexPath, '{');
  assert.equal(validateGeneratedIndex(malformed)[0].code, 'SB_INDEX_PARSE');
  const shape = fixture({ index: { v: 5, entries: [] } });
  assert(validateGeneratedIndex(shape).some((item) => item.code === 'SB_INDEX_SHAPE'));
});

test('requires Docs and exact generated story metadata', () => {
  const entry = { id: 'atoms-thing--default', type: 'story', title: 'Wrong', name: 'Default', exportName: 'Default', importPath: 'src/stories/Thing.stories.svelte' };
  const input = fixture({ index: { v: 5, entries: { [entry.id]: entry } } });
  const found = validateGeneratedIndex(input).map((item) => item.code);
  assert(found.includes('SB_INDEX_DOCS'));
  assert(found.includes('SB_INDEX_ENTRY'));
});

test('requires the installed Docs name', () => {
  const story = { id: 'atoms-thing--default', type: 'story', title: 'Atoms/Thing', name: 'Default', exportName: 'Default', importPath: 'src/stories/Thing.stories.svelte' };
  const docs = { id: 'atoms-thing--docs', type: 'docs', title: 'Atoms/Thing', name: 'Documentation', importPath: 'src/stories/Thing.stories.svelte' };
  const input = fixture({ index: { v: 5, entries: { [story.id]: story, [docs.id]: docs } } });
  assert(validateGeneratedIndex(input).some((item) => item.code === 'SB_INDEX_DOCS'));
});

test('rejects extra and unsupported entries attached to a valid source', () => {
  const story = { id: 'atoms-thing--default', type: 'story', title: 'Atoms/Thing', name: 'Default', exportName: 'Default', importPath: 'src/stories/Thing.stories.svelte' };
  const docs = { id: 'atoms-thing--docs', type: 'docs', title: 'Atoms/Thing', name: 'Docs', importPath: 'src/stories/Thing.stories.svelte' };
  const extra = { id: 'atoms-thing--ghost', type: 'future', title: 'Atoms/Thing', name: 'Ghost', importPath: 'src/stories/Thing.stories.svelte' };
  const input = fixture({ index: { v: 5, entries: { [story.id]: story, [docs.id]: docs, [extra.id]: extra } } });
  const found = validateGeneratedIndex(input).map((item) => item.code);
  assert(found.includes('SB_INDEX_ID'));
  assert(found.includes('SB_INDEX_ENTRY'));
});

test('rejects duplicate entry IDs and unsafe import paths', () => {
  const duplicate = { id: 'atoms-thing--default', type: 'story', title: 'Atoms/Thing', name: 'Default', exportName: 'Default', importPath: 'src/stories/Thing.stories.svelte' };
  const docs = { id: 'atoms-thing--docs', type: 'docs', title: 'Atoms/Thing', name: 'Docs', importPath: '../outside.stories.svelte' };
  const input = fixture({ index: { v: 5, entries: { 'atoms-thing--default': duplicate, duplicate: { ...duplicate }, [docs.id]: docs } } });
  const found = validateGeneratedIndex(input).map((item) => item.code);
  assert(found.includes('SB_INDEX_DUPLICATE_ID'));
  assert(found.includes('SB_INDEX_PATH'));
});

test('requires successful same-invocation, same-directory build evidence', () => {
  const input = fixture({ evidence: { success: false, outputDir: '/tmp/other' } });
  assert.equal(validateGeneratedIndex(input)[0].code, 'SB_INDEX_MISSING');
});

test('rejects stale build evidence and missing protected IDs', () => {
  const input = fixture();
  input.buildEvidence.startedAt = Date.now() + 5000;
  assert.equal(validateGeneratedIndex(input)[0].code, 'SB_INDEX_STALE');
  const protectedInput = fixture({ registry: { protectedIds: [{ id: 'missing', reference: 'missing.txt' }] } });
  assert(validateGeneratedIndex(protectedInput).some((item) => item.code === 'SB_PROTECTED_ID'));
});

test('reports an unreadable protected-ID reference', () => {
  const input = fixture({ registry: { protectedIds: [{ id: 'atoms-thing--default', reference: 'missing.txt' }] } });
  assert(validateGeneratedIndex(input).some((item) => item.code === 'SB_PROTECTED_ID' && item.message.includes('cannot be read')));
});

test('requires an exact protected ID token in its reference', () => {
  const input = fixture({ registry: { protectedIds: [{ id: 'atoms-thing--default', reference: 'reference.md' }] } });
  writeFileSync(path.join(input.sourceModel.root, 'reference.md'), 'atoms-thing--default-suffix');
  assert(validateGeneratedIndex(input).some((item) => item.code === 'SB_PROTECTED_ID' && item.message.includes('exact ID')));
  writeFileSync(path.join(input.sourceModel.root, 'reference.md'), '`atoms-thing--default`');
  assert(!validateGeneratedIndex(input).some((item) => item.code === 'SB_PROTECTED_ID'));
  writeFileSync(path.join(input.sourceModel.root, 'reference.md'), '`ATOMS-THING--DEFAULT`');
  assert(validateGeneratedIndex(input).some((item) => item.code === 'SB_PROTECTED_ID' && item.message.includes('exact ID')));
});

test('captured explicit-export fixture records the installed algorithm and toolchain', () => {
  const captured = JSON.parse(readFileSync(new URL('./fixtures/index/explicit-ids.storybook-10.5.0.json', import.meta.url)));
  assert.equal(captured.indexVersion, 5);
  assert(captured.entries['fixtures-explicit-export-names--my-story-1']);
  assert(captured.entries['fixtures-explicit-export-names--http-status']);
  assert.equal(captured.toolchain['@storybook/csf'], '0.1.13');
});
