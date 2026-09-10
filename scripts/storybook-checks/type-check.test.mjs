import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { DEFAULT_ROOT } from './paths.mjs';

function check(name) {
  const workspace = `scripts/storybook-checks/fixtures/type/${name}`;
  return spawnSync(path.join(DEFAULT_ROOT, 'node_modules/.bin/svelte-check'), ['--workspace', workspace, '--config', '../../../../../svelte.config.js', '--tsconfig', './tsconfig.json', '--output', 'machine-verbose', '--threshold', 'error', '--diagnostic-sources', 'js,svelte,css'], { cwd: DEFAULT_ROOT, encoding: 'utf8' });
}

function machineErrors(result) {
  return result.stdout.split(/\r?\n/).flatMap((line) => {
    const json = line.slice(line.indexOf('{'));
    if (!json.startsWith('{')) return [];
    try { const value = JSON.parse(json); return value.type === 'ERROR' ? [value] : []; } catch { return []; }
  });
}

for (const [name, file] of [['invalid-csf', 'InvalidCsf.svelte'], ['invalid-render', 'InvalidRender.svelte']]) test(`${name} fails with the exact TypeScript diagnostic, not setup noise`, () => {
  const result = check(name);
  const errors = machineErrors(result);
  assert.notEqual(result.status, 0);
  assert.equal(errors.length, 1);
  assert.equal(errors[0].filename, file);
  assert.equal(errors[0].source, 'ts');
  assert.equal(errors[0].code, 2322);
  assert.match(errors[0].message, /diagonal/);
});

test('narrowly asserted malformed runtime input demonstrates the checker limitation', () => {
  const result = check('asserted-runtime');
  assert.equal(result.status, 0, result.stdout + result.stderr);
  assert.deepEqual(machineErrors(result), []);
});
