import type { StorybookConfig } from '@storybook/svelte-vite';

const config: StorybookConfig = {
  "stories": [
    "../src/**/*.mdx",
    "../src/**/*.stories.@(js|ts|svelte)"
  ],
  "addons": [
    "@storybook/addon-svelte-csf",
    "@chromatic-com/storybook",
    "@storybook/addon-docs",
    "@storybook/addon-a11y"
  ],
  "framework": {
    "name": "@storybook/svelte-vite",
    "options": {}
  },
  async viteFinal(config) {
    const { svelte } = await import('@sveltejs/vite-plugin-svelte');
    const { default: tailwindcss } = await import('@tailwindcss/vite');

    config.plugins = config.plugins || [];

    // Add Svelte plugin - required for Astro projects
    config.plugins.push(
      svelte({
        // Don't use svelte.config.js which has runes: true
        // This allows addon-svelte-csf's legacy components to work
        configFile: false,
        // Let Svelte auto-detect runes per file based on syntax
        compilerOptions: {}
      })
    );

    // Add Tailwind CSS plugin
    config.plugins.push(tailwindcss());

    return config;
  }
};
export default config;