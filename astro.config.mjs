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

/**
 * Tailwind's Vite plugin transform hook can be either a function or a
 * hook-object with a handler in newer Vite versions.
 *
 * @param {import('vite').Plugin['transform']} transform
 * @returns {import('vite').Plugin['transform']}
 */
const wrapTransformHook = (transform) => {
  if (!transform) return transform;

  if (typeof transform === 'function') {
    return async function wrappedTransform(code, id, ...args) {
      if (shouldSkipSvelteVirtualCss(id)) {
        return code;
      }

      return transform.call(this, code, id, ...args);
    };
  }

  if (typeof transform === 'object' && typeof transform.handler === 'function') {
    const originalHandler = transform.handler;

    return {
      ...transform,
      async handler(code, id, ...args) {
        if (shouldSkipSvelteVirtualCss(id)) {
          return code;
        }

        return originalHandler.call(this, code, id, ...args);
      },
    };
  }

  return transform;
};

const tailwindPlugins = tailwindcss().map((plugin) => ({
  ...plugin,
  transform: wrapTransformHook(plugin.transform),
}));

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
