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

## Fixtures, imports, and styling

Use deterministic local fixtures and browser-safe helpers. Keep supported
malformed-runtime and fallback examples visible, using assertions only around
the intentionally invalid fixture value. Do not add stories that intentionally
throw.

Do not import pages, layouts, content collections, server-only modules, content
adapters, or live network data into stories. Inert external link destinations
are allowed. Root-relative asset and `srcset` literals must resolve under
`public/` when they can be checked statically. Ask for a narrow judgment approval
only when browser safety or asset resolution cannot be established mechanically.

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

Until Phase 1 lands, use only the commands that exist:

- `npm run check`
- `npm run build`
- `npm run build-storybook`

Do not claim planned Storybook validation commands exist. Generated
`storybook-static/index.json` is build evidence and must not be checked in or
edited by hand.

Deployment continues to build Storybook with the site and copy it under
`dist/storybook`. Phase 0 does not separate publication, so an existing
Storybook-build failure can still block site publication.

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
