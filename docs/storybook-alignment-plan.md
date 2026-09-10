# Storybook Alignment and Review Record

Status: Phases 0 and 1 complete; rollout Phases 2–4 have not started. This record contains report dispositions, historical observations, and implementation evidence.

The [roadmap](./storybook-guidelines-plan.md) owns decisions, sequencing, and completion criteria. The [registry guide](./storybook-component-inventory.md) explains exception maintenance. This record does not introduce another policy, catalog, or approval checklist.

## Baseline observations

The September 3, 2026 source audit reported 35 Svelte CSF story files, 258 story entries, and 35 Docs entries using Storybook 10 and `@storybook/svelte-vite`. Counts are dated observations, not enforced requirements. Version authorities are [package.json](../package.json), [package-lock.json](../package-lock.json), and [.nvmrc](../.nvmrc).

- Atomic ordering, global styles, system/light/dark themes, enhancement scripts, Svelte CSF, and Autodocs are present.
- At the time, the intended 430/744/1024/1512px viewports used obsolete configuration. Working toolbar choices and canvas dimensions required Phase 0 verification.
- Badge, Divider, and SiteFooter need description work. PostHeader already has a substantial description; Typography is the foundation exception.
- `LogoLink` has linked and fallback examples in `Brand/Logo`; `ProjectListSurface` is the primary component of `Organisms/ProjectList`. `Container` and `HomepageProjectList` are Astro components.
- `docgen: false` makes manual prop documentation load-bearing. Button intentionally documents rejected `class`/`style` inputs and uses narrowly asserted malformed-runtime fixtures.
- At the time, Chromatic was installed and registered without a configured visual-regression service, and Svelte story type-checking coverage had not yet been demonstrated.
- The source audit found no tracked or historical individual Storybook links; private bookmarks were not discoverable. The roadmap therefore starts protected IDs empty.

The source audit reported a successful Storybook build with a Vite chunk-size warning. It also reported a non-clean local installation missing the declared `@astrojs/sitemap` dependency. These are historical environment observations, not fresh validation results or proof of a repository dependency defect. No builds or clean-install checks were performed for this Markdown revision.

## Phase 0 implementation evidence

Phase 0 was completed on September 4, 2026 by Codex in a working tree based on
commit `3e9673dc577b66104624b13709e69263d6451c53`. The inspected base matched the
approved revision, so no re-audit was required. Validation used Node 22.22.0 and
npm 10.9.4.

The pre-change discovery check found no `*.stories.*` files outside
`src/stories/**/*.stories.svelte`. A baseline `npm ci` completed before the
dependency changes; it does not represent clean-install verification of the
final lockfile. `npm run check`, `npm run build`, and `npm run build-storybook`
completed successfully after the changes. The Storybook build kept the existing
non-fatal Vite chunk-size warning. A temporary comparison of the pre- and
post-change generated indexes found no changes to entry IDs, types, titles,
names, or effective export names; neither index snapshot was retained.

Fresh Storybook UI review used `Organisms/ProjectList / Stacked List`. Large was
selected initially with rotation off. Compact, Medium, Extended, and Large were
all available in the toolbar and resized the canvas to 430 × 932, 744 × 1133,
1024 × 1366, and 1512 × 982 respectively; Large remained selectable afterward.
No unresolved Phase 0 findings remain. This evidence does not represent the
broader manual catalog review planned for Phase 3.

## Report dispositions

Source: the report attached to **“W1 Storybook standards updates”**, dated **September 3, 2026**, reviewing the Storybook guidelines roadmap, inventory guide, and alignment record. The implementation task retains the local source attachment reference; tracked documentation identifies it by task title and date for portability.

The original report's A–J points and six numbered omissions are dispositioned once below. Status describes the planning response, not rollout completion. Explanations include subsequent review qualifications so contributors do not need the original attachment to understand the decisions.

