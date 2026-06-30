---
name: plan-reviewer
description: Review Invisible Sloth website implementation plans before coding. Use when asked to critique, validate, or approve a plan for this Astro/Svelte/Tailwind static site, including pages, components, Storybook stories, design tokens, prose/rich-text rendering, content collections, legal Markdown, assets, navigation, product routes, or validation strategy; produce concrete risks, required edits, and a GO / GO WITH CHANGES / NO-GO decision without making code or file changes.
---

# Plan Reviewer

## Goal

Review plans for the Invisible Sloth website with enough rigor to catch scope,
architecture, design-system, content, asset, accessibility, and validation risks
before implementation starts.

Give feedback only. Do not edit code, docs, assets, or files unless the user
explicitly asks for changes after the review.

## Context to Load

Read these repo files before reviewing unless already in context:

- `package.json` for supported commands and framework versions.
- `src/components/README.md` for component boundaries, escape hatches, and
  validation policy when a plan touches components.
- `src/content.config.ts` and `src/content/projects/` when a plan touches
  project teasers or content collections.
- `src/styles/global.css`, `src/styles/layout.css`, `src/styles/typography.css`,
  `src/styles/rich-text.css`, and `src/styles/tokens/` when a plan touches
  layout, prose, typography, theme, or Tailwind utilities.
- Relevant `src/pages/`, `src/layouts/`, `src/components/`, `src/stories/`,
  `src/lib/`, asset, icon, and logo files named or implied by the plan.

Use the repository instructions in `AGENTS.md` or the current thread when
available. Do not require a separate product spec or formal plan artifact.

## Inputs

Collect from the prompt or nearby files:

- The plan text or plan file path.
- The intended page, product route, component, content type, asset pipeline, or
  validation surface.
- Any constraints around scope, design direction, compatibility, accessibility,
  Storybook coverage, or rollout.

If information is missing, state assumptions and review the plan anyway unless
the plan is too ambiguous to evaluate.

## Plan Classification

Classify every plan before scoring:

- `A) website slice plan`: Maps clearly to a user-visible page, product route,
  design-system slice, content workflow, asset workflow, or validation upgrade.
- `B) lightweight task plan`: Has a clear outcome and actionable tasks but is
  smaller than a full website slice.
- `C) insufficient`: Lacks a clear outcome, lacks actionable tasks, contradicts
  repo direction, or proposes unsafe or unmaintainable behavior.

Decision lock: `C` always returns `NO-GO`.

## Gate Set

Evaluate every gate. Use only these statuses: `Pass`, `Pass with changes`,
`Fail`, or `N/A`. For `N/A`, give a one-sentence reason. Prefer `N/A` over
`Fail` when a gate truly does not apply to a small task plan.

1. Site Scope and User Experience Fit
2. Astro Route, Layout, and Hydration Boundaries
3. Component Contract and Storybook Coverage
4. Svelte 5 and TypeScript Correctness
5. Styling, Tokens, and Section Rhythm
6. Content Collections, Markdown, and Prose Ownership
7. Assets, Logos, Icons, and Image Delivery
8. Accessibility, Semantics, and Interaction States
9. Validation and Regression Coverage
10. Blast Radius, Sequencing, and Maintainability

## Gate Guidance

Apply these checks when scoring gates:

1. Site Scope and User Experience Fit
- Supports a focused static website for Invisible Sloth products, projects,
  legal pages, and brand presentation.
- Avoids landing-page fluff when the request is for a concrete page, app-like
  surface, component, or workflow.
- Keeps product and object identity visible in first-viewport work and avoids
  generic, decorative, or stock-like imagery where real product inspection
  matters.

2. Astro Route, Layout, and Hydration Boundaries
- Keeps pages responsible for metadata, rails, anchors, section rhythm,
  product-route composition, and hydration choices.
- Uses `Container.astro`, `SiteChrome.astro`, `BaseLayout.astro`, and layout
  utilities consistently instead of duplicating page shell behavior.
- Hydrates Svelte islands only when interactivity requires it.

3. Component Contract and Storybook Coverage
- Respects `src/components/README.md` extension-surface tiers: strict controls,
  narrow controls, root hooks, native-ish primitives, and data compositions.
- Keeps public components in `src/components/`, private pieces in
  `src/components/internal/`, and exports public `ComponentNameProps` only when
  intentional.
- Adds or updates Svelte CSF stories with `tags: ['autodocs']`, curated
  controls, fallback-state stories for recoverable validation, and stable story
  titles unless taxonomy changes are deliberate.

4. Svelte 5 and TypeScript Correctness
- Uses Svelte 5 runes where appropriate without enabling global runes mode.
- Keeps TypeScript strict and avoids broad `any`, unsafe prop widening, or
  untyped rest forwarding.
- Uses `requireNonEmptyString`, `normalizeOptionProp`, and `warnOnce` patterns
  for runtime validation instead of ad hoc console output or inconsistent
  fallbacks.

