import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { cpSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { after, test } from 'node:test';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { parse } from 'parse5';
import { compile } from 'svelte/compiler';
import { render } from 'svelte/server';
import { buildSync } from 'esbuild';
import { resolveAppStoreHref } from '../src/lib/appStoreBadge.js';

const root = fileURLToPath(new URL('../', import.meta.url));
const fixture = mkdtempSync(path.join(tmpdir(), 'tracer-seo-'));
after(() => rmSync(fixture, { recursive: true, force: true }));

// Exercise the CLI against built pages without editing the real dist directory.
for (const dir of ['node_modules', 'public']) {
  symlinkSync(path.join(root, dir), path.join(fixture, dir), 'dir');
}
for (const file of ['navigationActive.js', 'appStoreBadge.js', 'tracerAppStore.js']) {
  cpSync(path.join(root, 'src/lib', file), path.join(fixture, 'src/lib', file));
}
cpSync(path.join(root, 'scripts/check-seo.mjs'), path.join(fixture, 'scripts/check-seo.mjs'));
cpSync(path.join(root, 'dist'), path.join(fixture, 'dist'), {
  recursive: true,
  filter: (file) => !path.extname(file) || /\.(html|xml|txt)$/.test(file),
});

// Render the real component in SSR/production mode so both fixture states
// exercise its branches, URL normalization, escaping, and accessible markup.
const componentPath = path.join(root, 'src/components/AppStoreBadge.svelte');
const compiled = compile(readFileSync(componentPath, 'utf8'), {
  filename: componentPath,
  generate: 'server',
});
const bundlePath = path.join(fixture, 'AppStoreBadge.mjs');
buildSync({
  stdin: { contents: compiled.js.code, resolveDir: path.dirname(componentPath) },
  bundle: true,
  packages: 'external',
  platform: 'node',
  format: 'esm',
  define: { 'import.meta.env.DEV': 'false' },
  outfile: bundlePath,
});
const { default: AppStoreBadge } = await import(pathToFileURL(bundlePath).href);

function renderBadge(href) {
  return render(AppStoreBadge, { props: { href } }).body;
}

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

function runSeoCheck(diagnostic, checker = path.join(fixture, 'scripts/check-seo.mjs')) {
  const result = spawnSync(process.execPath, [checker], {
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

test('accepts the unmodified site build', () =>
  runSeoCheck(undefined, path.join(root, 'scripts/check-seo.mjs')));

test('accepts the explicitly pending badge fixture', () => runSeoCheck());

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

const backupLink = (node) => node.tagName === 'a' && attribute(node, 'href') === '#data-and-backups';
const appStoreImage = (node) => node.tagName === 'img' &&
  attribute(node, 'src') === '/assets/download-on-the-app-store.svg';
function fixtureText(node) {
  return node.nodeName === '#text' ? node.value : (node.childNodes ?? []).map(fixtureText).join('');
}
const learnMoreLink = (node) => node.tagName === 'a' &&
  fixtureText(node).trim() === 'Learn More About Tracer';

test('requires the backup link in Use Tracer Free and allows a second link in the footer', () => {
  const diagnostic = /visible Data and Backups link in Use Tracer Free/;
  checkMutation(product, (html) => editElement(html, backupLink, (link) => {
    return link.replace('href="#data-and-backups"', 'href="#support"');
  }), diagnostic);

  const footerLink = '<a href="#data-and-backups">Data and Backups</a></footer>';
  checkMutation(product, (html) => editElement(html, backupLink, () => '')
    .replace('</footer>', footerLink), diagnostic);
  checkMutation(product, (html) => html.replace('</footer>', footerLink));
});

test('rejects hidden backup navigation, badge artwork, and homepage Learn More links', () => {
  const cases = [
    [product, backupLink, /visible Data and Backups link in Use Tracer Free/],
    [product, appStoreImage, /exactly one visible App Store badge image/],
    ['dist/index.html', learnMoreLink, /visible Learn More About Tracer link/],
  ];
  for (const [file, match, diagnostic] of cases) {
    for (const style of ['display:none', 'visibility:hidden']) {
      checkMutation(file, (html) => editElement(
        html, match, (markup) => withAttribute(markup, `style="${style}"`),
      ), diagnostic);
      checkMutation(file, (html) => editElement(
        html, match, (markup) => `<span style="${style}">${markup}</span>`,
      ), diagnostic);
    }
  }
});

const appStoreBadge = (node) => attribute(node, 'class')?.split(/\s+/).includes('app-store-badge');
const expectedListing = 'https://apps.apple.com/us/app/example/id123456789';

// Keep pending coverage after the real listing is configured. Only fixture
// copies are changed; the unmodified-build test checks the actual launch state.
writeFileSync(path.join(fixture, 'src/lib/tracerAppStore.js'),
  'export const TRACER_APP_STORE_URL = undefined;\n');
const fixtureProductPath = path.join(fixture, product);
writeFileSync(fixtureProductPath, editElement(readFileSync(fixtureProductPath, 'utf8'),
  appStoreBadge, () => renderBadge(undefined)));

// Expected state comes from source configuration, independently of the HTML.
function withLinkedFixture(run) {
  const config = path.join(fixture, 'src/lib/tracerAppStore.js');
  const configBefore = readFileSync(config, 'utf8');
  const output = path.join(fixture, product);
  const htmlBefore = readFileSync(output, 'utf8');
  try {
    writeFileSync(config, `export const TRACER_APP_STORE_URL = '${expectedListing}';\n`);
    writeFileSync(output, editElement(htmlBefore, appStoreBadge, () => renderBadge(expectedListing)));
    run();
  } finally {
    writeFileSync(config, configBefore);
    writeFileSync(output, htmlBefore);
  }
}

test('accepts the independently configured linked badge fixture', () => withLinkedFixture(() => runSeoCheck()));

for (const attribute of ['aria-hidden="true"', 'inert']) {
  test(`rejects ${attribute} on the page main in pending and linked builds`, () => {
    const main = (node) => node.tagName === 'main';
    const mutate = (html) => editElement(html, main, (markup) => withAttribute(markup, attribute));
    checkMutation(product, mutate, /badge must be accessible/);
    withLinkedFixture(() => checkMutation(product, mutate, /badge must be accessible/));
  });
}

test('rejects an accidentally linked pending badge', () => {
  checkMutation(product, (html) => editElement(html, appStoreImage,
    (image) => `<a href="${expectedListing}">${image}</a>`), /pending App Store badge must be noninteractive/);
});

for (const attribute of ['role="link"', 'role="button"', 'tabindex="0"', 'contenteditable="true"']) {
  test(`rejects a pending badge with ${attribute}`, () => {
    checkMutation(product, (html) => editElement(html, appStoreBadge,
      (markup) => withAttribute(markup, attribute)), /pending App Store badge must be noninteractive/);
  });
}

for (const [label, transform, diagnostic] of [
  ['missing image', () => '', /exactly one visible App Store badge image/],
  ['duplicate image', (image) => image + image, /exactly one visible App Store badge image/],
  ['empty alt', (image) => image.replace('alt="Download on the App Store"', 'alt=""'), /App Store badge alt text/],
  ['hidden accessible name', (image) => withAttribute(image, 'aria-hidden="true"'), /badge must be accessible/],
]) {
  test(`rejects ${label} in pending and linked builds`, () => {
    checkMutation(product, (html) => editElement(html, appStoreImage, transform), diagnostic);
    withLinkedFixture(() => checkMutation(product, (html) => editElement(html, appStoreImage, transform), diagnostic));
  });
}

for (const [label, transform, diagnostic] of [
  ['missing link', (markup) => markup.replace(/^<a[^>]*>/, '<span>').replace(/<\/a>$/, '</span>'), /exactly one enclosing link/],
  ['wrong destination', (markup) => markup.replace(expectedListing, 'https://apps.apple.com/app/id987654321'), /badge destination/],
  ['new tab', (markup) => withAttribute(markup, 'target="_blank"'), /same tab/],
  ['overridden name', (markup) => withAttribute(markup, 'aria-label="Wrong name"'), /image accessible name/],
  ['overridden role', (markup) => withAttribute(markup, 'role="button"'), /native link behavior/],
  ['removed tab stop', (markup) => withAttribute(markup, 'tabindex="-1"'), /native link behavior/],
]) {
  test(`rejects linked badge with ${label}`, () => withLinkedFixture(() => {
    checkMutation(product, (html) => editElement(html, appStoreBadge, transform), diagnostic);
  }));
}

test('requires the unchanged homepage Learn More destination', () => {
  checkMutation('dist/index.html', (html) => editElement(html, learnMoreLink,
    (markup) => markup.replace('href="/tracer/"', 'href="/"')), /visible Learn More About Tracer link/);
  checkMutation('dist/index.html', (html) => editElement(html, learnMoreLink, () => ''),
    /visible Learn More About Tracer link/);
});

test('rejects obsolete testing labels in the Tracer content on either page', () => {
  checkMutation(product, (html) => editElement(html, appStoreBadge,
    (markup) => `${markup}<p>Tracer is currently in private beta.</p>`), /obsolete Tracer testing status/);
  checkMutation('dist/index.html', (html) => editElement(html, learnMoreLink,
    (markup) => `${markup}<span>In External Testing</span>`), /obsolete Tracer testing status/);
});

test('requires the visible homepage platform badge', () => {
  const platform = (node) => attribute(node, 'class')?.split(/\s+/).includes('badge__label') &&
    node.childNodes.some((child) => child.value === 'Apple Platforms');
  checkMutation('dist/index.html', (html) => editElement(html, platform, () => ''), /visible Tracer platform badge/);
});

test('URL normalization distinguishes an omitted destination from malformed values', () => {
  assert.deepEqual(resolveAppStoreHref(undefined), { href: undefined, invalid: false });
  for (const value of ['', '   ', null, 42, {}, '#', '/app/id123',
    'https://apps.apple.com/', 'http://apps.apple.com/app/id123',
    'javascript:alert(1)', 'https://apps.apple.com.evil.example/app/id123',
    'https://user:secret@apps.apple.com/app/id123',
    'https://apps.apple.com:444/app/id123', 'https://apps.apple.com/app/id0000000000']) {
    assert.deepEqual(resolveAppStoreHref(value), { href: undefined, invalid: true });
  }
  for (const url of ['https://apps.apple.com/app/id123', expectedListing,
    'https://apps.apple.com/gb/app/example/id123/?ct=website#details']) {
    assert.deepEqual(resolveAppStoreHref(`  ${url}  `), { href: url, invalid: false });
  }
});

test('malformed URL spellings render an accessible, noninteractive SSR fallback', () => {
  for (const value of [undefined, '', '   ', null, 42, 'https://example.com/app/id123',
    'https://apps.ap\tple.com/app/id123', 'https://apps.apple.com/app/id1\n23',
    'https://apps.apple.com\\app\\id123', 'https://apps.apple.com/app/example name/id123',
    'https://apps.apple.com/app/example\u00a0name/id123']) {
    if (value !== undefined) {
      assert.deepEqual(resolveAppStoreHref(value), { href: undefined, invalid: true });
    }
    const document = parse(renderBadge(value));
    const image = findElement(document, appStoreImage);
    assert.ok(image);
    assert.equal(attribute(image, 'alt'), 'Download on the App Store');
    assert.equal(attribute(image.parentNode, 'role'), undefined);
    assert.equal(attribute(image.parentNode, 'tabindex'), undefined);
    assert.equal(image.parentNode.tagName, 'span');
    assert.equal(findElement(document, (node) => node.tagName === 'a'), undefined);
  }
});

test('linked SSR output trims URLs, escapes campaign values, and retains the image accessible name', () => {
  const expected = `${expectedListing}?ct=website&pt=123#details`;
  const document = parse(renderBadge(`  ${expected}  `));
  const link = findElement(document, (node) => node.tagName === 'a');
  assert.ok(link);
  assert.equal(attribute(link, 'href'), expected);
  assert.equal(attribute(link, 'target'), undefined);
  assert.equal(attribute(link, 'aria-label'), undefined);
  assert.equal(attribute(findElement(link, appStoreImage), 'alt'), 'Download on the App Store');
});
