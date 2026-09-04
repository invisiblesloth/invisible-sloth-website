# Storybook Guidelines Roadmap

Status: planning only. This document records the approved direction for future implementation. Updating these planning documents does not implement or authorize any rollout phase. The contributor standard, exception registry, and new commands described below do not exist yet.

## Problem and intended outcome

Storybook should provide reliable component documentation with low maintenance overhead. Today its intended named viewports are misconfigured, some component descriptions need work, and neither story type-checking coverage nor hand-maintained prop documentation has an enforced verification path. The previous roadmap would have added duplicate catalog bookkeeping and new site deployment blockers.

The rollout is complete when contributors can identify documented component contracts, review relevant responsive and accessible behavior with working tools, and catch meaningful drift without maintaining a second catalog. Completion also requires clean-install verification, resolution or explicit disposition of material manual findings, and independent quality checks that do not become site deployment prerequisites.

## Current repository baseline

- Astro 7 static site, Svelte 5 interactive islands, Tailwind CSS 4, Storybook 10 with `@storybook/svelte-vite` and Svelte CSF 5, Node 22, and npm 10. Version constraints and package-manager declarations live in [package.json](../package.json), resolved dependencies in [package-lock.json](../package-lock.json), and the runtime pin in [.nvmrc](../.nvmrc).
- The September 3, 2026 audit reported 35 Svelte CSF story files, 258 story entries, and 35 Docs entries. These are dated observations, not required totals.
- Preview setup includes global styles, system/light/dark themes, and enhancement scripts. The intended 430/744/1024/1512px viewports use obsolete configuration and must not be treated as working review tools until Phase 0 verifies them.
- The Chromatic addon is installed and registered, but no visual-regression service is configured. No Storybook browser test runner, accessibility CI, or `svelte-check` command is configured. Existing focused Node checker tests are separate from browser testing.
- Deployment builds both the site and Storybook, then copies Storybook into `dist/storybook`.
- [Component policies](../src/components/README.md) govern component boundaries and extension tiers. Their examples are not an exhaustive component-to-tier registry. Ignored local agent guidance is not a tracked Storybook authority.

## Artifact responsibilities

| Artifact | Responsibility | Timing |
|---|---|---|
| This roadmap | Decisions, sequencing, and rollout completion criteria | Planning |
| `docs/storybook-standard.md` | Contributor-facing policy | Phase 0, before the registry |
| `.storybook/inventory.json` | Narrow exceptions, judgment-based import approvals, and protected IDs | Phase 0, after the standard |
| [Inventory guide](./storybook-component-inventory.md) | Registry purpose and maintenance | Planning; refine in Phase 0 |
| [Alignment record](./storybook-alignment-plan.md) | Report dispositions, implementation evidence, and manual findings | Planning and rollout |
| Internal validation scripts | Source/type/config and generated-index checks, with focused checker tests | Phase 1 |

These artifacts must not duplicate one another. Sources and the generated `storybook-static/index.json` supply catalog facts; the generated index is not checked in or edited by hand.

## Authoritative decisions

This is the single decision list for the rollout. The other planning documents explain maintenance or record evidence; they do not introduce another approval checklist.

- Preserve Atomic organization and ordering: `Brand → Foundations → Atoms → Molecules → Organisms → Templates`. Preserve existing titles, story names, effective Svelte CSF export names, and IDs during alignment.
- Defer mandatory story modes until a concrete consumer needs classification. Review scope follows changed behavior rather than assigned modes.
- Keep the registry limited to exceptions and protected IDs, including narrow browser-safe import approvals where judgment is necessary. Do not store counts, complete family lists, duplicated tiers, or derivable asset/import catalogs.
- Start protected IDs empty, as the source audit found no tracked or historical individual Storybook links. Require registered IDs to resolve. Do not add `idMigrations`: a JSON record cannot redirect an old URL.
- Cover eligible public Svelte components by documented identity and examples, not matching story filenames. Use explicit exceptions for multi-component families. Astro components remain under Astro/page validation.
- Keep component tier policy in the component README and actual contracts in components/stories. Do not infer an exhaustive registry from prose examples or assign a synthetic `not-documented` tier.
- Keep supported fallback and malformed-runtime examples visible. Follow component policy against stories that intentionally throw. Preserve deterministic fixtures and browser-safe helpers; exclude pages, layouts, content collections, server/content adapters such as `src/lib/projectContent.ts`, and live network data. Inert external link destinations are allowed.
- Allow `svelte-check` as a narrow dependency exception and remove the unused Chromatic addon. Continue deferring browser suites, visual-regression services, hidden machine-only fixtures, and PR workflows.
- Keep new quality checks outside the site deployment dependency chain. Retain the existing combined build/publication path; Storybook build failures can still block the site. Separating publication is outside this rollout.
- Keep one report-disposition section and findings-only rollout evidence in the alignment record. Later maintenance evidence belongs in the implementation task or landing handoff.