5. Styling, Tokens, and Section Rhythm
- Uses Tailwind v4 through CSS `@theme` blocks under `src/styles/tokens/`;
  never proposes Tailwind v3 `theme.extend`.
- Prefers shared layout, typography, prose, and scoped component CSS over
  repeated inline utility chains.
- Preserves rails, gutters, measures, grid behavior, responsive constraints,
  and text fitting across 430, 744, 1024, and 1512px viewports.

6. Content Collections, Markdown, and Prose Ownership
- Queries content collections from Astro pages or server-only `src/lib`
  adapters, not Svelte components or Storybook.
- Uses `LegalDocumentLayout.astro` for legal Markdown and keeps
  `RichTextBlock` prose ownership centralized.
- Accounts for `check:rich-text` when prose, links, Markdown, or rich-text CSS
  behavior changes.

7. Assets, Logos, Icons, and Image Delivery
- Places raster product/page assets in `public/assets/` and source/reference
  images in `support/images/`.
- Commits optimized SVGs from `src/icons/optimized` and `src/logos/optimized`
  when raw icons or logos change, and uses `Logo`, `LogoLink`, or icon
  components instead of ad hoc mark rendering.
- Provides responsive first-viewport images with `srcset`, `sizes`,
  dimensions, alt text, loading, and fetch-priority metadata when applicable.

8. Accessibility, Semantics, and Interaction States
- Preserves semantic headings, landmarks, link/button behavior, focus states,
  keyboard interaction, disabled states, and accessible names.
- Covers empty, loading, invalid, fallback, reduced-motion, and failure states
  when the touched surface can produce them.
- Avoids decorative UI or overlapping text that degrades scanning or repeated
  use.

9. Validation and Regression Coverage
- Includes `npm run astro check` and `npm run build` before shipping code
  changes.
- Adds `npm run build-storybook` for component, Storybook, design-token, or
  component-doc changes.
- Adds `npm run check:rich-text` for `RichTextBlock`, prose CSS, links CSS,
  Markdown, or prose-rendering changes.

10. Blast Radius, Sequencing, and Maintainability
- Keeps edits scoped to the plan's target and follows existing patterns before
  adding new abstractions.
- Sequences dependencies correctly: tokens before utilities, utilities before
  components, components before pages/stories, assets before first-viewport use.
- Identifies migration or compatibility work for public component APIs, content
  schema changes, navigation changes, and asset path changes.

## High-Risk Rubric

Treat any of these as high risk:

- Introduces hosted app, auth, billing, analytics, CMS, or service assumptions
  without an explicit user request.
- Moves page-level rails, anchors, metadata, or section rhythm into reusable
  components without a clear component contract.
- Uses broad prop/event/class forwarding on new interactive components without
  justification from `src/components/README.md`.
- Bypasses content collections by fetching project teasers in Svelte or
  Storybook.
- Duplicates or fragments `RichTextBlock` prose ownership.
- Proposes Tailwind v3 config patterns or hardcoded token duplication instead
  of CSS `@theme` tokens and shared utilities.
- Adds first-viewport product imagery without responsive variants, dimensions,
  useful alt text, or loading/fetch-priority decisions.
- Changes public component APIs, content schemas, routes, navigation, legal
  Markdown rendering, or asset paths without compatibility and regression
  coverage.
- Omits `astro check` or `build` for code changes, or omits Storybook/rich-text
  validation for surfaces that require them.
- Classification is `C`.

Decision rules:

- Any unresolved high risk => `NO-GO`.
- No unresolved high risk but unresolved material medium-risk gaps =>
  `GO WITH CHANGES`.
- `GO` only when no unresolved high-risk or material medium-risk gaps remain.

## Output Order

Use this exact order:

1. `Top Risks`
2. `Specific Plan Edits`
3. `Missing Information / Open Questions`
4. `Plan Classification`
5. `Gate Results`
6. `Decision Rationale`
7. `Decision`

## Output Requirements

`Top Risks`:

- Order by severity.
- Explain impact and why each risk matters.
- Say `None` only when the plan has no material risks.

`Specific Plan Edits`:

- Provide concrete edits mapped to the top risks.
- Prefer wording the user can paste into the plan.

`Missing Information / Open Questions`:

- Include only questions that would change implementation or risk.
- Do not ask for formal specs unless the plan genuinely needs a durable
  artifact.

`Gate Results`:

- Include all 10 gates.
- For each gate, report status and a short reason.

`Decision`:

- Emit only one of: `GO`, `GO WITH CHANGES`, or `NO-GO`.

## Review Constraints

- Keep feedback concrete and actionable.
- Reference plan sections, tasks, or repo files when possible.
- Prioritize the highest-risk issues over checklist completeness.
- Do not produce code or file changes as part of this skill.
