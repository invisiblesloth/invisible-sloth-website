import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';
import {
  getNavigationAriaCurrent,
  hasExactActiveNavigationItem,
} from '../src/lib/navigationActive.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SITE_ORIGIN = 'https://invisiblesloth.com';
const SOCIAL_IMAGE_URL = `${SITE_ORIGIN}/social-card.png`;
const SOCIAL_IMAGE_ALT =
  'Invisible Sloth social card featuring the Invisible Sloth name, “Imaginative Games & Apps,” and Sloth-Luc, the ghost sloth logo.';
const DEFAULT_ROBOTS = 'index, follow, max-image-preview:large, noai, noimageai';
const NOT_FOUND_ROBOTS = 'noindex, nofollow, noai, noimageai';
const EXPECTED_ROBOTS_FILE = `${[
  'User-agent: *',
  'Content-signal: search=yes, ai-input=yes, ai-train=no',
  'Allow: /',
  '',
  '# AI model-training and dataset crawlers',
  'User-agent: Amazonbot',
  'Disallow: /',
  '',
  'User-agent: Applebot-Extended',
  'Disallow: /',
  '',
  'User-agent: Bytespider',
  'Disallow: /',
  '',
  'User-agent: CCBot',
  'Disallow: /',
  '',
  'User-agent: ClaudeBot',
  'Disallow: /',
  '',
  'User-agent: Google-Extended',
  'Disallow: /',
  '',
  'User-agent: GPTBot',
  'Disallow: /',
  '',
  'User-agent: meta-externalagent',
  'Disallow: /',
  '',
  `Sitemap: ${SITE_ORIGIN}/sitemap-index.xml`,
].join('\n')}\n`;

const ROUTES = [
  {
    path: '/',
    output: 'dist/index.html',
    title: 'Invisible Sloth | Tracer, Games & Developer Tools',
    description:
      'Invisible Sloth creates Tracer, a private iPhone time tracker, the Roxy Playdate game engine, and Drawing Zoo, a collaborative board game.',
    structuredData: 'homepage',
  },
  {
    path: '/tracer/',
    output: 'dist/tracer/index.html',
    title: 'Tracer: Private Time Tracker for iPhone | Invisible Sloth',
    description:
      'Tracer is a private, on-device time tracker for iPhone. Track activities, edit or add entries, review reports, and export your data—no account required.',
    structuredData: 'tracer',
  },
  {
    path: '/privacy/',
    output: 'dist/privacy/index.html',
    title: 'Invisible Sloth Website Privacy Policy',
    description: 'Privacy policy for the Invisible Sloth website.',
  },
  {
    path: '/terms/',
    output: 'dist/terms/index.html',
    title: 'Invisible Sloth Website Terms of Use',
    description: 'Terms of use for the Invisible Sloth website.',
  },
  {
    path: '/tracer/privacy/',
    output: 'dist/tracer/privacy/index.html',
    title: 'Tracer Privacy Policy',
    description:
      'Privacy policy for Tracer, the local-only iOS time tracker from Invisible Sloth, LLC.',
  },
  {
    path: '/tracer/terms/',
    output: 'dist/tracer/terms/index.html',
    title: 'Tracer Terms of Use',
    description:
      'Terms of Use for Tracer, the local-only iOS time tracker from Invisible Sloth, LLC.',
  },
];

const EXPECTED_URLS = ROUTES.map((route) => `${SITE_ORIGIN}${route.path}`);
const CANONICAL_PATHS = new Map(
  ROUTES.map((route) => [normalizePath(route.path), route.path]),
);
const PROHIBITED_APPLICATION_KEYS = new Set([
  'offers',
  'aggregateRating',
  'review',
  'downloadUrl',
  'installUrl',
  'softwareVersion',
]);
const failures = [];

function fail(message) {
  failures.push(message);
}

function normalizePath(pathname) {
  return pathname.replace(/\/+$/, '') || '/';
}

function decodeHtml(value) {
  const namedEntities = {
    amp: '&',
    apos: "'",
    gt: '>',
    lt: '<',
    quot: '"',
  };

  return value
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)))
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number.parseInt(code, 10)))
    .replace(/&(amp|apos|gt|lt|quot);/g, (_, name) => namedEntities[name]);
}

