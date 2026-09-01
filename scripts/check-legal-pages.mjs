import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const EFFECTIVE_DATE = '2026-09-01';
const LEGAL_PAGES = [
  {
    route: 'privacy',
    title: 'Invisible Sloth Website Privacy Policy',
    canonicalUrl: 'https://invisiblesloth.com/privacy',
    headings: [
      'The short version',
      '1. What this policy covers',
      '2. Information you send us and how we use it',
      '3. What happens when you visit the site',
      '4. Retention, privacy requests, and security',
      "5. Children's privacy",
      '6. Changes to this policy',
      '7. Contact',
      'Changelog',
    ],
    subheadings: [],
  },
  {
    route: 'terms',
    title: 'Invisible Sloth Website Terms of Use',
    canonicalUrl: 'https://invisiblesloth.com/terms',
    headings: [
      'The short version',
      '1. Agreement and scope',
      '2. Website content',
      '3. Permission, intellectual property, and definitions',
      '4. Prohibited uses',
      '5. Third-party services and privacy',
      '6. Disclaimer of warranties',
      '7. Limitation of liability',
      '8. Changes to these Terms',
      '9. Governing law, disputes, and severability',
      '10. Entire agreement',
      '11. Contact',
      'Changelog',
    ],
    subheadings: [
      'AI Training',
      'Source code and third-party materials',
      'Hosting and repository providers',
    ],
  },
];

const failures = [];

function fail(message) {
  failures.push(message);
}

function arraysMatch(actual, expected) {
  return actual.length === expected.length && actual.every((value, index) => value === expected[index]);
}

function countMatches(content, pattern) {
  return Array.from(content.matchAll(pattern)).length;
}

function checkExternalAnchors(relativePath, content) {
  const externalAnchors = content.match(/<a\b[^>]*\bhref="https:\/\/[^">]+"[^>]*>/g) ?? [];

  for (const anchor of externalAnchors) {
    const href = anchor.match(/\bhref="([^"]*)"/)?.[1] ?? '';

    if (href === 'https://invisiblesloth.com') {
      continue;
    }

    const rel = anchor.match(/\brel="([^"]*)"/)?.[1].split(/\s+/) ?? [];

    if (!/\btarget="_blank"/.test(anchor) || !rel.includes('noopener') || !rel.includes('noreferrer')) {
      fail(`${relativePath} has an external HTML link without target="_blank" and rel="noopener noreferrer".`);
    }
  }
}

async function checkSourcePage(page) {
  const relativePath = `src/pages/${page.route}.md`;
  const content = await readFile(path.join(ROOT, relativePath), 'utf8');
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n/);

  if (!frontmatterMatch) {
    fail(`${relativePath} is missing frontmatter.`);
    return;
  }

  const frontmatter = frontmatterMatch[1];
  const body = content.slice(frontmatterMatch[0].length);
  const expectedFrontmatter = [
    'layout: ../layouts/LegalDocumentLayout.astro',
    `title: ${page.title}`,
    `canonicalUrl: ${page.canonicalUrl}`,
  ];

  for (const field of expectedFrontmatter) {
    if (!frontmatter.includes(field)) {
      fail(`${relativePath} is missing expected frontmatter: ${field}`);
    }
  }

  const firstContentLine = body.split('\n').find((line) => line.trim());

  if (firstContentLine !== `# ${page.title}`) {
    fail(`${relativePath} must begin with the expected H1: ${page.title}`);
  }

  const headings = Array.from(body.matchAll(/^## (.+)$/gm), (match) => match[1]);
  const subheadings = Array.from(body.matchAll(/^### (.+)$/gm), (match) => match[1]);

  if (!arraysMatch(headings, page.headings)) {
    fail(`${relativePath} section headings no longer match the approved legal document.`);
  }

  if (!arraysMatch(subheadings, page.subheadings)) {
    fail(`${relativePath} subsection headings no longer match the approved legal document.`);
  }

  const changelogIndex = body.indexOf('## Changelog');
  if (changelogIndex !== -1) {
    const introduction = body.slice(0, changelogIndex);
    const changelog = body.slice(changelogIndex);

    for (const line of [
      `**Effective date:** ${EFFECTIVE_DATE}<br>`,
      `**Last updated:** ${EFFECTIVE_DATE}`,
    ]) {
      if (!changelog.includes(line)) {
        fail(`${relativePath} changelog is missing required publication metadata: ${line}`);
      }
    }

    if (/\*\*(?:Effective date|Last updated):\*\*/.test(introduction)) {
      fail(`${relativePath} must keep publication dates out of the introduction.`);
    }
  }

  if (body.includes('**Publisher:**')) {
    fail(`${relativePath} must not include redundant publisher metadata.`);
  }

  if (countMatches(body, /class="legal-document__table-scroll"/g) !== 1) {
    fail(`${relativePath} must contain exactly one responsive changelog table wrapper.`);
  }

  if (countMatches(body, /<table>/g) !== 1 || !body.includes('<thead>') || !body.includes('<tbody>')) {
    fail(`${relativePath} must contain one semantic changelog table.`);
  }

  if (/\[(?:https:\/\/)?invisiblesloth\.com\]\(\/\)/.test(body)) {
    fail(`${relativePath} displays the canonical domain but links to a local route.`);
  }

  const absoluteSameSiteLinks = Array.from(
    body.matchAll(/\]\((https:\/\/invisiblesloth\.com[^)]*)\)/g),
    (match) => match[1],
  );

  if (absoluteSameSiteLinks.some((href) => href !== 'https://invisiblesloth.com')) {
    fail(`${relativePath} contains an absolute same-site page link; use a root-relative route instead.`);
  }

  if (/\b(?:TODO|TBD|coming soon|placeholder)\b/i.test(body)) {
    fail(`${relativePath} contains placeholder content.`);
  }

  if (/\b(?:dates? above|at the top of this page|effective date stated above)\b/i.test(body)) {
    fail(`${relativePath} contains a stale publication-metadata reference.`);
  }

  checkExternalAnchors(relativePath, body);
}

async function checkBuiltPage(page) {
  const relativePath = `dist/${page.route}/index.html`;
  const absolutePath = path.join(ROOT, relativePath);

  if (!existsSync(absolutePath)) {
    fail(`${relativePath} is missing. Run npm run build before npm run check:legal.`);
    return;
  }

  const html = await readFile(absolutePath, 'utf8');
  const requiredMarkup = [
    `<title>${page.title}</title>`,
    `<link rel="canonical" href="${page.canonicalUrl}">`,
    `>${page.title}</h1>`,
    'class="legal-document__table-scroll"',
    'aria-label="Footer navigation"',
    'href="/privacy"',
    'href="/terms"',
  ];

  for (const markup of requiredMarkup) {
    if (!html.includes(markup)) {
      fail(`${relativePath} is missing expected rendered markup: ${markup}`);
    }
  }

  const robots = html.match(/<meta\b[^>]*\bname="robots"[^>]*>/)?.[0] ?? '';

  if (/noindex/i.test(robots)) {
    fail(`${relativePath} must remain indexable.`);
  }

  checkExternalAnchors(relativePath, html);
}

for (const page of LEGAL_PAGES) {
  await checkSourcePage(page);
  await checkBuiltPage(page);
}

if (failures.length > 0) {
  console.error('Legal page check failed:');

  for (const message of failures) {
    console.error(`- ${message}`);
  }

  process.exitCode = 1;
} else {
  console.log('Legal page check passed.');
}
