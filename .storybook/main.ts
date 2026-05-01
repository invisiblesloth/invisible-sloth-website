import type { StorybookConfig } from '@storybook/svelte-vite';

const config: StorybookConfig = {
  "stories": [
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
    "options": {
      // Avoid Storybook docgen parsing Svelte CSF stories as plain Svelte components.
      docgen: false
    }
  },
  async viteFinal(config) {
    const { svelte } = await import('@sveltejs/vite-plugin-svelte');
    const { default: tailwindcss } = await import('@tailwindcss/vite');

    config.plugins = config.plugins || [];

    const sveltePlugins = svelte({
      // Use local Storybook preprocessing so addon-svelte-csf can compile its stories.
      configFile: false,
      // Let Svelte auto-detect runes per file based on syntax
      compilerOptions: {}
    });

    // Svelte must run before addon-svelte-csf's post-compile transform.
    config.plugins.unshift(...(Array.isArray(sveltePlugins) ? sveltePlugins : [sveltePlugins]));

    // Add Tailwind CSS plugin
    config.plugins.push(tailwindcss());

    return config;
  }
};
export default config;
