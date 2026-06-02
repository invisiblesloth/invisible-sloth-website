import { existsSync } from 'node:fs';
import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE_EXTENSIONS = new Set([
  '.astro',
  '.css',
  '.js',
  '.jsx',
  '.md',
  '.svelte',
  '.ts',
  '.tsx',
]);
const GENERATED_CLASS_EXCEPTIONS = [
  "[class^='s-']:not([class*=' '])",
  "[class^='svelte-']:not([class*=' '])",
];

const failures = [];
const notes = [];

function fail(message) {
  failures.push(message);
}

async function readProjectFile(relativePath) {
  return readFile(path.join(ROOT, relativePath), 'utf8');
}

function isAllowedRichTextReference(relativePath) {
  return (
    relativePath === 'src/components/RichTextBlock.svelte' ||
    relativePath === 'src/styles/rich-text.css' ||
    relativePath === 'src/components/README.md' ||
    relativePath.startsWith('src/stories/')
  );
}

async function walkFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const absolutePath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await walkFiles(absolutePath)));
      continue;
    }

    if (entry.isFile()) {
      files.push(absolutePath);
    }
  }

  return files;
}

function relativeProjectPath(absolutePath) {
  return path.relative(ROOT, absolutePath).split(path.sep).join('/');
}

function findManualRichTextClasses(content) {
  const matches = [];
  const classDirectivePattern = /\bclass:rich-text(?![-\w])/g;
  const classTokenPattern = /(^|\s)rich-text(?=\s|$)/;
  const stringLiteralPattern = /(["'`])((?:\\.|(?!\1)[\s\S])*?)\1/g;

  for (const match of content.matchAll(classDirectivePattern)) {
    matches.push(match[0]);
  }

  for (const match of content.matchAll(stringLiteralPattern)) {
    if (classTokenPattern.test(match[2])) {
      matches.push(match[0]);
    }
  }

  return matches;
}

async function checkSourceContract() {
  const richTextCss = await readProjectFile('src/styles/rich-text.css');
  const linksCss = await readProjectFile('src/styles/links.css');
  const globalCss = await readProjectFile('src/styles/global.css');
  const richTextBlock = await readProjectFile('src/components/RichTextBlock.svelte');

  if (/@layer\b/.test(richTextCss)) {
    fail('src/styles/rich-text.css must stay unlayered to preserve RichTextBlock cascade behavior.');
  }

  if (linksCss.includes('.rich-text')) {
    fail('src/styles/links.css must not contain .rich-text selectors; it owns only .text-link.');
  }

  if (!/@layer\s+components\b/.test(linksCss)) {
    fail('src/styles/links.css must keep .text-link rules in @layer components.');
  }

  for (const exception of GENERATED_CLASS_EXCEPTIONS) {
    if (!richTextCss.includes(exception)) {
      fail(`src/styles/rich-text.css is missing generated Svelte class exception: ${exception}`);
    }
  }

  if (richTextBlock.includes('<style')) {
    fail('src/components/RichTextBlock.svelte should not own prose CSS after the cleanup.');
  }

  for (const requiredClass of ["'rich-text'", "'text-body-responsive'"]) {
    if (!richTextBlock.includes(requiredClass)) {
      fail(`src/components/RichTextBlock.svelte root class composition is missing ${requiredClass}.`);
    }
  }

  const linksImportIndex = globalCss.indexOf('@import "./links.css";');
  const richTextImportIndex = globalCss.indexOf('@import "./rich-text.css";');

  if (linksImportIndex === -1) {
    fail('src/styles/global.css is missing the links.css import.');
  }

  if (richTextImportIndex === -1) {
    fail('src/styles/global.css is missing the rich-text.css import.');
  }

  if (linksImportIndex !== -1 && richTextImportIndex !== -1 && linksImportIndex > richTextImportIndex) {
    fail('src/styles/global.css must import links.css before rich-text.css.');
  }

  const sourceFiles = await walkFiles(path.join(ROOT, 'src'));

  for (const absolutePath of sourceFiles) {
    const extension = path.extname(absolutePath);

    if (!SOURCE_EXTENSIONS.has(extension)) {
      continue;
    }

    const relativePath = relativeProjectPath(absolutePath);
    const content = await readFile(absolutePath, 'utf8');

    if (!isAllowedRichTextReference(relativePath) && content.includes('.rich-text')) {
      fail(`${relativePath} contains a .rich-text selector/reference outside the allowed owner/docs/stories boundary.`);
    }

    if (!isAllowedRichTextReference(relativePath)) {
      const manualClassMatches = findManualRichTextClasses(content);

      if (manualClassMatches.length > 0) {
        fail(`${relativePath} manually authors class="rich-text" outside the allowed owner/docs/stories boundary.`);
      }
    }
  }
}

async function linkedStylesheetHrefs(html) {
  return Array.from(html.matchAll(/<link\b[^>]*>/g))
    .map(([tag]) => {
      if (!/\brel=(["'])stylesheet\1/.test(tag)) {
        return '';
      }

      const href = tag.match(/\bhref=(["'])(.*?)\1/);
      return href?.[2] ?? '';
    })
    .filter(Boolean);
}

async function checkBuiltCssOrder() {
  const distAstroPath = path.join(ROOT, 'dist/_astro');
  const tracerHtmlPath = path.join(ROOT, 'dist/tracer/index.html');

  if (!existsSync(distAstroPath) || !existsSync(tracerHtmlPath)) {
    notes.push('Skipped built CSS order check because dist/ is not present. Run npm run build first.');
    return;
  }

  const tracerHtml = await readFile(tracerHtmlPath, 'utf8');
  const hrefs = await linkedStylesheetHrefs(tracerHtml);
  const orderedCss = [];

  for (const href of hrefs) {
    if (!href.startsWith('/_astro/') || !href.endsWith('.css')) {
      continue;
    }

    const filePath = path.join(ROOT, 'dist', href);

    if (!existsSync(filePath)) {
      fail(`Built HTML references missing stylesheet: ${href}`);
      continue;
    }

    orderedCss.push({
      href,
      content: await readFile(filePath, 'utf8'),
    });
  }

  const firstTextLink = firstSelectorOccurrence(orderedCss, '.text-link');
  const firstRichText = firstSelectorOccurrence(orderedCss, '.rich-text');

  if (!firstTextLink) {
    fail('Built CSS does not contain .text-link rules.');
  }

  if (!firstRichText) {
    fail('Built CSS does not contain .rich-text rules.');
  }

  if (firstTextLink && firstRichText && compareOccurrences(firstTextLink, firstRichText) > 0) {
    fail('Built CSS emits .rich-text before .text-link; generated CSS no longer matches the expected global import order.');
  }
}

function firstSelectorOccurrence(stylesheets, selector) {
  for (let stylesheetIndex = 0; stylesheetIndex < stylesheets.length; stylesheetIndex += 1) {
    const selectorIndex = stylesheets[stylesheetIndex].content.indexOf(selector);

    if (selectorIndex !== -1) {
      return {
        href: stylesheets[stylesheetIndex].href,
        stylesheetIndex,
        selectorIndex,
      };
    }
  }

  return null;
}

function compareOccurrences(left, right) {
  if (left.stylesheetIndex !== right.stylesheetIndex) {
    return left.stylesheetIndex - right.stylesheetIndex;
  }

  return left.selectorIndex - right.selectorIndex;
}

await stat(ROOT);
await checkSourceContract();
await checkBuiltCssOrder();

if (failures.length > 0) {
  console.error('RichTextBlock contract check failed:');

  for (const message of failures) {
    console.error(`- ${message}`);
  }

  process.exitCode = 1;
} else {
  console.log('RichTextBlock contract check passed.');

  for (const note of notes) {
    console.log(`- ${note}`);
  }
}
