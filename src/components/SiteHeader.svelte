<script lang="ts">
  /**
   * Site Header Component
   *
   * Responsive header with brand logo only.
   * Logo size scales fluidly across breakpoints using clamp().
   *
   * Breakpoint sizing strategy:
   * - Base (0-631px): 18vw viewport-based scaling (45px-65px range)
   * - Medium (632-1014px): 14vw for better proportion on tablets
   * - Extended (1015px+): 9.5vw with 65px-96px range for larger screens
   * - Large (1176px+): Content constrained to 51rem max-width
   *
   * @prop {string} homeHref - URL for logo link (default: '/') - set to empty string to disable link
   * @prop {string} logoAlt - Alt text for logo image (default: 'Invisible Sloth')
   * @prop {string} ariaLabel - Aria label for logo link, describes both brand and action (default: 'Invisible Sloth home')
   */
  import LogoTechnical from './LogoTechnical.svelte';

  let {
    homeHref = '/',
    logoAlt = 'Invisible Sloth',
    ariaLabel = 'Invisible Sloth home',
    class: className = '',
  }: {
    homeHref?: string;
    logoAlt?: string;
    ariaLabel?: string;
    class?: string;
  } = $props();

  const isLink = Boolean(homeHref);
</script>

<header class={`site-header ${className}`}>
  <div class="site-header__inner">
    {#if isLink}
      <a class="site-header__logo-wrapper" href={homeHref} aria-label={ariaLabel}>
        <LogoTechnical alt={logoAlt} />
      </a>
    {:else}
      <div class="site-header__logo-wrapper">
        <LogoTechnical alt={logoAlt} />
      </div>
    {/if}
  </div>
</header>

<style>
  .site-header {
    --header-padding-inline: min(var(--space-rail-inline), var(--space-400));
    --header-padding-block: min(var(--space-section-block), var(--space-600));
    --header-content-max-width: 51rem;
    --header-logo-min: 45px;
    --header-logo-max: 96px;
    --header-logo-size: clamp(var(--header-logo-min), 18vw, var(--header-logo-max));

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

  .site-header__logo-wrapper {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    text-decoration: none;
    width: var(--header-logo-size);
    height: var(--header-logo-size);
    border-radius: var(--radius-sm);
  }

  @media (prefers-reduced-motion: no-preference) {
    .site-header__logo-wrapper {
      transition: transform 160ms ease;
    }
  }

  @media (hover: hover) {
    .site-header__logo-wrapper:hover {
      transform: scale(1.04);
    }
  }

  .site-header__logo-wrapper:active {
    transform: scale(1.04);
  }

  .site-header__logo-wrapper:focus-visible {
    outline: var(--focus-outline-width) solid var(--color-focus);
    outline-offset: 4px;
  }

  /* Override Logo component's default size */
  .site-header__logo-wrapper :global(.logo-technical) {
    width: 100%;
    height: 100%;
  }

  @media (min-width: 1015px) {
    .site-header {
      --header-padding-inline: var(--space-rail-inline);
      --header-padding-block: var(--space-section-block);
    }
  }
</style>
