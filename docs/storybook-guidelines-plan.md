# Storybook Guidelines Roadmap

Status: planning only. This document records the approved implementation roadmap. It does not itself authorize implementation of any phase.

## Purpose

Establish repository-specific Storybook guidelines for Invisible Sloth while preserving the existing Atomic organization:

`Brand → Foundations → Atoms → Molecules → Organisms → Templates`

The eventual standard will describe how Storybook documents reusable Svelte components, validates their contracts, and supports responsive and accessible review. It will not copy TennTronics-specific Astro architecture, component taxonomy, testing infrastructure, or workflow assumptions.

## Current repository baseline

- Astro 7 static site with Svelte 5 interactive islands.
- Storybook 10.5 using `@storybook/svelte-vite`, Svelte CSF v5, and Vite.
- npm 10.9.4; Node 22.22.0 from `.nvmrc`; package engines require Node `>=22.12.0`.
- 35 Svelte CSF story files, 258 story entries, and 35 generated Docs entries.
- Global preview styles, system/light/dark themes, enhancement scripts, and named viewports at 430, 744, 1024, and 1512 pixels.
- No unit runner, Storybook test runner, Vitest integration, browser suite, accessibility CI, or visual-regression CI.
- Deployment currently builds Storybook and copies it into `dist/storybook`.
- `src/components/README.md` is the component-boundary and extension-tier authority.
- Existing `AGENTS.md` and `CLAUDE.md` files are ignored local guidance and will not become tracked Storybook authorities.

The current audit found no tracked or historical individual Storybook links.
The initial protected-ID registry should therefore be empty.

## Target documentation and implementation artifacts

These artifacts have different responsibilities and must not duplicate one another:

| Artifact | Responsibility | Planned timing |
|---|---|---|
| `docs/storybook-guidelines-plan.md` | High-level roadmap and sequencing | This planning step |
| `docs/storybook-standard.md` | Final contributor-facing policy | Phase 1 |
| `.storybook/inventory.json` | Canonical machine-readable catalog | Phase 0 |
| `docs/storybook-component-inventory.md` | Inventory schema and maintenance guide | This planning step; refined in Phase 1 |
| `docs/storybook-alignment-plan.md` | Rollout evidence and manual-review record | This planning step; populated during rollout |
| `scripts/check-storybook-source.mjs` | Source/config validation | Phase 2 |
| `scripts/check-storybook-inventory.mjs` | Generated-catalog validation | Phase 2 |

The generated `storybook-static/index.json` remains an observed build artifact, not an authoritative or checked-in inventory.

## Decisions already resolved

- Preserve the existing Atomic categories and order.
- Use a hybrid inventory model: each family has a `defaultStoryMode` and story-level overrides keyed by effective Svelte CSF `exportName`.
- Compute the effective classification of every story from the family default plus overrides.
- Protect only explicitly registered Storybook IDs; start with no protected IDs.
- Protected IDs must remain resolvable. Do not introduce `idMigrations`, since a migration record cannot redirect an old Storybook URL.
- Use `not-documented` for components without an assigned extension tier and require their approved control surface to be recorded explicitly.
- Use an explicit browser-safe `src/lib` allowlist. Server/content adapters, including `src/lib/projectContent.ts`, remain outside Storybook.
- Keep supported fallback and malformed-input stories visible.
- Defer true hidden machine-only fixtures until a test runner consumes them.
- Do not add a browser suite, visual-regression service, new dependency, or pull-request workflow in this rollout.
- Record rollout review evidence in the alignment document initially, then in the implementation task or landing handoff. If pull requests become routine, their descriptions may carry the evidence.

## Phase roadmap

### Phase 0 — Baseline and inventory schema

Create the initial `.storybook/inventory.json` and record the current 35-family catalog, expected counts, Atomic order, subjects, extension tiers, exceptions, typing exceptions, import policy, and empty protected-ID registry.

The phase is complete when every existing family is represented and every story receives an effective mode through a family default or valid override.

### Phase 1 — Final standard and contributor documentation

Create `docs/storybook-standard.md` and update the tracked README to point to the Storybook documentation. Replace duplicated patch-level version claims with version-family descriptions and links to `package.json`, `package-lock.json`, and `.nvmrc`.

The final standard will cover eligibility, Atomic taxonomy, Svelte CSF, Autodocs, coverage modes, fixtures, controls, styling, responsive review, accessibility, test ownership, inventory safeguards, static builds, exceptions, and upgrade maintenance.