| Report item | Disposition | Decision and implementation destination |
|---|---|---|
| A — Redundant inventory | adopted | Keep only exceptions, judgment-based approvals, and protected IDs; derive catalog facts and remove expected counts. Phase 0 and the registry guide. Tier derivation is qualified under omission 4. |
| B — Unconsumed story modes | deferred | Remove mandatory classification from this rollout. Revisit only when a concrete consumer needs modes; manual review follows changed behavior. Authoritative decisions. |
| C — Deployment blast radius | adopted | Add independent quality verification with visible failures and no site build/deploy dependency. Retain the existing combined publication path, so Storybook build failures can still block deployment. Phase 4. |
| D — Unused Chromatic addon | adopted | Remove the addon registration and dependency, including its lockfile entry. Phase 0. |
| E — Script surface | adopted | Expose only `check:storybook`, `test:storybook-checks`, and `verify:storybook`; keep source/index stages internal. Retain focused Node checker tests. Phase 1. |
| F — Missing problem and outcomes | adopted | Lead with reliable contracts and low upkeep; define completion through usable review tools, meaningful drift detection, resolved findings, and independent checks. Roadmap problem/outcome and phase exits. |
| G — Policy follows registry | adopted | Write the contributor standard before creating its registry in Phase 0; repair the viewport prerequisite first. |
| H — Duplicate approval lists | adopted | Use the roadmap's authoritative decisions as the single list. Remove repeated approval checkboxes and conflicting resolved/pending labels. |
| I — Unowned attestation matrix | adopted | The phase implementer records findings as discovered and one completion summary when exiting a phase. No per-story/per-viewport passing attestations. Phase 3 and evidence instructions below. |
| J — Smaller inconsistencies | adopted | Remove README's Storybook “coming soon”; use version families linked to authorities; schedule the narrow story glob and report excluded files; distinguish targeted local rich-text checking from unconditional deploy checks. Phase 0 and validation boundaries. |
| Omission 1 — Broken viewports | corrected | Adopt the urgent repair, using `parameters.viewport.options` and `initialGlobals.viewport = { value: 'large', isRotated: false }`, correcting the report's final `globals` suggestion. Verify selectable toolbar sizes and actual canvas resizing in Phase 0. |
| Omission 2 — Manual prop documentation | adopted | Explain `docgen: false` and validate documentation separately from types. Preserve documented rejected inputs and intentional story-only args with narrow explanations. Button's rejected `class`/`style` entries are valid; an entry is stale only when it no longer describes a supported input, rejection, or story-only arg and lacks a valid explanation. Do not demand controls for every documented input. Phases 0–1. |
| Omission 3 — Story type checking | corrected | Add `svelte-check`, but do not claim it proves `argTypes` completeness. Demonstrate unasserted invalid CSF `args` and direct component markup both fail; narrowly asserted runtime fixtures must pass and still exercise fallback behavior. State included files, module/instance script modes, JavaScript/TypeScript treatment, and limitations. Phase 1. |
| Omission 4 — Component coverage and tier derivation | corrected | LogoLink already has examples in Brand/Logo, and ProjectListSurface is the primary ProjectList component. The other two named components are Astro components. Check eligible Svelte coverage by identity, with multi-component exceptions; do not create four new families. The component README illustrates tier policy and must not be parsed as an exhaustive registry. Phases 0–2. |
| Omission 5 — Previous review work | adopted | Reference historical harnesses as sources of scenarios, not current passing evidence; reproduce relevant checks and record fresh findings. Phase 3 and prior art below. |
| Omission 6 — Upgrade policy | adopted | On Storybook majors, renderer/CSF changes, or index-format changes, inspect target-version migration guidance/tooling in an isolated checkout, rerun verification, and review viewports, Docs, themes, and protected links. Phase 4. |

The report's opening viewport blocker is omission 1. Its “Too much” section is covered by A, B, and I; the proposed exhaustive README tier checker is corrected under omission 4. Its final eight recommendations map respectively to omission 1; G; A; B; omissions 2–3; omission 4; C; and H/I. These references consolidate repeated recommendations rather than create another decision list.

## Historical review scenarios

The source report identifies `.astro/phase8-storybook-a11y.html` and `.astro/phase8-storybook-matrix.html` as prior local review harnesses. They are generated/local artifacts and may be absent from a fresh checkout; they are not durable evidence links or prerequisites.

Their scenarios can inform focused checks of interactive links and disabled states, LogoLink naming, image fallbacks, project cards, footer contact content, and long-content layouts. Fresh review must use the corrected viewport configuration and current stories. Do not infer current accessibility compliance or review completion from those harnesses or their prior execution.

## Evidence ownership and timing

During rollout, the phase implementer records findings when discovered and adds one concise completion summary when the phase exits. Include phase, date, commit, implementer, outcome, representative scope and selection reason, command evidence, and any unresolved findings. If a phase is incomplete, say so explicitly. Do not duplicate the roadmap's exit criteria as checkboxes.

For command evidence, record the command, environment, date, outcome, and a concise diagnostic or task reference when needed. Clean-install evidence belongs to CI, a fresh clone, or a disposable environment. Do not treat the historical build observation above as satisfying rollout validation.

