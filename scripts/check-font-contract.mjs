import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, extname, join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const fontRoot = join(repoRoot, "public/fonts");
const failures = [];
const checkGeneratedOutput = process.argv.includes("--generated");

const unicodeRanges = {
  vietnamese:
    "U+0102-0103, U+0110-0111, U+0128-0129, U+0168-0169, U+01A0-01A1, U+01AF-01B0, U+0300-0301, U+0303-0304, U+0308-0309, U+0323, U+0329, U+1EA0-1EF9, U+20AB",
  "latin-ext":
    "U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF",
  latin:
    "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD",
};

const fontFiles = [
  {
    path: "public/fonts/sigmar/v9/sigmar-v9-vietnamese.woff2",
    subset: "vietnamese",
    bytes: 7960,
    sha256: "e382a3f5b0c7c4e49d04e6cd4d5f0a6bcde924197006f4815c3fe5600d23c9d5",
    upstream: "https://fonts.gstatic.com/s/sigmar/v9/hv-XlzJgIE8a85pkZWw2EzJwV9J-.woff2",
  },
  {
    path: "public/fonts/sigmar/v9/sigmar-v9-latin-ext.woff2",
    subset: "latin-ext",
    bytes: 23380,
    sha256: "5012018d5173bf7cbcfd1b30d1c6583be2990f840c6ad8950d8ca822a9603cdb",
    upstream: "https://fonts.gstatic.com/s/sigmar/v9/hv-XlzJgIE8a85pkZGw2EzJwV9J-.woff2",
  },
  {
    path: "public/fonts/sigmar/v9/sigmar-v9-latin.woff2",
    subset: "latin",
    bytes: 32912,
    sha256: "7b3148834e8f8058b9d8eca886afea512a24cd6f59f765adac71490d39905490",
    upstream: "https://fonts.gstatic.com/s/sigmar/v9/hv-XlzJgIE8a85pkamw2EzJwVw.woff2",
  },
  {
    path: "public/fonts/work-sans/v24/work-sans-v24-italic-vietnamese.woff2",
    subset: "vietnamese",
    bytes: 11760,
    sha256: "73e14126fe55cec274787f0432946321b64071a94b51d38e5864908e22e0b8ca",
    upstream: "https://fonts.gstatic.com/s/worksans/v24/QGYqz_wNahGAdqQ43Rh_eZDkv_1i4_D2E4A.woff2",
  },
  {
    path: "public/fonts/work-sans/v24/work-sans-v24-italic-latin-ext.woff2",
    subset: "latin-ext",
    bytes: 32284,
    sha256: "e5431364e5d49261787f4cdd0c8231b8fceb8e647d5940e788a8c382a32f88d4",
    upstream: "https://fonts.gstatic.com/s/worksans/v24/QGYqz_wNahGAdqQ43Rh_eZDlv_1i4_D2E4A.woff2",
  },
  {
    path: "public/fonts/work-sans/v24/work-sans-v24-italic-latin.woff2",
    subset: "latin",
    bytes: 48264,
    sha256: "b87f48add7ec30528eec5bb08a62bedff58ec6093097d817d3def0c54691ad45",
    upstream: "https://fonts.gstatic.com/s/worksans/v24/QGYqz_wNahGAdqQ43Rh_eZDrv_1i4_D2.woff2",
  },
  {
    path: "public/fonts/work-sans/v24/work-sans-v24-normal-vietnamese.woff2",
    subset: "vietnamese",
    bytes: 11776,
    sha256: "a7685ec477b23edc368efaa59d8f717a1e01208b68f52982673552a04f9398d3",
    upstream: "https://fonts.gstatic.com/s/worksans/v24/QGYsz_wNahGAdqQ43Rh_c6DptfpA4cD3.woff2",
  },
  {
    path: "public/fonts/work-sans/v24/work-sans-v24-normal-latin-ext.woff2",
    subset: "latin-ext",
    bytes: 35776,
    sha256: "fe0af300ce56932381af82ed960d8582dc8308ac2b7b48dd505dd49573a83ada",
    upstream: "https://fonts.gstatic.com/s/worksans/v24/QGYsz_wNahGAdqQ43Rh_cqDptfpA4cD3.woff2",
  },
  {
    path: "public/fonts/work-sans/v24/work-sans-v24-normal-latin.woff2",
    subset: "latin",
    bytes: 50524,
    sha256: "72cd8f67849cc714f3364eeeb378df9a49f4aff00e6a3640fad36c9c93a9b197",
    upstream: "https://fonts.gstatic.com/s/worksans/v24/QGYsz_wNahGAdqQ43Rh_fKDptfpA4Q.woff2",
  },
];

