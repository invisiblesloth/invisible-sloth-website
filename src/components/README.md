# Component Policies

## Escape Hatch Policy

Component escape hatches are tiered by job. Do not normalize every component
toward the same forwarding model; document the tier and keep the public contract
intentional.

### Strict Controls

Strict controls allow only an explicit set of safe/native attributes through
rest forwarding. They do not forward `class`, `style`, ARIA naming overrides, or
activation-adjacent rest-event handlers. Activation-adjacent events means click,
touch, and key activation handlers; non-activation focus and hover events may be
allowlisted when the component can forward them without giving up ownership of
interaction.

`Button` is the canonical strict control. It owns its visual variants,
accessibility naming, link/button mode, disabled behavior, and activation
handler contract. Click activation is exposed through the explicit `onclick`
prop, not rest forwarding.

### Narrow Interactive Controls

Narrow interactive controls expose typed props plus limited root hooks where
already supported. Accessibility naming and interaction remain component-owned.
`LogoLink` fits this tier.

### Root-Hook Components

Root-hook components expose root `class` for layout hooks, global utilities, and
global selectors. The component's base class remains on the root, and the caller
class is appended for hooks/layout selectors; this does not promise cascade or
override power. These components should not broadly forward arbitrary attributes
unless that behavior is already public.

This pass adds root `class` only to `ContactUs`, `ProjectCard`,
`StandardCard`, and `BadgeGroup`. `ContentSection`, `TextBlock`, `FeatureList`,
`TagGroup`, `DetailHeader`, and `ProductSupport` already forward root
attributes and keep that broader public contract.

### Native-ish Primitives

Native-ish primitives mostly wrap one semantic element and may forward their
typed/native root attributes when that makes the primitive easier to compose.
`Heading` fits this tier. `Divider` is class-hook friendly, but it is not a full
native-attribute forwarder because it switches rendered element by orientation.

### Data Compositions

Data compositions prefer typed data props, callbacks, snippets, and controlled
extension points over arbitrary flexibility. `TagLinkGroup` passes `class` and
rest props through to its internal `TagGroup`, and renders no DOM when there are
no valid tags.

### Grandfathered Broad Interactive Primitive

`Tag` keeps its existing broad forwarding contract for compatibility: root
`class`, `style`, safe global/native attributes, ARIA/data attributes, and broad
`on*` events may forward while it switches between `<a>` and `<button>`. New
interactive primitives should not copy this model by default.

`Badge`, `Logo`, and internal header pieces stay narrow unless a concrete public
need appears.

# Component Validation Policy

Component runtime validation follows one policy so required content, fallbacks,
and warnings stay predictable across Astro builds, Storybook, and hydrated UI.

## Required Primary Content

Throw for required props that are necessary for the component's primary semantic
output and have no component-owned fallback. Use `requireNonEmptyString` from
`src/lib/componentValidation.ts` for required string props so blank or
non-string runtime values fail with the canonical message. Pass plain labels
such as `componentName: 'DetailHeader'` and `propName: 'title'`; the helper owns
the brackets and backticks.

These failures are environment-neutral. They can happen during SSR, static
builds, Storybook render, or client hydration if invalid required content enters
the tree.

Not every visible text prop is required primary content. Props with documented
component-owned defaults or fallbacks, such as `Badge.label`, `Tag.label`, and
`Button.label`, should keep their fallback behavior instead of failing fast.

## Recoverable Runtime Values

Use `warnOnce` from `src/lib/devWarnings.ts` when a malformed value can recover
through an intentional fallback, skipped optional subcontent, or ignored
unsupported prop. `warnOnce` is dev-only and browser-only, so these warnings do
not appear during SSR or production builds.

Do not write directly to the console from components or component-facing helpers
in `src/lib`; keep warning output centralized through `warnOnce`.

## Optional Content

Silently omit genuinely optional absent content. Warn only when an input was
present but malformed and the omission or fallback would surprise a caller.

Storybook should not add stories that intentionally throw. Required prop
controls stay editable for documentation value, so blanking a required control
may exercise the fail-fast path and break that story canvas.
