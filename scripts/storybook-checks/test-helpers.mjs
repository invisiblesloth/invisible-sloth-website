import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { after } from 'node:test';
import os from 'node:os';
import path from 'node:path';

const temporaryRepositories = new Set();

after(() => {
  for (const root of temporaryRepositories) rmSync(root, { recursive: true, force: true });
});

export function write(root, file, content) {
  mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
  writeFileSync(path.join(root, file), content);
}

export function makeRepository({ story, component, registry, extras = {} } = {}) {
  const root = mkdtempSync(path.join(os.tmpdir(), 'storybook-check-test-'));
  temporaryRepositories.add(root);
  write(root, '.storybook/main.ts', `export default { stories: ['../src/stories/**/*.stories.svelte'], addons: ['@storybook/addon-svelte-csf','@storybook/addon-docs','@storybook/addon-a11y'], framework: { name: '@storybook/svelte-vite', options: { docgen: false } }, async viteFinal(config) { return config; } };`);
  write(root, '.storybook/preview.ts', `export default { parameters: { options: { storySort: { order: ['Brand','Foundations','Atoms','Molecules','Organisms','Templates'] } }, viewport: { options: { compact: { name: 'Compact', styles: { width: '430px', height: '932px' } }, medium: { name: 'Medium', styles: { width: '744px', height: '1133px' } }, extended: { name: 'Extended', styles: { width: '1024px', height: '1366px' } }, large: { name: 'Large', styles: { width: '1512px', height: '982px' } } } } }, initialGlobals: { viewport: { value: 'large', isRotated: false } } };`);
  write(root, 'src/components/Thing.svelte', component ?? `<script module lang="ts">export type ThingProps = { label: string; count?: number };</script><script lang="ts">let { label, count = 0 }: ThingProps = $props();</script><p>{label} {count}</p>`);
  write(root, 'src/stories/Thing.stories.svelte', story ?? `<script module lang="ts">import { defineMeta } from '@storybook/addon-svelte-csf'; import Thing from '../components/Thing.svelte'; const { Story } = defineMeta({ title: 'Atoms/Thing', component: Thing, tags: ['autodocs'], args: { label: 'ok' }, argTypes: { label: { control: 'text', description: 'Label.' }, count: { control: 'number', description: 'Count.' } } });</script><Story name="Default" args={{ count: 1 }} />`);
  write(root, '.storybook/inventory.json', JSON.stringify(registry ?? { schemaVersion: 1, exceptions: [], judgmentApprovals: [], protectedIds: [] }, null, 2));
  for (const [file, content] of Object.entries(extras)) write(root, file, content);
  execFileSync('git', ['init', '-q'], { cwd: root });
  execFileSync('git', ['add', '.'], { cwd: root });
  return root;
}

export function codes(diagnostics) {
  return diagnostics.map((item) => item.code);
}