function toPosix(path) {
  return path.split(sep).join("/");
}

function listFiles(directory) {
  if (!existsSync(directory)) return [];

  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? listFiles(path) : [path];
  });
}

function normalize(value) {
  return value.replace(/\s+/g, " ").trim();
}

function unquote(value) {
  return value.replace(/^(?:"([\s\S]*)"|'([\s\S]*)')$/, "$1$2");
}

function arraysMatch(actual, expected) {
  return (
    actual.length === expected.length &&
    actual.every((value, index) => value === expected[index])
  );
}

function faceKey({ family, style, weight, url, unicodeRange }) {
  return [family, style, String(weight), url, normalize(unicodeRange)].join("|");
}

function fontUrl(file) {
  return `/${file.path.slice("public/".length)}`;
}

function fontFileFor(fragment, subset) {
  const file = fontFiles.find(
    (candidate) => candidate.path.includes(fragment) && candidate.subset === subset,
  );

  if (!file) throw new Error(`Missing contract entry for ${fragment} ${subset}`);
  return file;
}

// Protect the pinned files, including against silent upstream replacement.
const expectedWoff2Paths = fontFiles.map(({ path }) => path).sort();
const actualWoff2Paths = listFiles(fontRoot)
  .filter((path) => extname(path).toLowerCase() === ".woff2")
  .map((path) => toPosix(relative(repoRoot, path)))
  .sort();

if (!arraysMatch(actualWoff2Paths, expectedWoff2Paths)) {
  failures.push(
    `Expected exactly these WOFF2 files:\n${expectedWoff2Paths.join("\n")}\nFound:\n${actualWoff2Paths.join("\n")}`,
  );
}

for (const file of fontFiles) {
  const absolutePath = join(repoRoot, file.path);
  if (!existsSync(absolutePath)) continue;

  const contents = readFileSync(absolutePath);
  const digest = createHash("sha256").update(contents).digest("hex");

  if (contents.byteLength !== file.bytes) {
    failures.push(`${file.path} has ${contents.byteLength} bytes; expected ${file.bytes}.`);
  }
  if (digest !== file.sha256) {
    failures.push(`${file.path} has SHA-256 ${digest}; expected ${file.sha256}.`);
  }
}

const familyDirectories = ["public/fonts/sigmar/v9", "public/fonts/work-sans/v24"];
const stylesheetRequest =
  "https://fonts.googleapis.com/css2?family=Sigmar&family=Work+Sans:ital,wght@0,400;0,500;0,600;1,400;1,600&display=swap";
