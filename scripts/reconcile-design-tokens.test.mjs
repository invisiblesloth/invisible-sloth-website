import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import {
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import test from 'node:test';

import {
  extractPublicContract,
  validateExport,
} from './reconcile-design-tokens.mjs';

const projectRoot = resolve(import.meta.dirname, '..');
const reconcilerPath = resolve(
  projectRoot,
  'scripts/reconcile-design-tokens.mjs',
);
const generatedPaths = [
  'src/styles/tokens/colors.css',
  'src/styles/tokens/semantic.css',
  'src/styles/tokens/figma-reconciliation.json',
].map((path) => resolve(projectRoot, path));

test('derives reconciliation scope only from the public token registration', () => {
  const source = `:root {
  --theme-light-state-generated-only: red;
}

@theme {
  --color-primary-srgb: var(--theme-active-primary-srgb);
  --color-primary-p3: var(--theme-active-primary-p3);
  --color-primary: var(--theme-active-primary);
  --color-secondary: var(--theme-active-secondary);
  --color-state-primary-08: var(--theme-active-state-primary-08);
  --color-state-on-primary-12: var(--theme-active-state-on-primary-12);
  --color-link-underline-on-primary: var(--theme-active-link-underline-on-primary);
}`;

  const contract = extractPublicContract(source);

  assert.deepEqual(contract.pairedNames, ['primary']);
  assert.deepEqual(contract.schemeNames, ['primary', 'secondary']);
  assert.deepEqual(contract.stateNames, ['primary-08', 'on-primary-12']);
  assert.deepEqual(contract.underlineNames, ['on-primary']);
  assert.equal(contract.stateNames.includes('generated-only'), false);
});

test('requires every public semantic scheme token in the export', () => {
  const color = { type: 'color', value: '#000000ff' };
  const exportedTokens = {
    colors: {
      green: { '000': color },
      gray: { '000': color },
      blue: { '000': color },
      red: { '000': color },
    },
    spacing: {},
    theme: {
      light: { scheme: { primary: { primary: color } } },
      dark: {},
    },
    typescale: {},
    typeface: {},
    responsive: {},
    size: {},
  };

  assert.throws(
    () =>
      validateExport(exportedTokens, {
        schemeNames: ['primary', 'secondary'],
        stateNames: [],
        underlineNames: [],
      }),
    /Missing exported semantic token: light\/secondary/,
  );
});

test('rejects aliases outside the generated token scope', () => {
  const color = { type: 'color', value: '#000000ff' };
  const alias = { type: 'color', value: '{colors.purple.500}' };
  const exportedTokens = {
    colors: {
      green: { '000': color },
      gray: { '000': color },
      blue: { '000': color },
      red: { '000': color },
    },
    spacing: {},
    theme: {
      light: { scheme: { primary: { primary: alias } } },
      dark: {},
    },
    typescale: {},
    typeface: {},
    responsive: {},
    size: {},
  };

  assert.throws(
    () =>
      validateExport(exportedTokens, {
        schemeNames: ['primary'],
        stateNames: [],
        underlineNames: [],
      }),
    /references a primitive outside the generated scope/,
  );
});

test('rejects a malformed export without changing generated files', (context) => {
  const temporaryDirectory = mkdtempSync(
    resolve(tmpdir(), 'invisible-sloth-tokens-'),
  );
  context.after(() => rmSync(temporaryDirectory, { recursive: true, force: true }));

  const exportPath = resolve(temporaryDirectory, 'malformed-export.json');
  const color = { type: 'color', value: '#000000ff' };
  writeFileSync(
    exportPath,
    JSON.stringify({
      colors: {
        green: { '000': color },
        gray: { '000': color },
        blue: { '000': color },
        red: { '000': color },
      },
      spacing: {},
      theme: {},
      typescale: {},
      typeface: {},
      responsive: {},
      size: {},
    }),
  );

  const before = generatedPaths.map((path) => readFileSync(path, 'utf8'));
  context.after(() => {
    generatedPaths.forEach((path, index) => writeFileSync(path, before[index]));
  });
  const result = spawnSync(process.execPath, [reconcilerPath, exportPath], {
    cwd: projectRoot,
    encoding: 'utf8',
  });
  const after = generatedPaths.map((path) => readFileSync(path, 'utf8'));

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Expected theme\.light to be an object/);
  assert.deepEqual(after, before);
});
