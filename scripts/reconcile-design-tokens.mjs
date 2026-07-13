import { createHash } from 'node:crypto';
import { basename, resolve } from 'node:path';
import { readFileSync, writeFileSync } from 'node:fs';

const projectRoot = resolve(import.meta.dirname, '..');
const colorsPath = resolve(projectRoot, 'src/styles/tokens/colors.css');
const semanticPath = resolve(projectRoot, 'src/styles/tokens/semantic.css');
const manifestPath = resolve(
  projectRoot,
  'src/styles/tokens/figma-reconciliation.json',
);

const requiredCollections = [
  'colors',
  'spacing',
  'theme',
  'typescale',
  'typeface',
  'responsive',
  'size',
];
const colorFamilies = ['green', 'gray', 'blue', 'red'];
let tokens;
let publicRegistration;
let pairedSemanticNames;
let existingStateNames;
let existingUnderlineNames;

export function extractPublicContract(semanticSource) {
  const themeBlocks = [...semanticSource.matchAll(/^@theme\s*\{/gm)];
  if (themeBlocks.length !== 1) {
    throw new Error(
      `Expected one public @theme registration block, found ${themeBlocks.length}.`,
    );
  }

  const registration = semanticSource.slice(themeBlocks[0].index);
  const declarations = new Map();
  for (const [, name, value] of registration.matchAll(
    /^\s*(--[\w-]+):\s*([^;]+);/gm,
  )) {
    if (declarations.has(name)) {
      throw new Error(`Duplicate public token registration: ${name}`);
    }
    declarations.set(name, value.trim());
  }

  function mappedNames(prefix) {
    const names = [];
    for (const [name, value] of declarations) {
      if (!name.startsWith(`--color-${prefix}`)) continue;
      const suffix = name.slice(`--color-${prefix}`.length);
      const expected = `var(--theme-active-${prefix}${suffix})`;
      if (value !== expected) {
        throw new Error(
          `Public token ${name} must map to ${expected}; received ${value}.`,
        );
      }
      names.push(suffix);
    }
    if (names.length === 0) {
      throw new Error(`No public ${prefix} tokens are registered.`);
    }
    return names;
  }

  const pairedNames = [];
  for (const [name, value] of declarations) {
    const match = /^--color-([\w-]+)-srgb$/.exec(name);
    if (!match) continue;
    const semanticName = match[1];
    const expected = `var(--theme-active-${semanticName}-srgb)`;
    if (value !== expected) {
      throw new Error(
        `Public token ${name} must map to ${expected}; received ${value}.`,
      );
    }

    for (const suffix of ['p3', '']) {
      const companionName = `--color-${semanticName}${suffix ? `-${suffix}` : ''}`;
      const companionValue = `var(--theme-active-${semanticName}${suffix ? `-${suffix}` : ''})`;
      if (declarations.get(companionName) !== companionValue) {
        throw new Error(
          `Public P3 token family ${semanticName} is missing ${companionName}.`,
        );
      }
    }
    pairedNames.push(semanticName);
  }
  if (pairedNames.length === 0) {
    throw new Error('No public sRGB/P3 semantic token families are registered.');
  }

  const schemeNames = [];
  for (const [name, value] of declarations) {
    const match = /^--color-([\w-]+)$/.exec(name);
    if (!match) continue;
    const semanticName = match[1];
    if (
      semanticName.endsWith('-srgb') ||
      semanticName.endsWith('-p3') ||
      semanticName.startsWith('state-') ||
      semanticName.startsWith('link-underline-')
    ) {
      continue;
    }

    const expected = `var(--theme-active-${semanticName})`;
    if (value === expected) schemeNames.push(semanticName);
  }
  if (schemeNames.length === 0) {
    throw new Error('No public semantic scheme tokens are registered.');
  }

  return {
    publicRegistration: registration,
    pairedNames,
    schemeNames,
    stateNames: mappedNames('state-'),
    underlineNames: mappedNames('link-underline-'),
  };
}

function slug(value) {
  return value.trim().toLowerCase().replaceAll(' ', '-');
}

function cssSemanticName(name) {
  const normalized = slug(name);
  return normalized === 'on-inverse-surface'
    ? 'on-surface-inverse'
    : normalized;
}

function parseP3Hex(value) {
  const match = /^#([\da-f]{2})([\da-f]{2})([\da-f]{2})([\da-f]{2})?$/i.exec(
    value,
  );

  if (!match) {
    throw new Error(`Expected an 8-bit Figma color, received ${value}.`);
  }

  return {
    channels: match.slice(1, 4).map((channel) => Number.parseInt(channel, 16)),
    alpha: match[4] ? Number.parseInt(match[4], 16) : 255,
  };
}

