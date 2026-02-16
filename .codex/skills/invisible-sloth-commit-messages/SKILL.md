---
name: invisible-sloth-commit-messages
description: Write concise, project-specific git commit messages for the invisible-sloth-website repository using a conventional type(scope) format with optional body text. Use this skill when drafting, rewriting, or polishing commit messages for code, content, styling, config, Storybook, or asset changes in this project.
---

# Invisible Sloth Commit Messages

Produce technically accurate commit messages with minimal token usage.
Prefer the shortest format that still communicates intent.

## Output Modes

Use one of these formats:

1) Standard (default)

type(scope): Short imperative summary

Blank line.

One short paragraph explaining why and impact.

2) One-line (tiny changes only)

type(scope): Short imperative summary

Use one-line mode when change is truly small and low risk (for example,
typo fixes, tiny docs updates, or trivial housekeeping), or when the user
explicitly asks for one line.

## Type Rules

- feat: new user-facing behavior
- fix: bug fix or regression fix
- perf: measurable performance improvement
- refactor: structural/internal change without behavior change
- docs: documentation-only change
- chore: tooling, build, config, dependency, or housekeeping change

Pick the single primary impact.

## Scope Rules

Scope is optional. Use it when it improves clarity.

Prefer these scopes:
- pages: Astro routes in `src/pages/`
- components: Svelte/Astro UI components in `src/components/`
- layouts: shared page shells in `src/layouts/`
- styles: global/layout/utility CSS in `src/styles/`
- tokens: design tokens in `src/styles/tokens/`
- storybook: stories or `.storybook/` configuration
- icons: icon sources/optimized outputs in `src/icons/`
- logos: logo sources/optimized/public outputs
- build: Astro/Vite/Tailwind/TypeScript/tooling config

If multiple areas changed, pick the most user-relevant area. If unclear,
omit scope instead of guessing.

## Subject Rules

- Imperative mood
- Capitalize the first word in the summary
- Specific and concrete
- No trailing period
- Prefer <= 50 chars, keep <= 72 chars hard max

## Body Rules (Standard Mode)

- Explain why the change exists and expected impact
- Keep to one compact paragraph
- Avoid implementation trivia
- Do not use bullet points
- Do not use backticks

## Validation Notes

- Do not include a `Tests:` block for this project
- Mention manual QA only when the user provides concrete QA details
- Do not invent validation steps

## Missing Context Behavior

If context is insufficient, ask only the minimum needed.
Ask at most two short questions in this order:
1. What changed?
2. Why was this needed?

Accept rough user input and rewrite it into polished commit language.

## Output Contract

- Return only a single markdown code block containing the commit message
- Do not add commentary outside the code block unless user asks
- Keep all lines <= 72 characters
- Do not invent facts