The Phase 1 unified command includes source/type validation, checker tests, one build, and generated-index validation. Its generated-index stage accepts only version 5 output whose path and timestamp match the successful build in that invocation. Deployment still runs `check:rich-text` unconditionally and does not invoke the new quality command.

For Phase 1, identify the expected diagnostics from isolated negative-fixture runs separately from passing runtime-fallback stories. For Phase 2, record the outcome of the temporary before/after story and Docs ID comparison. Neither negative checker fixtures nor the temporary catalog baseline belongs in the published Storybook or a permanent inventory.

### Phase 1 completion and stabilization — September 8–10, 2026

Phase 1 was implemented and verified against local main base
`24800bf40e5185e709953e5367767ff7df25145a`. The focused source model derived 35
current story sources without enforcing that count. It found and resolved
missing explicit-prop documentation, including both Brand/Logo documentation
subjects, while retaining the Typography foundation and ProjectListSurface
decisions. Image and Figure's deliberately missing literals now have
occurrence-local explanations; the Image debug binding has four field-specific
dynamic-asset approvals whose update-to-spread dataflow is checked for staleness.

`npm run check:storybook` passed with zero errors. `svelte-check` 4.7.6 retained
one existing `emptyRules` CSS warning in `ContentSection.stories.svelte`; the
Phase 1 threshold is errors. Isolated machine-verbose fixtures produced exactly
one TypeScript diagnostic (`source: ts`, code 2322) for invalid CSF args and
exactly one for invalid direct component props. The narrowly asserted malformed
runtime fixture passed, demonstrating the documented assertion limitation.

`npm run test:storybook-checks` passed 100 focused tests. A narrow hardening pass
made malformed registry entries deterministic diagnostics instead of internal
failures, rejected wholly dynamic args, resolved supported named imported const
objects, made multi-component exceptions sensitive to their direct imports,
made asset directives occurrence-local and stale when unmatched, resolved static
asset expressions in local and imported argument objects, required approval for
unresolved asset spreads, required field-sensitive approvals for dynamic assets,
parsed the exported Storybook configuration and static and dynamic runtime import
kinds, diagnosed deleted tracked sources and dependency or registry paths, rejected
extra or unsupported same-source index entries, and removed each focused test's
temporary repository after the run. The final review-hardening pass also covered
runtime re-exports and CommonJS edges, ignored type-only edges, parsed network
calls and misplaced CSF markers without regex decoys, checked preview dependencies
and imported-helper assets, required documentation for native attributes actually
used as args, rejected invalid Story identifiers and unresolved config structure,
enforced canonical registry paths and live exception targets, and detected duplicate
Docs IDs. A temporary-config
Storybook 10.5.0 build captured `MyStory1` as `my-story-1` and `HTTPStatus` as
`http-status`. It also found that Svelte CSF 5.1.2 accepts but does not propagate
`defineMeta.id`; no production family currently uses an explicit metadata ID,
and same-build comparison will reject a future mismatch. The capture records
the Storybook, Svelte CSF, Svelte-Vite, and `@storybook/csf` versions and becomes
stale on any mismatch.

A final contract-boundary audit then closed the remaining review gaps: individual
story control lists are checked, forwarded-native documentation must correspond
to a forwarding component contract, Image debug approvals use AST-confirmed
update-to-render dataflow, and misplaced CSF detection covers supported module
extensions and bound default metadata. Protected IDs are matched case-sensitively,
one imported asset literal consumes one directive even when reused, unresolved
story-helper assets require approval, and public component asset inputs remain
validated at their story uses. The same pass added extensionless module-variant
resolution, imported snippet and static `Pick`/`Omit` prop composition, live-use
checks for typing approvals, absence checks for primary-metadata exceptions, and
fail-fast handling for unsupported generated-index versions.
Runtime hardening also follows Vite's installed extension order, reports shared
dependency failures once, distinguishes browser-global network APIs from local
methods with the same names, and prevents browser-safety approvals from waiving
known Astro server-only imports.

An outside review on September 10 reproduced false passes in the static source
model despite the earlier green suite. The stabilization response defined the
checker as a bounded analyzer and documented its supported syntax. Prop contracts
now fail closed for mapped, computed, cyclic, disconnected, or otherwise
unresolved type forms while retaining project-owned `*Attributes` types and
supported local default/named imports. Metadata and imported constants use their
actual immutable lexical scope rather than recursively collected names. Asset
directives and argType omissions come from parsed comments, so string and
multiline-template decoys are inert; remote and CSS/style fixture assets are
checked. Direct browser-global network detection honors local bindings.
Aliased, destructured, wrapped, and otherwise indirect network calls remain
prohibited by contributor policy but are explicitly outside the mechanical
guarantee. Typing and native-forwarding approvals require an actual
value/dataflow use, and Image's
dynamic approvals are kept live only by event-driven scenario updates reaching
the single rendered Image spread. Each reproduced false pass has a focused
regression fixture, including unsupported cases that must diagnose rather than
silently return partial results.

