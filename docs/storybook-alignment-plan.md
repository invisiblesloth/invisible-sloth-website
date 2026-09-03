# Storybook Alignment and Review Record

Status: rollout evidence template. No alignment phase has started.

This document records evidence collected while implementing the roadmap in [`storybook-guidelines-plan.md`](./storybook-guidelines-plan.md). It is not the Storybook policy and is not the canonical component inventory.

## Baseline audit

| Field | Value |
|---|---|
| Audit date | 2026-09-03 |
| Commit SHA | _to be recorded when rollout begins_ |
| Reviewer | _to be recorded_ |
| Storybook version | Storybook 10 family; authoritative value in `package.json` and `package-lock.json` |
| Renderer | `@storybook/svelte-vite` |
| Story files | 35 |
| Story entries | 258 |
| Docs entries | 35 |
| Protected IDs | None initially |
| Test runner | None currently installed or configured |
| Visual regression | None currently executed |
| Accessibility CI | None currently configured |

The current audit found no tracked or historical individual Storybook links. Private bookmarks cannot be discovered, so only explicitly registered future references should become protected IDs.

## Known baseline observations

- Atomic ordering is already configured as Brand, Foundations, Atoms, Molecules, Organisms, Templates.
- Preview setup includes global styles, system/light/dark themes, enhancement scripts, and named viewports at 430, 744, 1024, and 1512 pixels.
- Existing stories use Svelte CSF and `autodocs`.
- Badge, Divider, and SiteFooter need component-description work.
- PostHeader already has a substantial description and needs review rather than an assumed rewrite.
- Typography is an approved foundation story without component metadata.
- Existing fallback and composition stories should be classified before any visibility changes are considered.

## Command evidence

Record command, environment, date, result, and relevant output for each run.

| Command | Environment | Result | Evidence/notes |
|---|---|---|---|
| `npm ci` | Clean install / CI / disposable environment | _pending_ | Required for rollout completion |
| `npm run check` | Clean install | _pending_ | Current non-clean `node_modules` state lacks `@astrojs/sitemap` |
| `npm run build` | Clean install | _pending_ | Current non-clean `node_modules` state lacks `@astrojs/sitemap` |
| `npm run build-storybook` | Current audit environment | Passed | Existing static build succeeds with a Vite chunk-size warning |
| `npm run verify:storybook` | After Phase 2 | _pending_ | Must include every checker |

Run `npm run check:rich-text` only for prose, Markdown, links, or rich-text changes. Run `npm run test:tokens` only for token definitions, reconciliation, or token-facing styles.

## Phase evidence

### Phase 0 — Baseline and inventory

- Inventory path: `.storybook/inventory.json`
- Maintainer decisions:
  - [ ] Hybrid family-default and story-override model approved.
  - [ ] Atomic order approved.
  - [ ] Empty initial protected-ID registry approved.
  - [ ] Browser-safe import policy approved.
- Completion evidence:
  - [ ] All families represented.
  - [ ] Effective mode exists for every story.
  - [ ] Expected family counts recorded.

### Phase 1 — Standard documentation

- Standard path: `docs/storybook-standard.md`
- Completion evidence:
  - [ ] Contributor workflow documented.
  - [ ] Framework-specific rules separated from universal Storybook guidance.
  - [ ] README points to the tracked Storybook documentation.
  - [ ] Version authorities are `package.json`, `package-lock.json`, and `.nvmrc`.

### Phase 2 — Validation scripts

- Completion evidence:
  - [ ] Configuration checks use focused TypeScript AST parsing.
  - [ ] Story checks use supported Svelte parsing.
  - [ ] Generated-index checks use `storybook-static/index.json`.
  - [ ] Checker tests cover success and failure cases.
  - [ ] `verify:storybook` invokes source validation, the build, inventory validation, and checker tests.

### Phase 3 — Story alignment

- Completion evidence:
  - [ ] All 35 files reviewed as candidates.
  - [ ] Only necessary story files changed.
  - [ ] Required descriptions and exceptions are recorded.
  - [ ] Mixed-family overrides are valid.
  - [ ] `npm run verify:storybook` passes.

### Phase 4 — Manual review

- Completion evidence:
  - [ ] Changed stories reviewed at their default viewport.
  - [ ] Layout-sensitive stories reviewed at 430, 744, 1024, and 1512 pixels.
  - [ ] Affected breakpoint boundaries reviewed.
  - [ ] Representative 320px reflow and 200% text checks completed.
  - [ ] Theme, reduced-motion, Docs, semantic, keyboard, focus, and a11y checks completed.
  - [ ] Reviewed story IDs and findings recorded below.

### Phase 5 — Deployment and handoff

- Completion evidence:
  - [ ] Deployment switches to `npm run verify:storybook` only after Phase 3 alignment passes.
  - [ ] Clean-install validation passes.
  - [ ] Static Storybook is present under `dist/storybook`.
  - [ ] Maintainer signoff recorded.

## Manual review matrix

| Story ID or family | Review reason | Viewports | Themes | Reduced motion | Accessibility/keyboard | Reviewer | Result |
|---|---|---|---|---|---|---|---|
| _to be recorded_ | _default / layout / Docs / diagnostic_ | _to be recorded_ | _to be recorded_ | _yes/no_ | _to be recorded_ | _to be recorded_ | _pending_ |

Review every changed story at its default viewport. Expand to all four named viewports for layout-sensitive contract and overview stories. Review only affected breakpoint boundaries at 631/632, 1014/1015, and 1175/1176 pixels. Use representative stories for 320px reflow and 200% text enlargement rather than rendering the entire catalog at every combination.

## Exceptions and decisions

Record durable exceptions in `.storybook/inventory.json`; record the review context and evidence here.

| Date | Story/family | Exception or decision | Rationale | Approver |
|---|---|---|---|---|
| _to be recorded_ | _to be recorded_ | _to be recorded_ | _to be recorded_ | _to be recorded_ |
