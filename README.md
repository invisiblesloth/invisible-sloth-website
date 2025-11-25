# Invisible Sloth

The official website for Invisible Sloth, showcasing our projects across games, apps, and creative tools.

## Tech Stack

- **[Astro 5.15.8](https://astro.build)** - Static site generation with island architecture
- **[Svelte 5.41.3](https://svelte.dev)** - Interactive UI components with runes syntax
- **[Tailwind CSS v4](https://tailwindcss.com)** - Utility-first styling with CSS-native configuration
- **[Storybook 10.0.2](https://storybook.js.org)** - Component development and documentation

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

### Utilities

| Command | Action |
| :--- | :--- |
| `npm run astro ...` | Run Astro CLI commands |
| `npm run astro check` | Type-check the project |
| `npm run icons:optimize` | Optimize icon SVGs |
| `npm run logos:build` | Optimize and deploy logo SVGs |

## Deployment

The site is deployed to GitHub Pages:

- **Main Site**: [invisiblesloth.com](https://invisiblesloth.com) *(coming soon)*
- **Storybook**: Component documentation and design system *(coming soon)*

## License

All rights reserved. This project is not open source.
See the full license here: [LICENSE](./LICENSE)