function linearize(channel) {
  return channel <= 0.04045
    ? channel / 12.92
    : ((channel + 0.055) / 1.055) ** 2.4;
}

function encode(channel) {
  return channel <= 0.0031308
    ? 12.92 * channel
    : 1.055 * channel ** (1 / 2.4) - 0.055;
}

function multiply(matrix, vector) {
  return matrix.map((row) =>
    row.reduce((sum, value, index) => sum + value * vector[index], 0),
  );
}

function p3ToSrgb(value) {
  const { channels, alpha } = parseP3Hex(value);
  const linearP3 = channels.map((channel) => linearize(channel / 255));
  const xyz = multiply(
    [
      [0.4865709486482162, 0.26566769316909306, 0.1982172852343625],
      [0.2289745640697488, 0.6917385218365064, 0.079286914093745],
      [0, 0.04511338185890264, 1.043944368900976],
    ],
    linearP3,
  );
  const linearSrgb = multiply(
    [
      [3.2409699419045226, -1.537383177570094, -0.4986107602930034],
      [-0.9692436362808796, 1.8759675015077202, 0.04155505740717559],
      [0.05563007969699366, -0.20397695888897652, 1.0569715142428786],
    ],
    xyz,
  );
  const srgb = linearSrgb.map((channel) =>
    Math.round(Math.min(1, Math.max(0, encode(channel))) * 255),
  );

  return { channels: srgb, alpha };
}

function formatHex(channels) {
  return `#${channels
    .map((channel) => channel.toString(16).padStart(2, '0'))
    .join('')}`;
}

function formatAlpha(alpha) {
  return Number((alpha / 255).toFixed(2)).toString();
}

function formatSrgb(value) {
  const { channels, alpha } = p3ToSrgb(value);
  if (alpha === 255) return formatHex(channels);
  return `rgba(${channels.join(', ')}, ${formatAlpha(alpha)})`;
}

function formatP3(value) {
  const { channels, alpha } = parseP3Hex(value);
  const p3 = channels
    .map((channel) => Number((channel / 255).toFixed(4)).toString())
    .join(' ');
  return alpha === 255
    ? `color(display-p3 ${p3})`
    : `color(display-p3 ${p3} / ${formatAlpha(alpha)})`;
}

function resolveAlias(value, mode) {
  let match = /^\{colors\.([^.]+)\.([^}]+)\}$/.exec(value);
  if (match) return `var(--color-${slug(match[1])}-${slug(match[2])})`;

  if (value === '{theme.white}') return 'var(--color-white)';
  if (value === '{theme.black}') return 'var(--color-black)';

  match = /^\{theme\.scheme\.[^.]+\.(.+)\}$/.exec(value);
  if (match) return `var(--theme-${mode}-${cssSemanticName(match[1])})`;

  throw new Error(`Unsupported Figma alias: ${value}`);
}

function assertRecord(value, path) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`Expected ${path} to be an object.`);
  }
  return value;
}

function validateColorToken(token, path, mode) {
  assertRecord(token, path);
  if (token.type !== 'color') {
    throw new Error(`Expected ${path} to be a color token.`);
  }
  if (typeof token.value !== 'string') {
    throw new Error(`Expected ${path}.value to be a string.`);
  }

  if (token.value.startsWith('{')) {
    if (!mode) throw new Error(`Primitive color ${path} cannot be an alias.`);
    resolveAlias(token.value, mode);
    return;
  }
  parseP3Hex(token.value);
}