## Phase roadmap

### Phase 0 — Policy and working review configuration

Repair the viewport configuration first: replace `parameters.viewport.viewports` with `parameters.viewport.options` and use `initialGlobals.viewport = { value: 'large', isRotated: false }`. Preserve the four named dimensions and verify that the toolbar offers each size, resizes the canvas correctly, and remains selectable from the large default. Follow the [Storybook viewport API](https://storybook.js.org/docs/essentials/viewport).

Write `docs/storybook-standard.md` before encoding its exceptions. Cover eligibility, Atomic organization, Svelte CSF, Autodocs, fixtures, controls, styling, responsive/accessibility review, validation ownership, static builds, exceptions, and upgrade maintenance. Link it from the README once it exists.

- Narrow `.storybook/main.ts` discovery from `../src/**/*.stories.@(js|ts|svelte)` to `../src/stories/**/*.stories.svelte`. Colocated and other-format stories will no longer be discovered. Inspect for excluded files during this change and require Phase 1 validation to report them rather than let stories silently disappear.
- Remove `@chromatic-com/storybook` from addon registration and dependencies, updating the lockfile.
- Preserve `docgen: false` and explain that it avoids parsing Svelte CSF stories as ordinary components. Autodocs prop documentation therefore depends on hand-maintained `argTypes`.
- Recognize `LogoLink` examples in `Brand/Logo` and `ProjectListSurface` as the primary component of `Organisms/ProjectList`. Assess documentation completeness without creating duplicate families. `Container` and `HomepageProjectList` are Astro components outside direct Svelte Storybook eligibility.
- After the standard is written, create only the narrow exception/protected-ID registry described in the inventory guide. Do not classify the full catalog or copy component-policy examples into JSON.

**Exit:** policy precedes its registry, the four review viewports work, configuration matches the documented discovery rule, and the registry contains only non-derivable decisions.

### Phase 1 — Focused validation

Use the existing TypeScript/Svelte parsing tools for source checks and add `svelte-check` for demonstrated Svelte type-checking coverage. Keep source and generated-index evidence separate internally, with only three new public commands:

| Planned command | Responsibility |
|---|---|
| `npm run check:storybook` | Svelte checking and source/config validation |
| `npm run test:storybook-checks` | Focused checker tests using the existing Node test pattern |
| `npm run verify:storybook` | Source/type checks, checker tests, one Storybook build, then generated-index validation |

Do not add separate public npm commands for every internal validation stage. These commands remain planned until implemented; the existing deployment keeps using `build-storybook`.

**Documentation checks**

Prioritize missing eligible coverage, stale exceptions, missing explicit-prop documentation, obsolete `argTypes`, configuration errors, prohibited imports, missing static assets, Docs presence, and protected-ID resolution. Check story discovery, Atomic ordering, Autodocs tags, and effective generated metadata through the appropriate source or build evidence.

Recognize component inputs, documented rejected inputs, and story-only args as distinct valid documentation subjects. An obsolete entry no longer corresponds to a supported component input, documented rejection, or intentional story-only argument and lacks a valid explanation. Require a narrow explanation for intentional extra entries; preserve Button's `class` and `style` entries documenting rejected forwarding.

Account for snippets, native forwarding, composition inputs, and intentional omissions without requiring an interactive control for every documented input. Type correctness and documentation completeness are separate checks: `svelte-check` does not establish complete `argTypes` coverage.

**Type-checking scope and acceptance**

Include discovered Svelte CSF stories and their component dependencies. State the exact included paths and treatment of module scripts, instance scripts, JavaScript, and TypeScript, with explicit limitations. Verify compatibility with the installed Svelte CSF tooling before declaring coverage complete.

- Demonstrate that unasserted invalid values fail independently in CSF `args` and directly rendered component markup.
- Confirm intentional malformed-runtime examples pass using assertions narrowly scoped to invalid fixture values and still exercise their intended fallback behavior.
- Do not use file-wide suppression or blanket casts to pass these cases. Do not claim equivalent typed-prop guarantees for JavaScript stories without evidence.

Keep intentionally invalid checker fixtures outside the published story glob. The checker test harness must explicitly include them in isolated runs and assert the expected diagnostic, so an unrelated setup error does not count as proof of type checking. Passing runtime-fallback examples remain visible stories. A registry exception cannot waive either required typed-input acceptance case.

**Coverage and generated output**

Derive primary coverage from component metadata, with explicit exceptions for multi-component families. Incidental imports do not establish documentation coverage. Detect missing eligible public Svelte components without demanding a same-named family. Require explanations for cases that cannot be resolved statically.

Validate root-relative assets and `srcset` candidates against `public/` where statically resolvable. Report stale exceptions and broken protected IDs. Reject unsupported generated-index versions explicitly. Do not enforce fixed story totals or parse prose tier examples as a complete contract.

Generated-index validation must consume the successful build from the same `verify:storybook` invocation. A failed build must stop verification; an existing `storybook-static/index.json` is not fallback evidence.

**Exit:** positive and negative fixtures demonstrate useful failures, both typed-input paths are verified, and intentional contract examples remain supported without routine catalog bookkeeping.

### Phase 2 — Existing story alignment

Review existing families and change only demonstrated gaps:

- Correct Badge, Divider, and SiteFooter descriptions; review PostHeader without assuming it needs rewriting.
- Preserve Typography's foundation exception and clarify the multi-component Logo documentation.
- Align prop documentation, rejected-input explanations, story-only args, curated controls, deterministic fixtures, and supported fallback examples with actual contracts.
- Convert touched stories to TypeScript only where the checking workflow enforces it. Preserve useful composition coverage, titles, and effective export names.

Compare freshly built story and Docs IDs before and after alignment using a temporary baseline. Investigate missing or changed IDs; retain the comparison outcome in the phase evidence, not a checked-in full catalog or count sentinel. This rollout comparison complements the durable registry, which protects only explicitly registered references.

**Exit:** the catalog passes `npm run verify:storybook`, with justified exceptions recorded. New checkers may land before alignment, but the independent CI job waits until Phase 4.

### Phase 3 — Targeted manual review

Review changed stories at their default viewport and their Docs pages. Expand layout-sensitive examples to 430, 744, 1024, and 1512px. Check only affected breakpoint boundaries at 631/632, 1014/1015, and 1175/1176px. Use representative examples for 320px reflow and 200% text enlargement.

Apply system/light/dark theme, semantics, keyboard, focus, accessible-name, and reduced-motion checks where relevant; do not require the entire catalog at every combination. Consult the historical harness references in the alignment record for prior scenarios, not proof that current behavior passes.

The phase implementer records findings, affected stories, conditions, resolutions, and remaining issues. Add one concise completion summary describing selection and relevant command evidence, rather than a row for each passing combination.

**Exit:** material findings are resolved or explicitly dispositioned with reproducible evidence.

### Phase 4 — Independent checks and maintenance

After alignment and manual review, add `verify:storybook` as an independent CI job on main pushes and manual dispatch. Keep failures visible. Site build/deploy jobs must not depend on its result or artifacts, and quality failures must not cancel deployment through fail-fast orchestration. Retain the existing Storybook build and `dist/storybook` publication path.

Require clean-install verification in CI or a disposable environment. Verify that an intentional quality-check failure does not prevent an otherwise successful site build/deploy. This does not claim protection from the existing Storybook build's failures.

Upgrade triggers are Storybook major changes, renderer/CSF changes, and generated-index format changes. For each trigger, review target-version migration guidance, run the applicable migration tooling in an isolated checkout, inspect the resulting changes, rerun validation, and manually verify viewport controls, Docs, themes, and protected links. Update parser support explicitly when the index format changes.

**Exit:** clean-install validation and the existing publication artifact pass, new quality failures are visible without blocking deployment, and the contributor standard documents the upgrade procedure.

## Validation and responsibility boundaries

For future Storybook-system code changes, run `npm run check`, `npm run build`, and `npm run build-storybook`. Once Phase 1 exists, use `npm run verify:storybook` for unified Storybook verification instead of building Storybook twice locally.

Local `npm run check:rich-text` is targeted to prose components/stories, links, Markdown rendering, or rich-text CSS changes. Deployment continues running it unconditionally after the site build. Run `npm run test:tokens` for token definitions, reconciliation behavior, or token-facing styles. Run `npm ci` in CI, a fresh clone, or a disposable validation environment; do not replace the developer's installation merely to collect rollout evidence.

Automate mechanical facts and focused failures. Keep eligibility exceptions, tier interpretation, fixture representativeness, control usefulness, accessibility judgment, visual quality, and representative review selection with human review. Document limitations rather than silently claiming complete coverage.

For this Markdown-only planning revision, check report dispositions, links, phase/command consistency, portability, and the diff. No builds or new tests are required, and no future implementation check should be reported as already passing.

## Format for future phase implementation plans

Each phase plan should include its objective, exact files, interfaces/data flow, dependency-ordered tasks, verification and expected results, manual evidence, failure/rollback behavior, dependencies, and completion criteria. Resolve implementation details for that phase without repeating contributor policy or creating another catalog.

Link to the contributor standard once it exists. Keep exception decisions in the registry and implementation evidence in the alignment record or task handoff. Source and generated output remain the authorities for catalog facts.