const provenanceFields = {
  "public/fonts/sigmar/v9": [
    "- Retrieved: 2026-08-31",
    "- Google Fonts CDN revision: `v9`",
    "- Embedded font version: `Version 1.000; ttfautohint (v1.8.4.7-5d5b);gftools[0.9.24]`",
  ],
  "public/fonts/work-sans/v24": [
    "- Retrieved: 2026-08-31",
    "- Google Fonts CDN revision: `v24`",
    "- Embedded font version: `Version 2.012`",
  ],
};
for (const directory of familyDirectories) {
  for (const filename of ["OFL.txt", "PROVENANCE.md"]) {
    const path = join(repoRoot, directory, filename);
    if (!existsSync(path) || statSync(path).size === 0) {
      failures.push(`${directory}/${filename} is missing or empty.`);
    }
  }

  const provenancePath = join(repoRoot, directory, "PROVENANCE.md");
  if (!existsSync(provenancePath)) continue;

  const provenance = readFileSync(provenancePath, "utf8");
  for (const field of [
    ...provenanceFields[directory],
    `- Stylesheet request: <${stylesheetRequest}>`,
    "- Retrieval user agent:",
  ]) {
    if (!provenance.includes(field)) {
      failures.push(`${directory}/PROVENANCE.md is missing: ${field}`);
    }
  }
  for (const file of fontFiles.filter(({ path }) => path.startsWith(`${directory}/`))) {
    const filename = file.path.split("/").at(-1);
    const formattedBytes = file.bytes.toLocaleString("en-US");
    const expectedRow =
      `| \`${filename}\` | <${file.upstream}> | ${formattedBytes} | ` +
      `\`${file.sha256}\` |`;

    if (!provenance.includes(expectedRow)) {
      failures.push(`${directory}/PROVENANCE.md does not match ${filename}.`);
    }
  }
}

// Protect the deliberately discrete face matrix and subset mapping.
const expectedFaces = [];
for (const subset of Object.keys(unicodeRanges)) {
  expectedFaces.push({
    family: "Sigmar",
    style: "normal",
    weight: 400,
    url: fontUrl(fontFileFor("sigmar-v9-", subset)),
    unicodeRange: unicodeRanges[subset],
  });

  for (const weight of [400, 600]) {
    expectedFaces.push({
      family: "Work Sans",
      style: "italic",
      weight,
      url: fontUrl(fontFileFor("work-sans-v24-italic-", subset)),
      unicodeRange: unicodeRanges[subset],
    });
  }

  for (const weight of [400, 500, 600]) {
    expectedFaces.push({
      family: "Work Sans",
      style: "normal",
      weight,
      url: fontUrl(fontFileFor("work-sans-v24-normal-", subset)),
      unicodeRange: unicodeRanges[subset],
    });
  }
}

