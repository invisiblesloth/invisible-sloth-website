#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { printDiagnostics } from './diagnostics.mjs';
import { validateGeneratedIndex } from './index-checks.mjs';
import { DEFAULT_ROOT } from './paths.mjs';
import { validateSource } from './source-checks.mjs';

export function runVerification({ root = DEFAULT_ROOT, run = spawnSync, makeTemp = mkdtempSync, remove = rmSync } = {}) {
  const stages = [
    ['source and type checks', ['run', 'check:storybook']],
    ['checker tests', ['run', 'test:storybook-checks']],
  ];
  for (const [label, args] of stages) {
    console.log(`Running ${label}...`);
    const result = run('npm', args, { cwd: root, stdio: 'inherit' });
    if (result.error || result.status === null) return 2;
    if (result.status === 2) return 2;
    if (result.status !== 0) return 1;
  }
  const tempRoot = makeTemp(path.join(os.tmpdir(), 'storybook-verify-'));
  const outputDir = path.join(tempRoot, 'storybook-static');
  try {
    if (existsSync(outputDir)) {
      console.error('Fresh Storybook output path already exists.');
      return 1;
    }
    const evidence = { outputDir, startedAt: Date.now(), success: false };
    console.log('Building Storybook once for generated-index evidence...');
    const result = run('npm', ['run', 'build-storybook', '--', '--output-dir', outputDir], { cwd: root, stdio: 'inherit' });
    if (result.error || result.status === null) return 2;
    if (result.status === 2) return 2;
    if (result.status !== 0) return 1;
    evidence.success = true;
    evidence.finishedAt = Date.now();
    const { model, registry, diagnostics: sourceDiagnostics } = validateSource({ root });
    if (sourceDiagnostics.length) {
      printDiagnostics(sourceDiagnostics, 'Storybook post-build source checks');
      return 1;
    }
    const diagnostics = validateGeneratedIndex({ indexPath: path.join(outputDir, 'index.json'), sourceModel: model, registry, buildEvidence: evidence });
    printDiagnostics(diagnostics, 'Storybook generated-index checks');
    return diagnostics.length ? 1 : 0;
  } finally {
    remove(tempRoot, { recursive: true, force: true });
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try { process.exitCode = runVerification(); }
  catch (error) {
    console.error(`Storybook verification failed internally: ${error.stack ?? error.message}`);
    process.exitCode = 2;
  }
}
