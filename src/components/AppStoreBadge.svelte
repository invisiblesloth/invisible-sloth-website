<script module lang="ts">
  export type AppStoreBadgeProps = {
    href?: string;
  };
</script>

<script lang="ts">
  import { resolveAppStoreHref } from '../lib/appStoreBadge.js';
  import { warnOnce } from '../lib/devWarnings';

  // Narrow control: artwork, accessible name, focus, and clear space are owned
  // here. The parent owns placement and section rhythm. No rest forwarding.
  let { href = undefined }: AppStoreBadgeProps = $props();
  const destination = $derived(resolveAppStoreHref(href));

  $effect(() => {
    if (destination.invalid) {
      warnOnce(
        'app-store-badge:invalid-href',
        '[AppStoreBadge] `href` must be an HTTPS apps.apple.com product URL. Rendering a noninteractive badge.',
      );
    }
  });
</script>

<!-- Official, unmodified artwork: https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg -->
{#snippet artwork()}
  <img
    src="/assets/download-on-the-app-store.svg"
    alt="Download on the App Store"
    width="144"
    height="48"
    loading="eager"
    fetchpriority="auto"
  />
{/snippet}

{#if destination.href}
  <a class="app-store-badge" href={destination.href}>
    {@render artwork()}
  </a>
{:else}
  <span class="app-store-badge">
    {@render artwork()}
  </span>
{/if}

<style>
  .app-store-badge {
    display: inline-flex;
    flex: none;
    padding: var(--space-300);
    vertical-align: middle;
  }

  .app-store-badge img {
    display: block;
    block-size: 48px;
    /* Preserve the official SVG ratio: 119.66407 / 40 at 48px high. */
    inline-size: 143.596884px;
    max-inline-size: none;
  }

  a.app-store-badge:focus-visible {
    outline: 2px solid var(--color-on-background);
    outline-offset: 2px;
  }
</style>