function parseAttributes(tag) {
  const attributes = new Map();
  const content = tag.replace(/^<[^\s>]+|\/?\s*>$/g, '');
  const pattern = /([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g;

  for (const match of content.matchAll(pattern)) {
    attributes.set(
      match[1].toLowerCase(),
      decodeHtml(match[2] ?? match[3] ?? match[4] ?? ''),
    );
  }

  return attributes;
}

function tagsNamed(html, name) {
  return html.match(new RegExp(`<${name}\\b[^>]*>`, 'gi')) ?? [];
}

function metaContents(html, key, value) {
  return tagsNamed(html, 'meta')
    .map((tag) => parseAttributes(tag))
    .filter((attributes) => attributes.get(key) === value)
    .map((attributes) => attributes.get('content'));
}

function metaContent(html, key, value) {
  return metaContents(html, key, value)[0];
}

function linksWithRel(html, rel) {
  return tagsNamed(html, 'link')
    .map((tag) => parseAttributes(tag))
    .filter((attributes) => (attributes.get('rel') ?? '').split(/\s+/).includes(rel))
    .map((attributes) => ({ href: attributes.get('href'), attributes }));
}

function linkHref(html, rel) {
  return linksWithRel(html, rel)[0];
}

function titleText(html) {
  const match = html.match(/<title>([\s\S]*?)<\/title>/i);
  return match ? decodeHtml(match[1]) : undefined;
}

function assertEqual(actual, expected, label) {
  if (actual !== expected) {
    fail(`${label}: expected ${JSON.stringify(expected)}, received ${JSON.stringify(actual)}.`);
  }
}

function assertDeepEqual(actual, expected, label) {
  if (!isDeepStrictEqual(actual, expected)) {
    fail(`${label} does not match the expected structure.`);
  }
}

function expectedIdentityNodes() {
  return [
    {
      '@type': 'WebSite',
      '@id': `${SITE_ORIGIN}/#website`,
      url: `${SITE_ORIGIN}/`,
      name: 'Invisible Sloth',
      alternateName: 'invisiblesloth.com',
      publisher: { '@id': `${SITE_ORIGIN}/#organization` },
    },
    {
      '@type': 'Organization',
      '@id': `${SITE_ORIGIN}/#organization`,
      name: 'Invisible Sloth',
      legalName: 'Invisible Sloth, LLC',
      url: `${SITE_ORIGIN}/`,
      sameAs: ['https://github.com/invisiblesloth'],
      logo: { '@id': `${SITE_ORIGIN}/#logo` },
    },
    {
      '@type': 'ImageObject',
      '@id': `${SITE_ORIGIN}/#logo`,
      url: `${SITE_ORIGIN}/apple-touch-icon.png`,
      contentUrl: `${SITE_ORIGIN}/apple-touch-icon.png`,
      width: 180,
      height: 180,
    },
  ];
}

function expectedHomepageGraph() {
  return {
    '@context': 'https://schema.org',
    '@graph': expectedIdentityNodes(),
  };
}

function expectedTracerGraph(route) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      ...expectedIdentityNodes(),
      {
        '@type': 'WebPage',
        '@id': `${SITE_ORIGIN}/tracer/#webpage`,
        url: `${SITE_ORIGIN}/tracer/`,
        name: route.title,
        description: route.description,
        isPartOf: { '@id': `${SITE_ORIGIN}/#website` },
        mainEntity: { '@id': `${SITE_ORIGIN}/tracer/#app` },
      },
      {
        '@type': 'MobileApplication',
        '@id': `${SITE_ORIGIN}/tracer/#app`,
        url: `${SITE_ORIGIN}/tracer/`,
        name: 'Tracer',
        description:
          'Tracer is currently in private beta. It is an on-device time tracker for iPhone with no account or cloud service.',
        operatingSystem: 'iOS 18 or later',
        applicationCategory: 'UtilitiesApplication',
        publisher: { '@id': `${SITE_ORIGIN}/#organization` },
      },
    ],
  };
}

