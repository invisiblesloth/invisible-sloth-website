// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

import svelte from '@astrojs/svelte';

/**
 * @param {string} id - The module ID
 * @returns {boolean}
 */
const shouldSkipSvelteVirtualCss = (id) =>
  id.includes('.svelte') && id.includes('&type=style') && id.includes('&lang.css');

const tailwindPlugins = tailwindcss().map((plugin) => {
  if (!plugin.transform) return plugin;

  const originalTransform = plugin.transform;

  return {
    ...plugin,
    /**
     * @param {string} code
     * @param {string} id
     * @param {any[]} args
     */
    async transform(code, id, ...args) {
      if (shouldSkipSvelteVirtualCss(id)) {
        return code;
      }

      // @ts-ignore - Vite plugin transform hook typing complexity
      return originalTransform.call(this, code, id, ...args);
    },
  };
});

// https://astro.build/config
export default defineConfig({
  site: 'https://invisiblesloth.com',
  base: '/',
  output: 'static',

  build: {
    inlineStylesheets: 'auto',
  },

  vite: {
    plugins: tailwindPlugins,
    build: {
      minify: 'esbuild',
      cssMinify: true,
    },
  },

  integrations: [svelte()]
});
