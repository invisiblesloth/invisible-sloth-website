# Storybook contributor guide

Use Storybook to document and review component contracts. [Component policies](../src/components/README.md) govern component boundaries, extension surfaces, styling ownership, and fallback behavior. This guide covers story authoring, validation, and maintenance of the [exception registry](./inventory.json).

## Authoring stories

- Put Svelte CSF stories in `src/stories/**/*.stories.svelte`, use `defineMeta` from `@storybook/addon-svelte-csf`, and include `tags: ['autodocs']`. Helpers may live beside stories without the `.stories.svelte` suffix.
- Every top-level `src/components/*.svelte` component needs coverage through `defineMeta({ component })` or an explicit multi-component registry exception. Incidental imports do not establish coverage. Private components, story helpers, icons, Astro components, pages, layouts, and content/server adapters are outside direct eligibility.
- Use the existing `Brand → Foundations → Atoms → Molecules → Organisms → Templates` ordering. Preserve existing titles, names, effective export names, and generated story/Docs IDs unless deliberately migrating them. `Brand/Logo` covers both `Logo` and `LogoLink`; `ProjectListSurface` is the primary component of `Organisms/ProjectList`.
- Keep `docgen: false` in [main.ts](./main.ts): Svelte CSF stories are not ordinary components for renderer docgen. Maintain descriptions and `argTypes` by hand, including supported inputs, documented rejections, and intentional story-only args. Curate controls for useful interaction.
- Document every explicit non-snippet prop in `argTypes`. An intentional omission needs `// storybook-check: omit-argtype <prop> -- <reason>` in the story's module script. Snippet props may be omitted. Explain intentional extra args narrowly; documentation does not require a control for every input.
- Native/rest attributes are not exhaustively documented. Native attributes actually used in meta/story args need `argTypes` entries categorized as `Forwarded native attribute`, backed by the component's real forwarding contract. Keep meta-level and story-level `controls.include` entries valid.
- Demonstrate supported malformed-runtime and fallback states with assertions limited to the malformed fixture values. Do not add stories that intentionally throw or use blanket type suppression.

## Fixtures and styling

Use deterministic local fixtures, shared global styles, and design tokens. Story wrappers supply only the context needed by the component contract; follow component ownership for rails, placement, section rhythm, and extension hooks.

Do not import pages, layouts, content collections, server/content adapters, or live network data into stories. Inert external link destinations are allowed. Live network APIs are prohibited, including indirect calls that static checking cannot detect. The checked browser graph starts at stories and [preview.ts](./preview.ts) and follows runtime imports and re-exports. Bare runtime packages other than `svelte` and `@storybook/addon-svelte-csf` need a scoped `browser-safe-import` registry approval.

Media fixtures must be local. Root-relative media paths, `srcset`, and static CSS/inline-style `url(...)` values must resolve under `public/`; remote media fixtures are prohibited. For a deliberately absent literal, put `storybook-check: allow-missing-asset -- <reason>` in a comment immediately above that occurrence. The directive becomes stale when the literal resolves or moves. Runtime-computed paths need an exact field- or binding-specific `dynamic-asset` approval. Dynamic public-component inputs are checked through story args; unresolved story-helper bindings need their own approval.

## Review and validation

Review changed layout-sensitive behavior at the relevant named viewports: Compact (430 × 932), Medium (744 × 1133), Extended (1024 × 1366), and Large (1512 × 982). Large is the initial selection with rotation off. Check relevant semantics, accessible names, keyboard/focus behavior, system/light/dark themes, and reduced motion. Record material findings with the change.

Run commands from the repository root:

| Command | Purpose |
|---|---|
| `npm run storybook` | Open the development environment on port 6006 |
| `npm run check:storybook` | Check source/configuration contracts and run focused Svelte type checking |
| `npm run test:storybook-checks` | Run isolated validator and type fixtures |
| `npm run build-storybook` | Build static Storybook; required for Storybook/component-doc changes |
| `npm run verify:storybook` | Run source/type checks and fixtures, build once in a temporary directory, and validate that build's index |

