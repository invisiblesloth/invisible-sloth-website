# Storybook Contributor Standard

This standard defines how contributors add and maintain Storybook documentation.
The [rollout roadmap](./storybook-guidelines-plan.md) owns rollout sequencing,
the [component policies](../src/components/README.md) own component contracts and
extension tiers, the [registry guide](./storybook-component-inventory.md) owns
exception maintenance, and the [alignment record](./storybook-alignment-plan.md)
owns implementation evidence and manual findings.

## Eligibility and coverage

Every top-level Svelte component matching `src/components/*.svelte` is directly
eligible by default. Private components under `src/components/internal/`,
story-only helpers, icons and assets, Astro components, pages, layouts, content
collections, and server or content adapters are outside direct eligibility unless
they are deliberately promoted into the public component contract.

Resolve coverage by documented component identity, never by matching story and
component filenames. An eligible component is covered when it is the component
imported into primary `defineMeta({ component })` metadata or when a narrow
registry exception identifies an intentional multi-component family. Incidental
imports and composition examples do not establish coverage.

`Brand/Logo` intentionally documents both `Logo` and `LogoLink`.
`ProjectListSurface` is the primary component of `Organisms/ProjectList`.
`Container.astro` and `HomepageProjectList.astro` remain under Astro and page
validation rather than direct Svelte Storybook coverage.

## Story authoring and compatibility

Published stories are Svelte CSF files matching
`src/stories/**/*.stories.svelte`. Use `defineMeta` from
`@storybook/addon-svelte-csf` and enable `tags: ['autodocs']`. Story-only helper
components may live beside stories without using the `.stories.svelte` suffix.

Keep titles within the established Atomic hierarchy and order:
`Brand → Foundations → Atoms → Molecules → Organisms → Templates`. Existing
titles, story names, effective Svelte CSF export names, explicit meta IDs, and
generated story and Docs IDs are compatibility surfaces. Preserve them unless a
separately reviewed migration requires a change.

Storybook must keep `docgen: false`. Enabling renderer docgen causes Svelte CSF
story files to be parsed as ordinary Svelte components. Autodocs prop
documentation therefore depends on hand-maintained `argTypes` and descriptions.
Document supported inputs, intentional rejected inputs, and intentional
story-only arguments. Curate controls for useful interaction; documentation does
not require an interactive control for every input.

Every explicit non-snippet prop of each documentation subject needs an
`argTypes` entry. If a prop is intentionally omitted, place
`// storybook-check: omit-argtype <prop> -- <reason>` in that story's module
script. The checker rejects malformed, duplicate, wrong-script, and stale
omissions. Snippet inputs may be omitted under the built-in snippet rule.
Native/rest attributes are not enumerated as public props, but every native
attribute actually used in meta or story args must have an `argTypes` entry
categorized as `Forwarded native attribute`, and that category is valid only
when the documentation subject has a native forwarding contract. Static
`controls.include` lists are checked at both metadata and individual-story scope.

## Fixtures, imports, and styling

Use deterministic local fixtures and browser-safe helpers. Keep supported
malformed-runtime and fallback examples visible, using assertions only around
the intentionally invalid fixture value. Do not add stories that intentionally
throw.

Do not import pages, layouts, content collections, server-only modules, content
adapters, or live network data into stories. Inert external link destinations
are allowed. The checker rejects direct uses of `fetch`, `XMLHttpRequest`,
`WebSocket`, and `EventSource`, including direct `window`, `globalThis`, and
`self` member calls, in Svelte scripts and template expressions while
respecting lexical shadowing. Aliases, destructuring, and other indirect calls
are outside this mechanical check and therefore require contributor review;
they are not permission to use live data. Root-relative asset and
`srcset` literals must resolve under `public/` when they can be checked
statically. Ask for a narrow judgment approval only when browser safety or asset
resolution cannot be established mechanically.
Remote `http:`, `https:`, and protocol-relative media fixtures are prohibited;
use local deterministic assets. The same policy applies to static `url(...)`
values in story CSS and inline style attributes.
The browser graph begins at every story and `.storybook/preview.ts`, follows
runtime imports, re-exports, dynamic imports, and `require()` edges, and excludes
type-only edges. Only `svelte` and `@storybook/addon-svelte-csf` are intrinsically
allowed as bare runtime imports; another bare package needs a scoped
`browser-safe-import` approval.

A deliberately absent literal needs an immediately preceding
`storybook-check: allow-missing-asset -- <reason>` comment. One directive covers
one literal occurrence and becomes stale when the literal resolves or moves.
Static asset literals in imported Svelte helpers and named imported scalar or
object constants are checked too. Runtime-computed paths require a field- or
binding-specific `dynamic-asset` approval. Dynamic public-component inputs are
validated through their story arguments; unresolved bindings owned by story-only
helpers require the narrow approval themselves.

Use the shared global styles and design tokens. Follow component ownership for
rails, placement, section rhythm, and extension hooks; story wrappers may supply
only the context needed to demonstrate the contract.

## Responsive and accessibility review

The global viewport choices are Compact (430 × 932), Medium (744 × 1133),
Extended (1024 × 1366), and Large (1512 × 982), with Large as the initial
selection and rotation disabled. Review changed layout-sensitive behavior at the
relevant named sizes rather than applying a catalog-wide matrix.

For changed behavior, review relevant semantics, accessible names, keyboard and
focus behavior, system/light/dark themes, and reduced-motion behavior. Record
material findings and their disposition in the alignment record; do not create
passing rows for every story and condition.

## Validation and static builds

Use the focused command that matches the change:

