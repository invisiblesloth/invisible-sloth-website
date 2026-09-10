#!/usr/bin/env node
import { DEFAULT_ROOT } from './paths.mjs';
import { printDiagnostics } from './diagnostics.mjs';
import { validateSource } from './source-checks.mjs';

const [command, ...rest] = process.argv.slice(2);
if (command !== 'source' || rest.length) {
  console.error('Usage: node scripts/storybook-checks/cli.mjs source');
  process.exitCode = 2;
} else {
  try {
    const { diagnostics, model } = validateSource({ root: DEFAULT_ROOT });
    printDiagnostics(diagnostics);
    if (!diagnostics.length) {
      const untrackedStories = model.stories.filter((story) => model.inventory.untrackedCandidatePaths.has(story.file)).length;
      console.log(`Checked ${model.stories.length} story source(s), including ${untrackedStories} non-ignored untracked candidate(s).`);
    }
    process.exitCode = diagnostics.length ? 1 : 0;
  } catch (error) {
    console.error(`Storybook source checks failed internally: ${error.stack ?? error.message}`);
    process.exitCode = 2;
  }
}
