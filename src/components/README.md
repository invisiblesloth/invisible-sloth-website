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