The final narrow hardening pass exercised adjacent paths inside that bounded
contract. It stopped cyclic local asset aliases from recursing internally,
preserved every projection when one base prop type is reused through multiple
`Pick` branches, and tied native forwarding to the resolved props contract
rather than an unrelated `svelte/elements` import. It also extended lexical
live-network detection into Svelte template expressions and limited the Image
approval proof to the direct setter-body assignment instead of accepting a dead
nested assignment. Each case has a focused regression assertion within the
existing test suite.

The final correction-and-scope-reduction pass invalidated every mutated
top-level configuration constant, including dependencies referenced by the
exported object. It also retained literal exclusions from native `Omit`
contracts and made native `Pick` an explicit `SB_PROP_UNRESOLVED` boundary
instead of treating a narrowed set as a broad forwarding universe. General
network-alias tracking was deliberately not added: the standard now describes
the direct references checked mechanically and leaves indirect behavior to the
existing contributor review prohibition.

`npm run verify:storybook`, `npm run check`, and `npm run build` passed in the
working checkout after stabilization. A detached local Git worktree created from
the same base, overlaid with the complete change set, and staged then passed
`npm ci` and `npm run verify:storybook`; this proved tracked-only registry paths
and discovery in a clean Git checkout. Each unified verification
performed exactly one Storybook build and validated only its version-5 index.
Build output had the existing Vite large-chunk warning. All verification build
and disposable-worktree artifacts were removed. The required commands and the
specific supported, rejected, and unsupported contract cases recorded above
passed; this evidence does not claim complete analysis of arbitrary source
syntax.

### Focused Phase 1 manual acceptance — September 10, 2026

The frozen Phase 1 acceptance pass used the local Storybook 10.5.0 development
build and inspected Button, Brand/Logo, Image, and NavigationDrawer. All four
families exposed generated Docs pages. Button showed the curated prop table and
variant choices, and changing the primary story's label control updated its
rendered accessible button name. Brand/Logo documented the union of the Logo
and LogoLink inputs; the linked and standalone examples retained their intended
accessible names, and blank href and label examples both resolved to the home
link with the default accessible name.

Image exposed the expected source, alternative-text, layout, and fallback
controls. Its dynamic debug story was exercised through primary failure,
successful fallback loading, terminal fallback failure, and repair; the visible
diagnostics changed respectively to `fallback-loaded`, `failed`, and
`fallback-loaded`, with the repaired fallback resolving to the local responsive
asset. NavigationDrawer Docs and its seven curated controls rendered. In the
named Compact viewport, Storybook reported 430×932, the standalone drawer showed
both navigation groups and all six links without clipping, and changing the
dialog-label control updated the rendered dialog's accessible name.

This was a focused manual pass in one local browser, not a catalog-wide review,
cross-browser check, automated browser test, accessibility audit, or visual
regression baseline. Only the Button label and NavigationDrawer dialog-label
controls and the named Image fallback transitions above were exercised. The
Brand/Logo family uses fixed examples for two component contracts rather than a
single args-driven renderer, so its family-level `argTypes` were inspected as
documentation and were not accepted as unified interactive controls. The local
development server emitted the expected validation warnings for the intentional
Button, LogoLink, and Image fallback examples.

## Manual findings

No Phase 3 catalog review has been performed yet. Add entries only for findings, using a short stable identifier and recording:

- Affected story ID or family and the reason it was reviewed.
- Reproduction conditions: relevant viewport, theme, motion preference, keyboard action, or Docs context.
- Observed problem, impact, resolution or explicit deferral rationale, and verification evidence.

The phase completion summary records representative review scope even if there were no findings. Do not create passing rows for every story/viewport/theme combination. Durable exceptions belong in the registry once it exists; this record retains the discovery and resolution context.

## Planning revision verification

The original report was read and reconciled against the current sources; all A–J points and six numbered omissions have a disposition above. The subsequent argTypes, type-checking, and portability feedback is incorporated. Phase 0 changed configuration, documentation, and dependencies as recorded above. Phase 1 added focused story validation and the documented argTypes changes without changing CI or deployment behavior; completion of later rollout phases is not asserted here.
