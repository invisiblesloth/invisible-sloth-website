import test from 'node:test';
import assert from 'node:assert/strict';
import { unlinkSync, writeFileSync } from 'node:fs';
import { loadSourceModel } from './source-model.mjs';
import { loadRegistry } from './registry.mjs';
import { codes, makeRepository } from './test-helpers.mjs';

for (const [name, mutate, code] of [
  ['unknown top field', (r) => { r.catalog = []; }, 'SB_REGISTRY_UNKNOWN_FIELD'],
  ['unknown rule', (r) => { r.exceptions.push({ id: 'x', rule: 'future', storyTitle: 'Atoms/Thing', source: 'src/stories/Thing.stories.svelte', reason: 'reason', reviewTrigger: 'review' }); }, 'SB_REGISTRY_UNKNOWN_RULE'],
  ['duplicate ids', (r) => { r.protectedIds.push({ id: 'x', reason: 'r', reference: 'src/stories/Thing.stories.svelte' }, { id: 'x', reason: 'r', reference: 'src/stories/Thing.stories.svelte' }); }, 'SB_REGISTRY_DUPLICATE_ID'],
  ['missing path', (r) => { r.protectedIds.push({ id: 'x', reason: 'r', reference: 'missing.md' }); }, 'SB_REGISTRY_MISSING_PATH'],
  ['unsupported schema version', (r) => { r.schemaVersion = 2; }, 'SB_REGISTRY_SCHEMA'],
  ['unknown approval kind', (r) => { r.judgmentApprovals.push({ id: 'x', kind: 'future', target: 'x', scope: 'src/stories/Thing.stories.svelte', reason: 'r', reviewTrigger: 'review' }); }, 'SB_REGISTRY_UNKNOWN_KIND'],
]) test(`registry rejects ${name}`, () => {
  const registry = { schemaVersion: 1, exceptions: [], judgmentApprovals: [], protectedIds: [] };
  mutate(registry);
  const root = makeRepository({ registry });
  assert(codes(loadRegistry(loadSourceModel(root)).diagnostics).includes(code));
});

test('registry reports malformed JSON distinctly', () => {
  const root = makeRepository();
  writeFileSync(`${root}/.storybook/inventory.json`, '{');
  assert(codes(loadRegistry(loadSourceModel(root)).diagnostics).includes('SB_REGISTRY_PARSE'));
});

test('registry reports non-object entries without throwing', () => {
  const registry = { schemaVersion: 1, exceptions: [null], judgmentApprovals: ['bad'], protectedIds: [42] };
  const root = makeRepository({ registry });
  const diagnostics = loadRegistry(loadSourceModel(root)).diagnostics;
  assert.equal(diagnostics.filter((item) => item.code === 'SB_REGISTRY_SCHEMA').length, 3);
});

test('registry rejects a tracked path that is missing from the checkout', () => {
  const registry = { schemaVersion: 1, exceptions: [], judgmentApprovals: [], protectedIds: [{ id: 'x', reason: 'Compatibility reference.', reference: 'reference.md' }] };
  const root = makeRepository({ registry, extras: { 'reference.md': 'x' } });
  unlinkSync(`${root}/reference.md`);
  assert(codes(loadRegistry(loadSourceModel(root)).diagnostics).includes('SB_REGISTRY_MISSING_PATH'));
});

test('component coverage requires unique eligible components and a production story source', () => {
  const entry = { id: 'family', rule: 'component-coverage', storyTitle: 'Atoms/Thing', source: 'src/components/Thing.svelte', components: ['src/components/Thing.svelte', 'src/components/Thing.svelte', 'src/lib/helper.ts'], reason: 'Family.', reviewTrigger: 'Paths change.' };
  const registry = { schemaVersion: 1, exceptions: [entry], judgmentApprovals: [], protectedIds: [] };
  const root = makeRepository({ registry, extras: { 'src/lib/helper.ts': 'export const helper = true;' } });
  const diagnostics = loadRegistry(loadSourceModel(root)).diagnostics;
  assert(diagnostics.some((item) => item.code === 'SB_REGISTRY_SCHEMA' && item.message.includes('duplicate component')));
  assert(diagnostics.some((item) => item.code === 'SB_REGISTRY_SCHEMA' && item.message.includes('not an eligible top-level Svelte component')));
  assert(diagnostics.some((item) => item.code === 'SB_REGISTRY_SCHEMA' && item.message.includes('.source must match')));
});

test('registry paths must use canonical repository-relative POSIX spelling', () => {
  const registry = { schemaVersion: 1, exceptions: [], judgmentApprovals: [], protectedIds: [{ id: 'thing', reason: 'Reference.', reference: './src/stories/Thing.stories.svelte' }] };
  const diagnostics = loadRegistry(loadSourceModel(makeRepository({ registry }))).diagnostics;
  assert(diagnostics.some((item) => item.code === 'SB_REGISTRY_SCHEMA' && item.message.includes('canonical repository-relative POSIX path')));
});