function jsonLdScripts(html, relativePath) {
  const scripts = Array.from(
    html.matchAll(/<script\b[^>]*\btype="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi),
    (match) => match[1],
  );
  const parsed = [];

  scripts.forEach((content, index) => {
    try {
      parsed.push(JSON.parse(content));
    } catch (error) {
      fail(`${relativePath} JSON-LD script ${index + 1} is not parseable: ${error.message}`);
    }
  });

  return parsed;
}

function validateLocalReferences(graph, relativePath) {
  if (!Array.isArray(graph?.['@graph'])) {
    fail(`${relativePath} JSON-LD is missing an @graph array.`);
    return;
  }

  const ids = new Set(graph['@graph'].map((node) => node?.['@id']).filter(Boolean));
  const referenceProperties = ['publisher', 'logo', 'isPartOf', 'mainEntity'];

  for (const node of graph['@graph']) {
    for (const property of referenceProperties) {
      const reference = node?.[property];

      if (reference && typeof reference === 'object' && '@id' in reference && !ids.has(reference['@id'])) {
        fail(`${relativePath} JSON-LD ${property} reference does not resolve within the graph.`);
      }
    }
  }
}

function findProhibitedKeys(value, location = '$') {
  if (Array.isArray(value)) {
    return value.flatMap((item, index) => findProhibitedKeys(item, `${location}[${index}]`));
  }

  if (!value || typeof value !== 'object') {
    return [];
  }

  const found = [];

  for (const [key, child] of Object.entries(value)) {
    if (PROHIBITED_APPLICATION_KEYS.has(key)) {
      found.push(`${location}.${key}`);
    }

    found.push(...findProhibitedKeys(child, `${location}.${key}`));
  }

  return found;
}

function validateStructuredData(route, html) {
  const scripts = jsonLdScripts(html, route.output);

  if (!route.structuredData) {
    if (scripts.length > 0) {
      fail(`${route.output} should not emit page-specific JSON-LD.`);
    }
    return;
  }

  if (scripts.length !== 1) {
    fail(`${route.output} must emit exactly one JSON-LD script.`);
    return;
  }

  const graph = scripts[0];
  const expected =
    route.structuredData === 'homepage' ? expectedHomepageGraph() : expectedTracerGraph(route);
  assertDeepEqual(graph, expected, `${route.output} JSON-LD`);
  validateLocalReferences(graph, route.output);

  if (route.structuredData === 'tracer') {
    for (const propertyPath of findProhibitedKeys(graph)) {
      fail(`${route.output} JSON-LD contains prohibited prelaunch property ${propertyPath}.`);
    }
  }
}

function validateInternalLinks(route, html) {
  for (const tag of tagsNamed(html, 'a')) {
    const href = parseAttributes(tag).get('href');

    if (!href || href.startsWith('#')) {
      continue;
    }

    let url;

    try {
      url = new URL(href, `${SITE_ORIGIN}${route.path}`);
    } catch {
      fail(`${route.output} contains an invalid anchor URL: ${href}.`);
      continue;
    }

    if (!['http:', 'https:'].includes(url.protocol) || url.origin !== SITE_ORIGIN) {
      continue;
    }

    const canonicalPath = CANONICAL_PATHS.get(normalizePath(url.pathname));

    if (canonicalPath && url.pathname !== canonicalPath) {
      fail(
        `${route.output} links to ${href}; use canonical path ${canonicalPath} while preserving any query or hash.`,
      );
    }
  }
}

function decodeAstroSerializedValue(value) {
  if (Array.isArray(value)) {
    if (value[0] === 0) {
      return decodeAstroSerializedValue(value[1]);
    }

    if (value[0] === 1 && Array.isArray(value[1])) {
      return value[1].map((item) => decodeAstroSerializedValue(item));
    }

    return value.map((item) => decodeAstroSerializedValue(item));
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, child]) => [key, decodeAstroSerializedValue(child)]),
    );
  }

  return value;
}

