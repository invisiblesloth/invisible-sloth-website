import type { StorybookConfig } from '@storybook/svelte-vite';

const config: StorybookConfig = {
  stories: ['../*.fixture.svelte'],
  addons: ['@storybook/addon-svelte-csf', '@storybook/addon-docs'],
  framework: { name: '@storybook/svelte-vite', options: { docgen: false } },
  async viteFinal(config) {
    const { svelte } = await import('@sveltejs/vite-plugin-svelte');
    const plugins = svelte({ configFile: false, compilerOptions: {} });
    config.plugins ??= [];
    config.plugins.unshift(...(Array.isArray(plugins) ? plugins : [plugins]));
    return config;
  },
};

export default config;
