import test from 'node:test';
import assert from 'node:assert/strict';
import { runVerification } from './verify.mjs';

test('verification stops before building when an earlier stage fails', () => {
  const calls = [];
  const status = runVerification({ root: '/fixture', run(command, args) { calls.push([command, args]); return { status: 1 }; }, makeTemp() { throw new Error('must not allocate'); } });
  assert.equal(status, 1);
  assert.equal(calls.length, 1);
});

test('verification builds Storybook exactly once after both gates pass', () => {
  const calls = [];
  const removals = [];
  const status = runVerification({ root: '/fixture', run(command, args) { calls.push([command, args]); return args.includes('build-storybook') ? { status: 1 } : { status: 0 }; }, makeTemp() { return '/tmp/storybook-verify-unit'; }, remove(...args) { removals.push(args); } });
  assert.equal(status, 1);
  assert.equal(calls.filter(([, args]) => args.includes('build-storybook')).length, 1);
  assert.equal(removals.length, 1);
  assert.equal(removals[0][0], '/tmp/storybook-verify-unit');
});

test('verification reserves exit 2 for command execution failures', () => {
  const status = runVerification({ root: '/fixture', run() { return { error: new Error('spawn failed') }; }, makeTemp() { throw new Error('must not allocate'); } });
  assert.equal(status, 2);
  const signaled = runVerification({ root: '/fixture', run() { return { status: null, signal: 'SIGTERM' }; }, makeTemp() { throw new Error('must not allocate'); } });
  assert.equal(signaled, 2);

  let call = 0;
  const buildStatus = runVerification({ root: '/fixture', run() { call += 1; return { status: call === 3 ? 2 : 0 }; }, makeTemp() { return '/tmp/storybook-verify-unit'; }, remove() {} });
  assert.equal(buildStatus, 2);
});

test('verification preserves an earlier validator internal-failure exit', () => {
  const status = runVerification({ root: '/fixture', run() { return { status: 2 }; }, makeTemp() { throw new Error('must not allocate'); } });
  assert.equal(status, 2);
});
