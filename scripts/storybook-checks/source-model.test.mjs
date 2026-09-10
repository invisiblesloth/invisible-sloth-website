import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { loadSourceModel } from './source-model.mjs';
import { makeRepository } from './test-helpers.mjs';

test('models effective export names with the installed Storybook algorithm', () => {
  const root = makeRepository({ story: `<script module lang="ts">import { defineMeta } from '@storybook/addon-svelte-csf'; import Thing from '../components/Thing.svelte'; const { Story } = defineMeta({ title: 'Atoms/Thing', id: 'fixed-meta', component: Thing, tags: ['autodocs'], argTypes: { label: { description: 'Label' }, count: { description: 'Count' } } });</script><Story name="One" exportName="MyStory1" /><Story name="HTTP" exportName="HTTPStatus" />` });
  const model = loadSourceModel(root);
  assert.deepEqual(model.stories[0].stories.map(({ exportName, id }) => [exportName, id]), [
    ['MyStory1', 'fixed-meta--my-story-1'],
    ['HTTPStatus', 'fixed-meta--http-status'],
  ]);
});

test('includes a non-ignored untracked production story', () => {
  const root = makeRepository();
  writeFileSync(`${root}/src/stories/New.stories.svelte`, `<script module>import { defineMeta } from '@storybook/addon-svelte-csf'; const { Story } = defineMeta({ title: 'Atoms/New', tags: ['autodocs'] });</script><Story name="Default" />`);
  const model = loadSourceModel(root);
  assert(model.stories.some((story) => story.file === 'src/stories/New.stories.svelte'));
  assert(model.inventory.untrackedCandidatePaths.has('src/stories/New.stories.svelte'));
});

test('reports Git discovery failures without throwing', () => {
  const root = mkdtempSync(path.join(os.tmpdir(), 'storybook-no-git-'));
  try {
    assert(loadSourceModel(root).diagnostics.some((item) => item.code === 'SB_DISCOVERY_GIT'));
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
