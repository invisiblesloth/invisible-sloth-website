# Invisible Sloth

The official website for Invisible Sloth, showcasing our projects across games, apps, and creative tools.

## Tech Stack

- **[Astro 7](https://astro.build)** - Static site generation with island architecture
- **[Svelte 5](https://svelte.dev)** - Interactive UI components with runes syntax
- **[Tailwind CSS 4](https://tailwindcss.com)** - Utility-first styling with CSS-native configuration
- **[Storybook 10](https://storybook.js.org)** - Component development and documentation
- **Node.js 22 and npm 10** - Local and CI runtime and package manager

Version constraints and the package-manager declaration are in [package.json](./package.json), resolved dependencies in [package-lock.json](./package-lock.json), and the runtime pin in [.nvmrc](./.nvmrc).

## Project Structure

```
invisible-sloth-website/
├── src/
│   ├── pages/              # Astro pages (file-based routing)
│   ├── components/         # Reusable Svelte components
│   ├── content/            # Content collections (projects)
│   ├── layouts/            # Page layouts
│   ├── styles/             # Global styles and design tokens
│   └── stories/            # Storybook stories
├── public/                 # Static assets
├── .storybook/             # Storybook configuration
└── dist/                   # Build output
```

## Development

All commands are run from the project root:

### Primary Development

| Command | Action |
| :--- | :--- |
| `npm install` | Install dependencies |
| `npm run dev` | Start Astro dev server at `localhost:4321` |
| `npm run build` | Build production site to `./dist/` |
| `npm run preview` | Preview production build locally |

### Component Development

| Command | Action |
| :--- | :--- |
| `npm run storybook` | Start Storybook dev server at `localhost:6006` |
| `npm run build-storybook` | Build static Storybook for deployment |
| `npm run check:storybook` | Validate Storybook source/configuration and run focused Svelte type checking |
| `npm run test:storybook-checks` | Run focused Node tests for Storybook validators and type fixtures |
| `npm run verify:storybook` | Run both validation gates, build Storybook once, and validate that build's generated index |

Current component guidance lives in [component policies](./src/components/README.md), and Storybook contributors should follow the [Storybook contributor standard](./docs/storybook-standard.md). The [guidelines roadmap](./docs/storybook-guidelines-plan.md), [alignment record](./docs/storybook-alignment-plan.md), and [exception registry guide](./docs/storybook-component-inventory.md) describe rollout sequencing, evidence, and registry maintenance.

### Utilities

| Command | Action |
| :--- | :--- |
| `npm run astro ...` | Run Astro CLI commands |
| `npm run check` | Run Astro checks; Storybook validation remains separate |
| `npm run check:legal` | Check legal-page structure and built metadata |
| `npm run tokens:reconcile -- <export.json>` | Reconcile a Figma token export |
| `npm run tokens:check -- <export.json>` | Check generated color tokens against an export |
| `npm run test:tokens` | Test token reconciliation safeguards |
| `npm run icons:optimize` | Optimize icon SVGs |
| `npm run logos:build` | Optimize and deploy logo SVGs |

The [design token reconciliation guide](./src/styles/tokens/README.md) documents
the Figma export workflow, collection ownership, Display P3 handling, and the
tracked record of the most recently reconciled export.

## Deployment

The site is deployed to GitHub Pages:

- **Main Site**: [invisiblesloth.com](https://invisiblesloth.com) *(coming soon)*
- **Storybook**: Component documentation and design system, built and published under `/storybook/` with the site

## Licensing

This repository is public for website development and deployment, but it is not open source.

- Original source code is governed by [LICENSE](./LICENSE).
- Website text, images, logos, brand assets, and original design materials are governed by the [Invisible Sloth Website Terms of Use](https://invisiblesloth.com/terms/).
- Third-party materials remain subject to their own licenses and terms.