function validateActiveTracerNavigation(route, html) {
  if (!route.path.startsWith('/tracer/')) {
    return;
  }

  const navigationIsland = tagsNamed(html, 'astro-island')
    .map((tag) => parseAttributes(tag))
    .find((attributes) => attributes.get('component-url')?.includes('/SiteNavigation.'));

  if (!navigationIsland) {
    fail(`${route.output} is missing the SiteNavigation island.`);
    return;
  }

  try {
    const serializedProps = JSON.parse(navigationIsland.get('props') ?? '{}');
    const props = decodeAstroSerializedValue(serializedProps);
    const navigationItems = props.sections?.flatMap((section) => section.items ?? []) ?? [];
    const exactActiveMatchExists = hasExactActiveNavigationItem(
      props.activeHref,
      props.sections ?? [],
    );
    const activeItems = navigationItems.filter(
      (item) =>
        getNavigationAriaCurrent(
          props.activeHref,
          item.href,
          exactActiveMatchExists,
        ) === 'page',
    );

    if (activeItems.length !== 1 || activeItems[0].href !== '/tracer/') {
      fail(`${route.output} does not hydrate only /tracer/ with aria-current="page".`);
    }
  } catch (error) {
    fail(`${route.output} has unreadable SiteNavigation props: ${error.message}`);
  }
}

function validatePage(route, html) {
  const canonical = `${SITE_ORIGIN}${route.path}`;
  const sitemapLink = linkHref(html, 'sitemap');
  const requiredMetaTags = [
    ['name', 'description'],
    ['name', 'robots'],
    ['property', 'og:title'],
    ['property', 'og:description'],
    ['property', 'og:type'],
    ['property', 'og:url'],
    ['property', 'og:site_name'],
    ['property', 'og:locale'],
    ['property', 'og:image'],
    ['property', 'og:image:alt'],
    ['property', 'og:image:width'],
    ['property', 'og:image:height'],
    ['name', 'twitter:card'],
    ['name', 'twitter:title'],
    ['name', 'twitter:description'],
    ['name', 'twitter:image'],
    ['name', 'twitter:image:alt'],
  ];

  for (const [key, value] of requiredMetaTags) {
    const count = metaContents(html, key, value).length;

    if (count !== 1) {
      fail(`${route.output} must emit exactly one ${value} meta tag; found ${count}.`);
    }
  }

  const titleCount = Array.from(html.matchAll(/<title>[\s\S]*?<\/title>/gi)).length;
  const canonicalCount = linksWithRel(html, 'canonical').length;
  const sitemapLinkCount = linksWithRel(html, 'sitemap').length;

  if (titleCount !== 1) {
    fail(`${route.output} must emit exactly one title element; found ${titleCount}.`);
  }

  if (canonicalCount !== 1) {
    fail(`${route.output} must emit exactly one canonical link; found ${canonicalCount}.`);
  }

  if (sitemapLinkCount !== 1) {
    fail(`${route.output} must emit exactly one sitemap link; found ${sitemapLinkCount}.`);
  }

  assertEqual(titleText(html), route.title, `${route.output} title`);
  assertEqual(metaContent(html, 'name', 'description'), route.description, `${route.output} description`);
  assertEqual(metaContent(html, 'property', 'og:title'), route.title, `${route.output} og:title`);
  assertEqual(
    metaContent(html, 'property', 'og:description'),
    route.description,
    `${route.output} og:description`,
  );
  assertEqual(metaContent(html, 'name', 'twitter:title'), route.title, `${route.output} twitter:title`);
  assertEqual(
    metaContent(html, 'name', 'twitter:description'),
    route.description,
    `${route.output} twitter:description`,
  );
  assertEqual(linkHref(html, 'canonical')?.href, canonical, `${route.output} canonical`);
  assertEqual(metaContent(html, 'property', 'og:url'), canonical, `${route.output} og:url`);
  assertEqual(metaContent(html, 'property', 'og:type'), 'website', `${route.output} og:type`);
  assertEqual(
    metaContent(html, 'property', 'og:site_name'),
    'Invisible Sloth',
    `${route.output} og:site_name`,
  );
  assertEqual(metaContent(html, 'property', 'og:locale'), 'en_US', `${route.output} og:locale`);
  assertEqual(metaContent(html, 'property', 'og:image'), SOCIAL_IMAGE_URL, `${route.output} og:image`);
  assertEqual(metaContent(html, 'property', 'og:image:alt'), SOCIAL_IMAGE_ALT, `${route.output} og:image:alt`);
  assertEqual(metaContent(html, 'property', 'og:image:width'), '1200', `${route.output} og:image:width`);
  assertEqual(metaContent(html, 'property', 'og:image:height'), '630', `${route.output} og:image:height`);
  assertEqual(metaContent(html, 'name', 'twitter:card'), 'summary_large_image', `${route.output} twitter:card`);
  assertEqual(metaContent(html, 'name', 'twitter:image'), SOCIAL_IMAGE_URL, `${route.output} twitter:image`);
  assertEqual(metaContent(html, 'name', 'twitter:image:alt'), SOCIAL_IMAGE_ALT, `${route.output} twitter:image:alt`);
  assertEqual(metaContent(html, 'name', 'robots'), DEFAULT_ROBOTS, `${route.output} robots`);
  assertEqual(sitemapLink?.href, '/sitemap-index.xml', `${route.output} sitemap link`);
  assertEqual(sitemapLink?.attributes.get('type'), 'application/xml', `${route.output} sitemap link type`);

  if (metaContent(html, 'name', 'twitter:url') !== undefined) {
    fail(`${route.output} must not emit a twitter:url tag.`);
  }

  validateStructuredData(route, html);
  validateInternalLinks(route, html);
  validateActiveTracerNavigation(route, html);
}

