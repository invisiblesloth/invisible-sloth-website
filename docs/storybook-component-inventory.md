# Storybook Component Inventory

Status: planning documentation. The canonical inventory will be added during Phase 0.

## Purpose

The inventory records the intended Storybook catalog and the exceptions that cannot be inferred safely from generated output. It is a reviewable contract between the Atomic taxonomy, Svelte CSF stories, and the automated catalog checks.

The machine-readable source will be:

```text
.storybook/inventory.json
```

This Markdown document explains how to maintain that file. It must not become a second manually maintained catalog or repeat all family and story facts.

## Planned inventory responsibilities

The JSON inventory will record:

- Schema version.
- Ordered Atomic categories.
- Story family titles and file paths.
- Primary component or composition subjects.
- `defaultStoryMode` and story-level `storyModeOverrides` keyed by effective Svelte CSF `exportName`.
- Default visibility and approved visibility exceptions.
- Expected family story counts as drift sentinels.
- Extension tiers, including `not-documented` where no tier is assigned in `src/components/README.md`.
- Approved control surfaces and control exceptions.
- Browser-safe `src/lib` imports.
- Asset and fixture exceptions.
- Typing, visibility, and exclusion exceptions with reasons.
- Explicitly protected Storybook IDs.

## Classification model

Each family receives a default mode. Only stories that differ from that default need an override. The checker computes the effective mode for every generated story and fails when an override refers to a missing or obsolete `exportName`.

Allowed modes are:

- `contract`
- `overview`
- `playground`
- `composition`
- `foundation`
- `diagnostic`

Fallback and malformed-input behavior that is part of the public contract stays visible. True hidden machine-only fixtures are deferred until a test runner consumes them.

## ID policy

`protectedIds` starts empty. Add an ID only when a Storybook story or Docs entry is referenced by tracked documentation, an external integration, or a deliberately published permalink.

A protected story must remain resolvable in the generated `storybook-static/index.json`. Preserve its meta component segment with a compatible meta `id` and preserve its story segment by retaining the Svelte CSF `exportName`.

The inventory does not provide redirects. Do not add an `idMigrations` field unless a future Storybook compatibility mechanism makes it meaningful.

## Extension tiers and imports

Do not infer extension tiers from filenames or markup. When a component is not assigned a tier in `src/components/README.md`, use `not-documented` and record the approved control surface directly.

Stories may import public components, approved icons and logos, deterministic fixtures, and explicitly allowlisted browser-safe `src/lib` helpers. Stories must not import pages, layouts, content collections, server-only adapters, or live network data. Inert external link destinations are allowed; runtime network calls are not.

Root-relative asset literals and `srcset` candidates should resolve under `public/` unless an explicit inventory exception explains why they cannot be checked statically.

## Maintenance workflow

Update the inventory when a story family is added, removed, renamed, recategorized, or given a new control, asset, import, typing, visibility, or ID exception.

Do not update generated `storybook-static/index.json` by hand. Run the Storybook build and inventory checker instead.
