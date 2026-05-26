# Internal Components

Components in this directory are private implementation pieces for public
components in `src/components/`. They can change shape as their owning public
components evolve, and pages, stories, or unrelated public components should not
import them directly.

When a public component needs multiple private pieces, group those pieces under
an owning feature directory such as `header/`. Keep public component APIs in
`src/components/`.

## `header/`

The `header/` subdirectory is owned by `PageHeader.svelte` and
`PostHeader.svelte`.

The dependency direction is one-way: public header wrappers may import from
the private header subdirectory, but consumers should compose headers through
`PageHeader.svelte` or `PostHeader.svelte` instead of the internal rail, root,
media, or tag pieces. Use `DetailHeader.svelte` directly only when the public
title/excerpt block is needed outside a full header composition.
