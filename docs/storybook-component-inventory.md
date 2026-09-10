# Storybook Exception and Protected-ID Registry Guide

Status: schema version 1 and its focused validator are implemented. The [contributor standard](./storybook-standard.md) precedes and governs `.storybook/inventory.json`.

## Purpose and authority

The retained inventory filename holds a small exception/protected-ID registry, not a canonical copy of the Storybook catalog. The [roadmap's authoritative decisions](./storybook-guidelines-plan.md#authoritative-decisions) govern its scope. This guide explains maintenance; the [alignment record](./storybook-alignment-plan.md) holds report dispositions and implementation evidence.

## Schema and contents

The registry uses `schemaVersion: 1` and exactly three top-level arrays:
`exceptions`, `judgmentApprovals`, and `protectedIds`. Unknown top-level fields
and unknown entry fields are invalid. All string fields must be non-empty after
trimming, entry IDs must be unique across the registry, and source/component paths
are repository-relative POSIX paths that must resolve to tracked files.

Every exception requires `id`, `rule`, `storyTitle`, `source`, `reason`, and
`reviewTrigger`. `rule` is a closed discriminator with two valid values and
shapes:

- `component-coverage` requires a non-empty `components` array.
- `primary-component-metadata` omits `components`.

Exception sources must match the production story glob. Each component in a
coverage exception must be unique and must resolve to an eligible, tracked
top-level Svelte component.

Unknown rule values are invalid. Adding a rule or changing either shape changes
the registry interpretation and requires a `schemaVersion` bump, an update to
this guide, and an update to the validator.

Every judgment approval requires `id`, `kind`, `target`, `scope`, `reason`, and
`reviewTrigger`. `kind` is closed to `browser-safe-import`, `dynamic-asset`, and
`typing-limitation`; adding a kind requires the same versioned schema update.
Approvals are matched to the exact source and target consumed by their rule;
unmatched approvals are stale. A browser-safe approval names its bare runtime
specifier, a dynamic-asset approval names the unresolved binding field or
expression, and a typing limitation names a current double-asserted binding used
as an actual metadata/story args value or directly rendered component input.
Property-key mentions, arbitrary rendered text, ambiguous module/instance
bindings, and unrelated expressions do not keep a typing approval live.
Every protected-ID entry contains only `id`, `reason`, and a tracked `reference`,
where `id` is the exact, case-sensitive generated Storybook story or Docs ID
being protected.

The registry contains the Brand/Logo multi-component coverage, the Typography
primary-component-metadata exception, and four field-specific dynamic-asset
approvals for the Image debug story's proven update-to-spread dataflow.
Protected IDs remain empty.

Store a schema version, narrow approved exceptions, and explicitly protected IDs. An exception identifies the relevant component, story, input, or rule and explains why the normal check does not apply. Include only the identity needed to resolve that exception; do not list every family merely to establish coverage.

Examples of decisions that may require an entry include:

- Explicit multi-component coverage that primary component metadata cannot express.
- Approved eligibility or documentation omissions, including the Typography foundation case.
- Intentional rejected-input or story-only-arg documentation that the checker cannot otherwise recognize from its narrow explanation.
- Judgment-based approval for a browser-safe helper or an asset/fixture that cannot be checked statically.
- A narrowly scoped typing limitation with a reason and review trigger; it cannot waive Phase 1's required invalid-CSF-args or direct-component acceptance cases.

Keep rationale next to its source when that is sufficient; do not copy every story explanation into JSON. If a registry entry is needed, reference the source explanation instead of maintaining a second version.

Do not store story counts, a complete family/path/subject catalog, Atomic ordering, duplicated extension tiers or control surfaces, or derivable import/asset lists. Mandatory story modes and per-family defaults/overrides are deferred until a concrete consumer needs them. Ordinary story additions must not require a registry edit unless they introduce an exception or protected reference.

## Coverage and component contracts

The source checker derives primary coverage from story component metadata and uses explicit exceptions for multi-component families. Importing a component incidentally is not sufficient evidence of documentation. Story filenames need not match component names. A multi-component coverage exception also makes exactly those components the family's prop-documentation subjects. The Typography foundation exception does not create a prop contract for its preview helper.
Every component named by a multi-component coverage exception must remain a
direct runtime import of that story; removing or renaming that edge makes the
exception stale.

`ProjectListSurface` is already the primary component of `Organisms/ProjectList`; `LogoLink` already has linked and fallback examples in `Brand/Logo`. These families need a contract-completeness review, not duplicate families. `Container` and `HomepageProjectList` are Astro components and remain outside direct Svelte Storybook eligibility.

[Component policies](../src/components/README.md) remain the extension-tier authority. Their examples are illustrative, not an exhaustive component registry. Do not derive missing-tier failures from absent names or introduce a synthetic tier to fill gaps.

Documentation checks must recognize supported inputs, documented rejections, and intentional story-only args. Button's rejected `class` and `style` entries are valid contract documentation. Require narrow explanations for intentional extras, and flag entries only when they no longer correspond to any of those subjects and lack a valid explanation. Documenting an input does not require an interactive control. Type checking is separate from documentation completeness.

## Protected IDs

`protectedIds` starts empty under the roadmap decision. Add an ID when a story or Docs entry receives a tracked reference, external integration, or deliberately published permalink. Keep the reference or rationale with the entry.

Require protected IDs to resolve in generated `storybook-static/index.json`. Preserve a protected story's component segment with a compatible meta `id` and its story segment with the effective Svelte CSF `exportName`. Verify the generated result instead of assuming a rename is compatible.

The roadmap's temporary before/after ID comparison checks preservation during alignment. It does not populate this registry or introduce a permanent full-catalog baseline. Unified verification validates only the index produced by its own successful build.

The registry does not provide redirects. Do not introduce `idMigrations` as a substitute for keeping an old URL resolvable.

## Imports and assets

The roadmap's browser-safe import policy excludes pages, layouts, content collections, server/content adapters, and live network data. Derive actual imports from sources. Keep only judgment-based approvals in the registry, with narrow scope and reasons; do not maintain a second list of every observed import. Inert external link destinations are allowed.

Check root-relative asset literals and `srcset` candidates against `public/` where statically resolvable. Explain exceptions that cannot be checked statically rather than listing all valid assets.

## Maintenance workflow

When adding or changing a story, update its documentation and fixtures first. Update the registry only when an exception, judgment-based approval, or protected reference changes. Remove obsolete exceptions when their source disappears or the normal rule becomes sufficient; the checker must flag stale targets.

Run `npm run check:storybook` for source/type validation and `npm run verify:storybook` for source/type checks, checker tests, one build, and generated-index validation. Registry failures use stable `SB_REGISTRY_*` diagnostics for malformed JSON, closed-schema violations, unknown fields/rules/kinds, duplicate IDs, missing tracked paths, and stale entries. Never edit generated `storybook-static/index.json` by hand. New quality checks remain independent of site deployment under the roadmap's CI boundary.