Follow [component validation requirements](../src/components/README.md) for component changes, including Astro/site checks and rich-text checks where applicable. Storybook quality verification is separate from deployment; deployment builds Storybook with the site and copies it under `dist/storybook`.

The [source checker](../scripts/storybook-checks/source-checks.mjs) is deliberately bounded. Use statically resolvable metadata, args, controls, and top-level immutable constants. Dynamic keys/spreads, unresolved or mutable bindings, and unsupported prop-type syntax produce diagnostics, even when some members can be recovered. Prop discovery expects typed, destructured `$props()` tied to an exported module props type; supported composition includes local/imported types, unions/intersections, snippets, explicit-prop projections, and supported native `Omit` surfaces. Mapped/conditional types, non-literal projection keys, and `Pick` over native attribute universes are unsupported. The [source model](../scripts/storybook-checks/source-model.mjs), [static resolver](../scripts/storybook-checks/static-value.mjs), and their adjacent tests define the supported syntax. Add valid, invalid, and unsupported fixtures when extending it.

Type checking covers TypeScript and both Svelte script contexts; JavaScript is parsed without `checkJs` guarantees. Assertions can escape checking. Static checks do not prove arbitrary runtime values, dynamic assets, native attribute universes, or all indirect network calls. Keep manual review and narrow exceptions where required.

Diagnostics use stable `SB_*` codes and source locations. Public validation commands exit with `0` on success, `1` for validation/build/test failures, and `2` for invalid invocation or internal/command-execution failures. Never edit or commit generated `storybook-static/index.json`.

## Registry maintenance

[inventory.json](./inventory.json) holds only non-derivable exceptions, judgment approvals, and protected IDs. Ordinary story additions need no registry edit unless one of those changes. Keep rationale next to its source when sufficient; do not add catalog counts, complete component lists, or derived import/asset inventories.

Schema version 1 requires exactly `schemaVersion`, `exceptions`, `judgmentApprovals`, and `protectedIds`. Unknown fields are invalid, strings must be non-empty, entry IDs must be unique, and source/component/reference paths must resolve to tracked files using repository-relative POSIX paths. The [registry validator](../scripts/storybook-checks/registry.mjs) defines the complete schema and target checks.

| Array | Entry fields and allowed values |
|---|---|
| `exceptions` | `id`, `rule`, `storyTitle`, `source`, `reason`, `reviewTrigger`; `component-coverage` also requires a non-empty `components` array, while `primary-component-metadata` omits it |
| `judgmentApprovals` | `id`, `kind`, `target`, `scope`, `reason`, `reviewTrigger`; kinds are `browser-safe-import`, `dynamic-asset`, or `typing-limitation` |
| `protectedIds` | `id`, `reason`, `reference`; `id` is the exact, case-sensitive generated story/Docs ID |

Multi-component exceptions require eligible components directly imported at runtime by that story; those components become its prop-documentation subjects. Approvals must match the exact source and target consumed by a rule. A browser-safe approval names a bare runtime specifier, a dynamic-asset approval names the unresolved field/binding, and a typing approval names a live double-asserted binding used in args or a rendered component input. Textual mentions do not keep approvals live.

Update stories and fixtures first, then adjust only affected registry entries. Remove obsolete entries when targets disappear or normal rules suffice. Changing schema shapes or adding rules/kinds requires a schema-version bump and corresponding validator, test, and guide updates. Run `check:storybook` for source/type validation and `verify:storybook` to validate the registry against a fresh generated index as well.

Add protected IDs for tracked references, external integrations, or deliberately published permalinks, and verify that generated IDs remain resolvable. The registry does not provide redirects. Do not assume `defineMeta({ id })` preserves URLs: the captured CSF 5.1.2 compatibility fixture shows that metadata IDs are accepted without propagating into the generated index. Verify actual generated behavior and effective `exportName` values.

For Storybook majors, renderer/CSF changes, or index-format changes, review migration guidance in an isolated checkout, recheck the need for `docgen: false`, run verification, and manually review viewports, Docs, themes, and protected links.
