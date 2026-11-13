import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { cpSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { after, test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { parse } from 'parse5';

const root = fileURLToPath(new URL('../', import.meta.url));
const fixture = mkdtempSync(path.join(tmpdir(), 'tracer-seo-'));
after(() => rmSync(fixture, { recursive: true, force: true }));

// Exercise the CLI against built pages without editing the real dist directory.
for (const dir of ['node_modules', 'src', 'public']) {
  symlinkSync(path.join(root, dir), path.join(fixture, dir), 'dir');
}
cpSync(path.join(root, 'scripts/check-seo.mjs'), path.join(fixture, 'scripts/check-seo.mjs'));
cpSync(path.join(root, 'dist'), path.join(fixture, 'dist'), {
  recursive: true,
  filter: (file) => !path.extname(file) || /\.(html|xml|txt)$/.test(file),
});

const product = 'dist/tracer/index.html';
const outerSection = (node) => node.tagName === 'section' &&
  attribute(node, 'class')?.split(/\s+/).includes('tracer-page__section');

function attribute(node, name) {
  return node.attrs?.find((attr) => attr.name === name)?.value;
}

function findElement(node, match) {
  if (node.tagName && match(node)) {
    return node;
  }
  for (const child of node.childNodes ?? []) {
    const found = findElement(child, match);
    if (found) return found;
  }
}

function editElement(html, match, edit) {
  const element = findElement(parse(html, { sourceCodeLocationInfo: true }), match);
  assert.ok(element, 'Expected to find the rendered element');
  const { startOffset, endOffset } = element.sourceCodeLocation;
  return html.slice(0, startOffset) + edit(html.slice(startOffset, endOffset)) + html.slice(endOffset);
}

function withAttribute(markup, value) {
  return markup.replace(/^(<[^\s>]+)/, `$1 ${value}`);
}

function runSeoCheck(diagnostic) {
  const result = spawnSync(process.execPath, [path.join(fixture, 'scripts/check-seo.mjs')], {
    encoding: 'utf8',
  });
  if (result.error) throw result.error;
  assert.equal(result.status, diagnostic ? 1 : 0, result.stderr);
  if (diagnostic) assert.match(result.stderr, diagnostic);
}

function checkMutation(file, mutate, diagnostic) {
  const output = path.join(fixture, file);
  const original = readFileSync(output, 'utf8');
  const modified = mutate(original);
  assert.notEqual(modified, original);
  try {
    writeFileSync(output, modified);
    runSeoCheck(diagnostic);
  } finally {
    writeFileSync(output, original);
  }
}

test('accepts the unmodified site build', () => runSeoCheck());

test('rejects a Support fragment moved to the outer Tracer section', () => {
  checkMutation(product, (html) => editElement(
    html.replace('id="support"', 'id="old-support"'),
    outerSection,
    (markup) => withAttribute(markup, 'id="support"'),
  ), /id="support" must belong to the nearest section/);
});

test('rejects a backup fragment attached to the wrong section', () => {
  checkMutation(product, (html) => editElement(
    html.replace('id="data-and-backups"', 'id="old-backup"'),
    outerSection,
    (markup) => withAttribute(markup, 'id="data-and-backups"'),
  ), /id="data-and-backups" must belong to the Data and Backups section/);
});

for (const id of ['support', 'data-and-backups']) {
  const match = (node) => attribute(node, 'id') === id;
  const diagnostic = new RegExp(`id="${id}" must be visible`);

  test(`rejects a duplicate ${id} ID even on a hidden element`, () => {
    checkMutation(product, (html) => html.replace('<main ', `<div hidden id="${id}"></div><main `),
      new RegExp(`unique section with id="${id}"`));
  });

  test(`rejects a hidden ${id} target or ancestor`, () => {
    for (const value of [
      'hidden', 'class="hidden"', 'class="invisible"', 'style="display:none"', 'style="visibility:hidden"',
    ]) {
      checkMutation(product, (html) => editElement(html, match, (markup) => {
        // Keep existing classes when adding a visibility utility.
        if (value.startsWith('class=') && /^<[^>]* class="/.test(markup)) {
          return markup.replace(/^(<[^>]* class=")/, `$1${value.slice(7, -1)} `);
        }
        return withAttribute(markup, value);
      }), diagnostic);
      checkMutation(product, (html) => editElement(
        html, match, (markup) => `<div ${value}>${markup}</div>`,
      ), diagnostic);
    }
  });
}

test('resolves inline display overrides without matching text in other declarations', () => {
  const backup = (node) => attribute(node, 'id') === 'data-and-backups';
  for (const style of ['display:none; display:block', '--sample:";display:none"; display:block']) {
    checkMutation(product, (html) => editElement(
      html, backup, (markup) => withAttribute(markup, `style='${style}'`),
    ));
  }
  checkMutation(product, (html) => editElement(
    html, backup, (markup) => withAttribute(markup, 'style="DISPLAY: /* comment */ NONE !important; display:block"'),
  ), /id="data-and-backups" must be visible/);
});

const backupTarget = (node) => attribute(node, 'id') === 'data-and-backups';

test('honors a later inline visibility override', () => {
  checkMutation(product, (html) => editElement(
    html, backupTarget, (markup) => withAttribute(markup, 'style="visibility:hidden; visibility:visible"'),
  ));
});

test('ignores display:none with an invalid priority', () => {
  checkMutation(product, (html) => editElement(
    html, backupTarget, (markup) => withAttribute(markup, 'style="display:none !importnt"'),
  ));
});

test('ignores an invalid priority on a later display override', () => {
  checkMutation(product, (html) => editElement(
    html, backupTarget, (markup) => withAttribute(markup, 'style="display:none; display:block !importnt"'),
  ), /id="data-and-backups" must be visible/);
});

test('honors mixed-case important inline display priorities', () => {
  checkMutation(product, (html) => editElement(
    html, backupTarget, (markup) => withAttribute(markup, 'style="display:none !important; display:block !ImPoRtAnT"'),
  ));
  checkMutation(product, (html) => editElement(
    html, backupTarget, (markup) => withAttribute(markup, 'style="display:none !ImPoRtAnT; display:block"'),
  ), /id="data-and-backups" must be visible/);
});
