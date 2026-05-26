# Header Internals

These Svelte files are private implementation details for `PageHeader.svelte`
and `PostHeader.svelte`.

Outside this directory, compose full headers through `PageHeader.svelte` or
`PostHeader.svelte`. Use `DetailHeader.svelte` directly only for the public
title/excerpt block. Do not import the root, rail, media, or tag pieces from
pages, stories, or unrelated components.