async function readRequired(relativePath) {
  const absolutePath = path.join(ROOT, relativePath);

  if (!existsSync(absolutePath)) {
    fail(`${relativePath} is missing. Run npm run build before npm run check:seo.`);
    return undefined;
  }

  return readFile(absolutePath, 'utf8');
}

async function validateSitemaps() {
  const indexXml = await readRequired('dist/sitemap-index.xml');
  const sitemapXml = await readRequired('dist/sitemap-0.xml');

  if (!indexXml || !sitemapXml) {
    return;
  }

  const indexLocations = Array.from(indexXml.matchAll(/<loc>(.*?)<\/loc>/g), (match) => decodeHtml(match[1]));
  assertDeepEqual(
    indexLocations,
    [`${SITE_ORIGIN}/sitemap-0.xml`],
    'dist/sitemap-index.xml membership',
  );

  const sitemapLocations = Array.from(
    sitemapXml.matchAll(/<loc>(.*?)<\/loc>/g),
    (match) => decodeHtml(match[1]),
  );
  assertDeepEqual(
    [...sitemapLocations].sort(),
    [...EXPECTED_URLS].sort(),
    'dist/sitemap-0.xml membership',
  );

  if (sitemapLocations.includes(`${SITE_ORIGIN}/404/`)) {
    fail('dist/sitemap-0.xml must exclude the 404 route.');
  }
}

async function validateRobotsFile() {
  const sourceRobots = await readRequired('public/robots.txt');
  const builtRobots = await readRequired('dist/robots.txt');

  if (sourceRobots !== undefined) {
    assertEqual(sourceRobots, EXPECTED_ROBOTS_FILE, 'public/robots.txt contents');
  }

  if (builtRobots !== undefined) {
    assertEqual(builtRobots, EXPECTED_ROBOTS_FILE, 'dist/robots.txt contents');
  }
}

async function validateNotFoundPage() {
  const html = await readRequired('dist/404.html');

  if (!html) {
    return;
  }

  assertEqual(metaContent(html, 'name', 'robots'), NOT_FOUND_ROBOTS, 'dist/404.html robots');
  validateInternalLinks({ path: '/404/', output: 'dist/404.html' }, html);
}

const titles = new Set(ROUTES.map((route) => route.title));
const descriptions = new Set(ROUTES.map((route) => route.description));

if (titles.size !== ROUTES.length) {
  fail('The six-route manifest must use unique page titles.');
}

if (descriptions.size !== ROUTES.length) {
  fail('The six-route manifest must use unique page descriptions.');
}

for (const route of ROUTES) {
  const html = await readRequired(route.output);

  if (html) {
    validatePage(route, html);
  }
}

const homepageHtml = existsSync(path.join(ROOT, 'dist/index.html'))
  ? await readFile(path.join(ROOT, 'dist/index.html'), 'utf8')
  : '';

if (homepageHtml.includes('data-nosnippet')) {
  fail('dist/index.html must keep all Invisible Sloth projects snippet-eligible.');
}

await validateSitemaps();
await validateRobotsFile();
await validateNotFoundPage();

if (failures.length > 0) {
  console.error('SEO check failed:');

  for (const message of failures) {
    console.error(`- ${message}`);
  }

  process.exitCode = 1;
} else {
  console.log('SEO check passed.');
}