- `npm run check:storybook` checks source/configuration contracts, then runs
  `svelte-check` over Storybook configuration, all Svelte stories and helpers,
  Svelte components, icons, types, and imported browser support code.
- `npm run test:storybook-checks` runs isolated positive and negative fixtures.
- `npm run verify:storybook` runs both gates, performs exactly one fresh
  Storybook build in a temporary directory, and validates that build's index.

The source validator is deliberately a bounded repository checker. Its syntax
contract is:

| Area | Supported forms | Incomplete or unsupported behavior |
|---|---|---|
| Component props | An exported module `Props` type named by typed, destructured `$props()`; type literals and interfaces; local named/default type imports; intersections and unions; `Partial`, `Required`, `Readonly`, literal-key projections of explicit props, and literal-key `Omit` of native attributes; `Snippet`; native types imported from `svelte/elements`; explicit string index signatures | Mapped/conditional types, unresolved imports or references, computed members, non-destructured or untyped `$props()`, non-literal projection keys, and `Pick` over a native attribute universe emit `SB_PROP_UNRESOLVED`; recovered members never turn an incomplete contract into success |
| Constants and imports | Top-level immutable `const` bindings; module scope for `defineMeta`; instance-over-module scope in template expressions; named imports of exported top-level constants from local JS/TS module variants | Mutable or post-declaration-mutated bindings and nested, cyclic, computed, namespace, external, or missing bindings remain unresolved and emit the consuming rule's diagnostic |
| Metadata, args, and controls | Static object/array/scalar literals, supported top-level constants, and statically resolvable object spreads at meta and story scope | Dynamic values, computed keys, methods, or unresolved spreads emit `SB_CSF_UNRESOLVED` or `SB_ARGS_UNRESOLVED`; any recovered keys are still checked |
| Source directives | Parsed line/block comments in scripts, HTML comments in markup, and CSS block comments; a missing-asset directive attaches only to the literal on the immediately following line | Text in strings/templates is inert; malformed, duplicate, moved, resolved, or unmatched directives fail explicitly |
| Native forwarding | A `$props()` rest binding, or an identifier derived from it, spread onto markup, with a `svelte/elements` type or explicit string index signature establishing the forwarding contract; literal native `Omit` exclusions remain excluded | Names such as `*Attributes` alone and unrelated spreads do not prove forwarding; `Pick`-narrowed native universes are unsupported; omitted or otherwise unproven forwarded-native `argTypes` become obsolete |
| Live network use | Direct calls/construction through the named browser APIs above, including their direct global-object member forms, in scripts and template expressions | Aliases, destructuring, wrappers, and other indirect invocation are not mechanically proven; the contributor prohibition and review requirement still apply |
| Assets and Image runtime data | Local root-relative media and `srcset`, static story/helper objects and attributes, CSS/style `url(...)`, and the exact `debugImageProps` state → direct `setDebugScenario` body assignment → `<Image {...debugImageProps}>` flow | Remote fixtures fail with `SB_ASSET_REMOTE`; other dynamic paths need an exact `dynamic-asset` approval and stale when the binding, field, or proven flow changes |

Every resolver therefore distinguishes complete from incomplete resolution and
preserves the binding/source occurrence used by its rule. New syntax is not
implicitly accepted: add a focused valid, invalid, and unsupported fixture when
expanding this table.

The type boundary checks TypeScript and both Svelte script contexts. JavaScript
is parsed but does not receive TypeScript `checkJs` guarantees. Type assertions
can intentionally escape checking; focused fixtures demonstrate this limitation.
Meta-level and per-story args must resolve to object keys; the checker follows
named local imports of statically declared object constants across supported
JavaScript and TypeScript module variants but rejects arbitrary runtime
expressions. Prop discovery follows local and imported composition types,
including snippet members, explicit-prop projections, and supported native
`Omit` surfaces.
Static validation cannot prove arbitrary runtime values, dynamic asset paths,
native rest-attribute universes, or browser safety for unknown packages, so it
uses narrow source directives or registry approvals with stale-target checks.
With the installed `@storybook/addon-svelte-csf` 5.1.2, an `id` passed to
`defineMeta` is accepted but is not propagated into the generated index. The
captured compatibility fixture records that behavior; source prediction and
same-build index comparison deliberately fail if an explicit metadata ID is
introduced without matching generated behavior.
Generated `storybook-static/index.json` is build evidence and must not be
checked in or edited by hand.

The public commands use exit status `0` for a passed contract, `1` for reported
validation/build/test failures, and `2` for invalid invocation or an internal or
command-execution failure. Diagnostics are one-line, stable-code messages in the
form `ERROR SB_* path:line:column message`; parse, missing-path, unsupported
syntax/version, and stale-approval failures must remain diagnostics rather than
uncaught exceptions.

Deployment continues to build Storybook with the site and copy it under
`dist/storybook`. Phase 1 does not insert quality validation into that chain, so
an existing Storybook-build failure can still block site publication.

## Exceptions and upgrades

The [registry](../.storybook/inventory.json) contains only non-derivable
exceptions, judgment-based approvals, and protected IDs. Ordinary story
additions do not require a registry edit. Remove entries when their target
disappears or the normal rule becomes sufficient. The
[registry guide](./storybook-component-inventory.md) defines the closed schema
and maintenance workflow.

Storybook major upgrades, renderer or CSF changes, and generated-index format
changes require target-version migration review in an isolated checkout. Inspect
the migration changes, revalidate why `docgen: false` is required, run the checks
available at that time, and manually verify viewports, Docs, themes, and protected
links before landing the upgrade.