function validateAliasTarget(
  value,
  mode,
  exportedTokens,
  schemeNames,
  path,
) {
  let match = /^\{colors\.([^.]+)\.([^}]+)\}$/.exec(value);
  if (match) {
    const family = slug(match[1]);
    const level = match[2];
    if (
      !colorFamilies.includes(family) ||
      !Object.hasOwn(exportedTokens.colors[family], level)
    ) {
      throw new Error(
        `${path} references a primitive outside the generated scope: ${value}`,
      );
    }
    return;
  }

  if (value === '{theme.white}' || value === '{theme.black}') return;

  match = /^\{theme\.scheme\.[^.]+\.(.+)\}$/.exec(value);
  if (match) {
    const targetName = cssSemanticName(match[1]);
    if (!schemeNames.has(targetName)) {
      throw new Error(
        `${path} references a missing ${mode} semantic token: ${value}`,
      );
    }
    return;
  }

  throw new Error(`Unsupported Figma alias: ${value}`);
}

export function validateExport(exportedTokens, contract) {
  assertRecord(exportedTokens, 'Figma export');
  for (const collection of requiredCollections) {
    assertRecord(exportedTokens[collection], `collection ${collection}`);
  }

  for (const family of colorFamilies) {
    const familyTokens = assertRecord(
      exportedTokens.colors[family],
      `colors.${family}`,
    );
    if (Object.keys(familyTokens).length === 0) {
      throw new Error(`Color family colors.${family} is empty.`);
    }
    for (const [name, token] of Object.entries(familyTokens)) {
      validateColorToken(token, `colors.${family}.${name}`);
    }
  }

  for (const mode of ['light', 'dark']) {
    const theme = assertRecord(exportedTokens.theme[mode], `theme.${mode}`);
    const scheme = assertRecord(theme.scheme, `theme.${mode}.scheme`);
    const seenSchemeTokens = new Map();
    const aliasTokens = [];

    for (const [groupName, group] of Object.entries(scheme)) {
      assertRecord(group, `theme.${mode}.scheme.${groupName}`);
      for (const [figmaName, token] of Object.entries(group)) {
        const name = cssSemanticName(figmaName);
        const tokenPath = `theme.${mode}.scheme.${groupName}.${figmaName}`;
        validateColorToken(
          token,
          tokenPath,
          mode,
        );
        if (token.value.startsWith('{')) {
          aliasTokens.push({ path: tokenPath, value: token.value });
        }
        const previousValue = seenSchemeTokens.get(name);
        if (previousValue !== undefined && previousValue !== token.value) {
          throw new Error(
            `Conflicting exported values normalize to theme.${mode}.${name}.`,
          );
        }
        seenSchemeTokens.set(name, token.value);
      }
    }
    if (seenSchemeTokens.size === 0) {
      throw new Error(`Theme scheme theme.${mode}.scheme is empty.`);
    }
    for (const name of contract.schemeNames) {
      if (!seenSchemeTokens.has(name)) {
        throw new Error(`Missing exported semantic token: ${mode}/${name}`);
      }
    }
    for (const alias of aliasTokens) {
      validateAliasTarget(
        alias.value,
        mode,
        exportedTokens,
        seenSchemeTokens,
        alias.path,
      );
    }

    const stateLayers = assertRecord(
      theme['state layers'],
      `theme.${mode}.state layers`,
    );
    for (const [groupName, group] of Object.entries(stateLayers)) {
      assertRecord(group, `theme.${mode}.state layers.${groupName}`);
      for (const [opacity, token] of Object.entries(group)) {
        validateColorToken(
          token,
          `theme.${mode}.state layers.${groupName}.${opacity}`,
        );
      }
    }

    const underlines = assertRecord(
      theme['link underlines'],
      `theme.${mode}.link underlines`,
    );
    for (const [name, token] of Object.entries(underlines)) {
      validateColorToken(
        token,
        `theme.${mode}.link underlines.${name}`,
      );
    }

    for (const name of contract.stateNames) {
      if (!findExportedState(exportedTokens, mode, name)) {
        throw new Error(`Missing exported state layer: ${mode}/${name}`);
      }
    }
    for (const name of contract.underlineNames) {
      if (!findExportedUnderline(exportedTokens, mode, name)) {
        throw new Error(`Missing exported link underline: ${mode}/${name}`);
      }
    }
  }
}

