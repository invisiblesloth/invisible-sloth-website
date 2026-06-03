<script module lang="ts">
  import type { Snippet } from 'svelte';

  export type SiteHeaderProps = {
    homeHref?: string;
    homeLabel?: string;
    logoAlt?: string;
    leading?: Snippet;
    trailing?: Snippet;
    class?: string;
  };
</script>

<script lang="ts">
  import BrandHomeMark from './internal/BrandHomeMark.svelte';
  import { DEFAULT_LOGO_ALT, DEFAULT_LOGO_LINK_LABEL } from '../lib/logo';

  /**
   * Site Header Component
   *
   * Responsive header with brand logo by default.
   * Logo size scales fluidly across breakpoints using clamp().
   * Optional leading and trailing regions are balanced so the logo remains
   * centered when a navigation shell provides controls on one side.
   *
   * Breakpoint sizing strategy:
   * - Base (0-631px): 18vw viewport-based scaling (45px-65px range)
   * - Medium (632-1014px): 14vw for better proportion on tablets
   * - Extended (1015px+): 9.5vw with 65px-96px range for larger screens
   * - Large (1176px+): Content constrained to 51rem max-width
   *
   * @prop {string} homeHref - URL for logo link (default: '/') - set to empty string to disable link
   * @prop {string} homeLabel - Accessible name for the logo link (default: 'Invisible Sloth home')
   * @prop {string} logoAlt - Alt text used only for the standalone logo when homeHref is empty
   * @prop {Snippet} leading - Optional leading header region
   * @prop {Snippet} trailing - Optional trailing header region
   */

  let {
    homeHref = '/',
    homeLabel = DEFAULT_LOGO_LINK_LABEL,
    logoAlt = DEFAULT_LOGO_ALT,
    leading = undefined,
    trailing = undefined,
    class: className = '',
  }: SiteHeaderProps = $props();

  const hasSideRegions = $derived(Boolean(leading || trailing));
  const headerClasses = $derived(
    ['site-header', hasSideRegions ? 'site-header--with-side-regions' : '', className]
      .filter(Boolean)
      .join(' ')
  );
</script>

<header class={headerClasses}>
  <div class="site-header__inner">
    {#if hasSideRegions}
      <div
        class="site-header__side site-header__side--leading"
        aria-hidden={leading ? undefined : 'true'}
      >
        {@render leading?.()}
      </div>
    {/if}

    <BrandHomeMark
      {homeHref}
      {homeLabel}
      {logoAlt}
      variant="technical"
      size="var(--header-logo-size)"
    />

    {#if hasSideRegions}
      <div
        class="site-header__side site-header__side--trailing"
        aria-hidden={trailing ? undefined : 'true'}
      >
        {@render trailing?.()}
      </div>
    {/if}
  </div>
</header>

<style>
  .site-header {
    --header-padding-inline: min(
      var(--site-chrome-header-inline, var(--space-rail-inline)),
      var(--space-400)
    );
    --header-padding-block: min(
      var(--site-chrome-header-block, var(--space-section-block)),
      var(--space-600)
    );
    --header-content-max-width: 51rem;
    --header-logo-min: 45px;
    --header-logo-max: 96px;
    --header-logo-size: clamp(var(--header-logo-min), 18vw, var(--header-logo-max));
    --site-header-control-block-size: var(--site-chrome-trigger-block-size, 48px);

    display: flex;
    justify-content: center;
    padding-block: var(--header-padding-block);
    padding-inline: var(--header-padding-inline);
  }

  .site-header__inner {
    width: min(100%, var(--header-content-max-width));
    margin-inline: auto;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-400);
  }

  .site-header--with-side-regions {
    --header-padding-inline: var(--site-chrome-header-inline, var(--space-rail-inline));
    --header-padding-block: var(--site-chrome-header-block, var(--space-section-block));
  }

  .site-header--with-side-regions .site-header__inner {
    --header-content-max-width: 100%;

    justify-content: space-between;
    gap: var(--space-gutter);
  }

  .site-header__side {
    display: flex;
    flex: 1 0 0;
    min-inline-size: 0;
    min-block-size: var(--site-header-control-block-size);
    align-items: center;
  }

  .site-header__side--leading {
    justify-content: flex-start;
  }

  .site-header__side--trailing {
    justify-content: flex-end;
  }

  @media (min-width: 1015px) {
    .site-header {
      --header-padding-inline: var(--site-chrome-header-inline, var(--space-rail-inline));
      --header-padding-block: var(--site-chrome-header-block, var(--space-section-block));
    }
  }

  @media (min-width: 1176px) {
    .site-header--with-side-regions .site-header__inner {
      width: min(100%, var(--size-rail-md));
      padding-inline: var(--space-gutter);
    }
  }
</style>
