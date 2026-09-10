import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
export const DEFAULT_ROOT = path.resolve(SCRIPT_DIR, '../..');

function gitFiles(root, args) {
  return execFileSync('git', ['-C', root, 'ls-files', '-z', ...args], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  })
    .split('\0')
    .filter(Boolean)
    .map((entry) => entry.replaceAll('\\', '/'));
}

export function getGitInventory(root = DEFAULT_ROOT) {
  return {
    trackedPaths: new Set(gitFiles(root, [])),
    untrackedCandidatePaths: new Set(gitFiles(root, ['--others', '--exclude-standard'])),
  };
}

export function canonicalRepoPath(value) {
  if (typeof value !== 'string' || value.includes('\0')) return null;
  let normalized = value.replaceAll('\\', '/');
  while (normalized.startsWith('./')) normalized = normalized.slice(2);
  normalized = path.posix.normalize(normalized);
  if (!normalized || normalized === '.' || normalized.startsWith('/') || normalized === '..' || normalized.startsWith('../')) return null;
  return normalized;
}

export function repoPath(root, absolutePath) {
  return canonicalRepoPath(path.relative(root, absolutePath));
}

export function resolveLocalImport(root, fromFile, specifier, candidates) {
  if (!specifier.startsWith('.') && !specifier.startsWith('/')) return null;
  const base = specifier.startsWith('/')
    ? path.resolve(root, `.${specifier}`)
    : path.resolve(root, path.dirname(fromFile), specifier);
  const options = path.extname(base)
    ? [base]
    : [
        base,
        ...['.mjs', '.js', '.mts', '.ts', '.jsx', '.tsx', '.json'].map((extension) => `${base}${extension}`),
        ...['index.mjs', 'index.js', 'index.mts', 'index.ts', 'index.jsx', 'index.tsx', 'index.json'].map((name) => path.join(base, name)),
      ];
  for (const item of options) {
    const relative = canonicalRepoPath(path.relative(root, item));
    if (relative && (candidates.has(relative) || existsSync(item))) return relative;
  }
  return null;
}

export function readJson(file) {
  return JSON.parse(readFileSync(file, 'utf8'));
}