function generateColors() {
  const baseLines = [];
  const p3Lines = [];

  for (const family of colorFamilies) {
    baseLines.push(
      `  /* ${family.toUpperCase()} FAMILY */`,
      '',
    );

    for (const [level, token] of Object.entries(tokens.colors[family])) {
      const name = `--color-${family}-${level}`;
      baseLines.push(`  ${name}: ${formatSrgb(token.value)};`);
      p3Lines.push(`    ${name}: ${formatP3(token.value)};`);
    }

    baseLines.push('');
    p3Lines.push('');
  }

  return `/* ==========================================
   COLOR PRIMITIVES
   Figma values are authored in Display P3. The @theme values are
   color-managed sRGB fallbacks; capable browsers receive P3 overrides.
   ========================================== */

@theme {
${baseLines.join('\n')}  /* BASE COLORS */

  --color-white: #ffffff;
  --color-black: #000000;
}

@supports (color: color(display-p3 1 1 1)) {
  :root {
${p3Lines.join('\n')}  }
}
`;
}

function collectSchemeTokens(mode) {
  const result = [];
  const seen = new Set();

  for (const [group, groupTokens] of Object.entries(tokens.theme[mode].scheme)) {
    const entries = [];

    for (const [figmaName, token] of Object.entries(groupTokens)) {
      const name = cssSemanticName(figmaName);
      if (seen.has(name)) continue;
      seen.add(name);
      entries.push({ name, token });
    }

    if (entries.length > 0) result.push({ group, entries });
  }

  return result;
}

function findExportedState(exportedTokens, mode, cssName) {
  const opacity = /-(\d+)$/.exec(cssName)?.[1];
  const groupName = cssName.replace(/-\d+$/, '');
  const group = Object.entries(exportedTokens.theme[mode]['state layers']).find(
    ([name]) => slug(name) === groupName,
  );
  return group?.[1]?.[`opacity-${opacity}`];
}

function findExportedUnderline(exportedTokens, mode, cssName) {
  return Object.entries(exportedTokens.theme[mode]['link underlines']).find(
    ([name]) => slug(name) === cssName,
  )?.[1];
}

function generateSemanticValues() {
  const root = [];
  const p3 = [];
  let schemeCount = 0;
  let stateCount = 0;
  let underlineCount = 0;

  for (const mode of ['light', 'dark']) {
    root.push(`  /* CANONICAL ${mode.toUpperCase()} SEMANTIC VALUES */`);

    for (const { group, entries } of collectSchemeTokens(mode)) {
      root.push(`  /* ${group.toUpperCase()} */`);

      for (const { name, token } of entries) {
        const baseName = `--theme-${mode}-${name}`;
        const isAlias =
          typeof token.value === 'string' && token.value.startsWith('{');
        const paired = pairedSemanticNames.has(name);
        schemeCount += 1;

        if (paired) {
          const srgb = isAlias
            ? resolveAlias(token.value, mode)
            : formatSrgb(token.value);
          root.push(
            `  ${baseName}-srgb: ${srgb};`,
            `  ${baseName}-p3: var(${baseName}-srgb);`,
            `  ${baseName}: var(${baseName}-p3, var(${baseName}-srgb));`,
          );
          if (!isAlias) {
            p3.push(`    ${baseName}-p3: ${formatP3(token.value)};`);
          }
          continue;
        }

        root.push(
          `  ${baseName}: ${
            isAlias ? resolveAlias(token.value, mode) : formatSrgb(token.value)
          };`,
        );
        if (!isAlias) p3.push(`    ${baseName}: ${formatP3(token.value)};`);
      }

      root.push('');
    }

    root.push('  /* STATE LAYERS USED BY CODE */');
    for (const name of existingStateNames) {
      const token = findExportedState(tokens, mode, name);
      const cssName = `--theme-${mode}-state-${name}`;
      root.push(`  ${cssName}: ${formatSrgb(token.value)};`);
      p3.push(`    ${cssName}: ${formatP3(token.value)};`);
      stateCount += 1;
    }
    root.push('');

    root.push('  /* LINK UNDERLINES USED BY CODE */');
    for (const name of existingUnderlineNames) {
      const token = findExportedUnderline(tokens, mode, name);
      const cssName = `--theme-${mode}-link-underline-${name}`;
      root.push(`  ${cssName}: ${formatSrgb(token.value)};`);
      p3.push(`    ${cssName}: ${formatP3(token.value)};`);
      underlineCount += 1;
    }
    root.push('');
    p3.push('');
  }

  const content = `/* ==========================================
   SEMANTIC COLOR TOKENS & STATE LAYERS
   Canonical semantic color values plus public Tailwind token registration.
   Theme routing lives in ../theme.css.

   Figma values are authored in Display P3. Canonical declarations provide
   color-managed sRGB fallbacks with P3 overrides for capable browsers.
   ========================================== */

:root {
${root.join('\n')}}

@supports (color: color(display-p3 1 1 1)) {
  :root {
${p3.join('\n')}  }
}

${publicRegistration}`;

  return { content, schemeCount, stateCount, underlineCount };
}