### Phase 2 — Validation scripts and catalog checks

Create source and generated-index validators using the repository’s existing TypeScript and Svelte parsing dependencies. Validate configuration, filesystem locations, effective generated metadata, IDs, Docs entries, imports, assets, and inventory overrides through separate evidence paths.

Add these commands:

```text
npm run check:storybook-source
npm run check:storybook-inventory
npm run test:storybook-checks
npm run verify:storybook
```

`verify:storybook` must run source validation, `build-storybook`, generated inventory validation, and checker tests in that order.

Checker development may land separately, but deployment must continue using the existing Storybook build until Phase 3 passes. Phases 2 and 3 may be implemented and landed together.

### Phase 3 — Existing story alignment

Review all 35 story files but modify only those requiring descriptions, control or fixture corrections, approved visibility changes, or TypeScript conversion because they are otherwise being touched.

Add or review the Badge, Divider, SiteFooter, and PostHeader descriptions; retain Typography as the approved foundation exception. Record mixed-family classification primarily through inventory defaults and overrides. Preserve useful fallback, composition, and diagnostic coverage.

The baseline must pass `npm run verify:storybook` before deployment is wired to the new command.

### Phase 4 — Docs, responsive, accessibility, and manual review

Review changed stories at their default viewport. Review layout-sensitive contract and overview stories at 430, 744, 1024, and 1512 pixels; review only affected breakpoint boundaries at 631/632, 1014/1015, and 1175/1176 pixels.

Use representative stories for 320px reflow and 200% text enlargement. Review themes, reduced motion, semantics, keyboard behavior, focus visibility, accessible names, and Docs-page rendering. Record evidence in `docs/storybook-alignment-plan.md` during rollout.

### Phase 5 — Deployment rollout and maintenance

After Phase 3 alignment and Phase 4 review pass, change deployment to call `npm run verify:storybook`. Confirm clean-install validation and production artifact behavior. Document the contributor workflow and upgrade triggers.

## Global validation policy

For Storybook-system changes, run:

```text
npm run check
npm run build
npm run build-storybook
```

After Phase 2 is implemented, use `npm run verify:storybook` as the unified Storybook command. Run `npm run check:rich-text` only when prose components, prose stories, links, Markdown rendering, or rich-text CSS change. Run `npm run test:tokens` only when token definitions, reconciliation behavior, or token-facing styles change.

Run `npm ci` only in CI, a fresh clone, or a disposable validation environment. Clean-install validation is a rollout completion requirement.

## Deployment sequencing gate

The deployment workflow must not switch from `build-storybook` to `verify:storybook` until:

1. Phase 2 checker development is complete.
2. Phase 3 catalog alignment passes the unified command.
3. Phase 4 manual Docs, responsive, accessibility, and evidence requirements are complete.

This permits checker work and catalog migration to be reviewed separately while preventing an intentionally incomplete checker from blocking deployment.

## Safeguards and human responsibilities

Automate exact story globs, Atomic ordering, generated IDs, protected-ID resolution, counts, Docs presence, tags, valid overrides, approved imports, asset existence, and static Storybook builds.

Keep eligibility, taxonomy, coverage judgment, control-surface exceptions, fixture representativeness, accessibility judgment, visual quality, and representative viewport selection as human-review responsibilities.

## Maintainer approval checkpoints

- Hybrid inventory classification model.
- Exact `src/stories/**/*.stories.svelte` story glob.
- Empty initial protected-ID registry and resolvability requirement.
- No initial `idMigrations` mechanism.
- `not-documented` extension-tier handling.
- Browser-safe `src/lib` allowlist.
- Deferral of hidden fixtures, pull-request CI, browser tests, and visual tests.
- Risk-based manual review matrix and evidence location.
- Deployment switch only after Phase 3 alignment passes.

## Format for future phase implementation plans

Each phase-specific plan should include only the detail needed to execute that phase:

- Objective and scope boundaries.
- Repository evidence motivating the work.
- Exact files to create or change.
- Interfaces, schemas, and data flow.
- Implementation tasks in dependency order.
- Verification commands and expected results.
- Manual-review requirements and evidence location.
- Risks, failure handling, and rollback or deferral behavior.
- Dependencies on earlier phases.
- Explicit completion criteria.

Do not repeat final policy text in phase plans. Link to `docs/storybook-standard.md` once it exists, and keep catalog facts in `.storybook/inventory.json`.
