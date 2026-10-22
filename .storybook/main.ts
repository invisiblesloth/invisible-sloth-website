import type { StorybookConfig } from '@storybook/svelte-vite';

const config: StorybookConfig = {
  "stories": [
    "../src/stories/**/*.stories.svelte"
  ],
  "addons": [
    "@storybook/addon-svelte-csf",
    "@storybook/addon-docs",
    "@storybook/addon-a11y"
  ],
  "framework": {
    "name": "@storybook/svelte-vite",
    "options": {
      // Svelte CSF stories are not ordinary components. Keep docgen disabled so
      // Storybook does not parse them as such; see .storybook/README.md.
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