function main() {
  const args = process.argv.slice(2);
  const checkOnly = args.includes('--check');
  const exportArg = args.find((arg) => arg !== '--check');

  if (!exportArg) {
    throw new Error(
      'Usage: node scripts/reconcile-design-tokens.mjs <figma-export.json> [--check]',
    );
  }

  const exportPath = resolve(projectRoot, exportArg);
  const exportSource = readFileSync(exportPath, 'utf8');
  tokens = JSON.parse(exportSource);
  const currentSemantic = readFileSync(semanticPath, 'utf8');

  const contract = extractPublicContract(currentSemantic);
  publicRegistration = contract.publicRegistration;
  pairedSemanticNames = new Set(contract.pairedNames);
  existingStateNames = contract.stateNames;
  existingUnderlineNames = contract.underlineNames;
  validateExport(tokens, contract);

  const colorsContent = generateColors();
  const semantic = generateSemanticValues();
  const exportSha256 = createHash('sha256').update(exportSource).digest('hex');

  const manifest = {
    sourceExport: basename(exportPath),
    sourceSha256: exportSha256,
    figmaFileKey: 'fPZa0wKLb2IqzuvCsq55Ej',
    documentColorProfile: 'DISPLAY_P3',
    reconciledOn: new Date().toISOString().slice(0, 10),
    scope: {
      primitiveColors: colorFamilies.reduce(
        (count, family) => count + Object.keys(tokens.colors[family]).length,
        2,
      ),
      semanticSchemeTokens: semantic.schemeCount,
      semanticStateLayersUsedByCode: semantic.stateCount,
      linkUnderlinesUsedByCode: semantic.underlineCount,
    },
  };

  if (checkOnly) {
    const failures = [];
    if (readFileSync(colorsPath, 'utf8') !== colorsContent) {
      failures.push('src/styles/tokens/colors.css');
    }
    if (readFileSync(semanticPath, 'utf8') !== semantic.content) {
      failures.push('src/styles/tokens/semantic.css');
    }

    const currentManifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
    for (const key of [
      'sourceExport',
      'sourceSha256',
      'figmaFileKey',
      'documentColorProfile',
    ]) {
      if (currentManifest[key] !== manifest[key]) {
        failures.push(`src/styles/tokens/figma-reconciliation.json:${key}`);
      }
    }
    if (
      JSON.stringify(currentManifest.scope) !== JSON.stringify(manifest.scope)
    ) {
      failures.push('src/styles/tokens/figma-reconciliation.json:scope');
    }

    if (failures.length > 0) {
      console.error(`Design token drift detected:\n- ${failures.join('\n- ')}`);
      process.exitCode = 1;
      return;
    }

    console.log(
      `Design tokens match ${basename(exportPath)} (${exportSha256}).`,
    );
    return;
  }

  writeFileSync(colorsPath, colorsContent);
  writeFileSync(semanticPath, semantic.content);
  writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

  console.log(
    `Reconciled ${manifest.scope.primitiveColors} primitive and ${manifest.scope.semanticSchemeTokens} semantic scheme colors from ${basename(exportPath)}.`,
  );
}

if (process.argv[1] && resolve(process.argv[1]) === import.meta.filename) {
  try {
    main();
  } catch (error) {
    console.error(`Design token reconciliation failed: ${error.message}`);
    process.exitCode = 1;
  }
}