const fontsCssPath = join(repoRoot, "src/styles/fonts.css");
if (!existsSync(fontsCssPath)) {
  failures.push("src/styles/fonts.css is missing.");
} else {
  const fontsCss = readFileSync(fontsCssPath, "utf8");
  const blocks = [...fontsCss.matchAll(/@font-face\s*\{([^}]*)\}/g)].map(
    (match) => match[1],
  );
  const actualFaces = [];
  const allowedProperties = [
    "font-display",
    "font-family",
    "font-style",
    "font-weight",
    "src",
    "unicode-range",
  ].sort();

  if (blocks.length !== 18) {
    failures.push(`src/styles/fonts.css has ${blocks.length} @font-face rules; expected 18.`);
  }

  blocks.forEach((block, index) => {
    const declarationEntries = [
      ...block.matchAll(/([a-z-]+)\s*:\s*([^;]+);/gi),
    ].map((match) => [
      match[1].toLowerCase(),
      normalize(match[2]),
    ]);
    const declarations = Object.fromEntries(declarationEntries);
    const properties = Object.keys(declarations).sort();
    const sourceMatch = declarations.src?.match(
      /^url\(["']([^"']+)["']\)\s+format\(["']woff2["']\)$/,
    );

    if (
      declarationEntries.length !== allowedProperties.length ||
      !arraysMatch(properties, allowedProperties)
    ) {
      failures.push(
        `@font-face rule ${index + 1} has descriptors ${properties.join(", ")}; expected ${allowedProperties.join(", ")}.`,
      );
    }
    if (declarations["font-display"] !== "swap") {
      failures.push(`@font-face rule ${index + 1} must use font-display: swap.`);
    }
    if (!sourceMatch || /local\s*\(/i.test(declarations.src ?? "")) {
      failures.push(`@font-face rule ${index + 1} must use one quoted local WOFF2 URL.`);
    }

    actualFaces.push({
      family: unquote(declarations["font-family"] ?? ""),
      style: declarations["font-style"] ?? "",
      weight: declarations["font-weight"] ?? "",
      url: sourceMatch?.[1] ?? "",
      unicodeRange: declarations["unicode-range"] ?? "",
    });
  });

  const actualFaceKeys = actualFaces.map(faceKey).sort();
  const expectedFaceKeys = expectedFaces.map(faceKey).sort();
  if (!arraysMatch(actualFaceKeys, expectedFaceKeys)) {
    const missing = expectedFaceKeys.filter((key) => !actualFaceKeys.includes(key));
    const unexpected = actualFaceKeys.filter((key) => !expectedFaceKeys.includes(key));
    failures.push(
      `The @font-face matrix changed.${missing.length ? `\nMissing:\n${missing.join("\n")}` : ""}${unexpected.length ? `\nUnexpected:\n${unexpected.join("\n")}` : ""}`,
    );
  }

  const actualUrls = [...new Set(actualFaces.map(({ url }) => url))].sort();
  const expectedUrls = fontFiles.map(fontUrl).sort();
  if (!arraysMatch(actualUrls, expectedUrls)) {
    failures.push(
      `Expected exactly nine local font URLs:\n${expectedUrls.join("\n")}\nFound:\n${actualUrls.join("\n")}`,
    );
  }
}

// Keep the font faces after reset and before tokens so imports stay valid and intentional.
const globalCssPath = join(repoRoot, "src/styles/global.css");
if (!existsSync(globalCssPath)) {
  failures.push("src/styles/global.css is missing.");
} else {
  const globalCss = readFileSync(globalCssPath, "utf8");
  const resetImport = '@import "./reset.css";';
  const fontsImport = '@import "./fonts.css";';
  const tokensImport = '@import "./tokens.css";';
  const fontImportCount = globalCss.split(fontsImport).length - 1;

  if (
    fontImportCount !== 1 ||
    globalCss.indexOf(resetImport) === -1 ||
    globalCss.indexOf(fontsImport) < globalCss.indexOf(resetImport) ||
    globalCss.indexOf(tokensImport) < globalCss.indexOf(fontsImport)
  ) {
    failures.push(
      "src/styles/global.css must import fonts.css exactly once, after reset.css and before tokens.css.",
    );
  }
}

// Provenance may retain upstream URLs; executable and rendered sources may not.
const runtimeExtensions = new Set([
  ".astro",
  ".css",
  ".html",
  ".js",
  ".jsx",
  ".mjs",
  ".svelte",
  ".svg",
  ".ts",
  ".tsx",
  ".vue",
]);
for (const sourceRoot of ["src", ".storybook", "public"]) {
  for (const path of listFiles(join(repoRoot, sourceRoot))) {
    const relativePath = toPosix(relative(repoRoot, path));
    if (!runtimeExtensions.has(extname(path).toLowerCase())) {
      continue;
    }

    if (/fonts\.(?:googleapis|gstatic)\.com/i.test(readFileSync(path, "utf8"))) {
      failures.push(`${relativePath} contains a Google Fonts runtime URL.`);
    }
  }
}

if (checkGeneratedOutput) {
  const deploymentRoot = join(repoRoot, "dist");
  const generatedRuntimeExtensions = new Set([".css", ".html", ".js", ".mjs"]);

  if (!existsSync(deploymentRoot)) {
    failures.push("dist is missing; build and assemble the deployment before using --generated.");
  } else {
    for (const path of listFiles(deploymentRoot)) {
      if (!generatedRuntimeExtensions.has(extname(path).toLowerCase())) continue;

      if (/fonts\.(?:googleapis|gstatic)\.com/i.test(readFileSync(path, "utf8"))) {
        const relativePath = toPosix(relative(repoRoot, path));
        failures.push(`${relativePath} contains a Google Fonts runtime URL.`);
      }
    }
  }
}

if (failures.length > 0) {
  console.error("Font contract check failed:\n");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exitCode = 1;
} else {
  console.log("Font contract check passed.");
}
