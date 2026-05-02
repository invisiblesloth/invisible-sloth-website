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
   * @prop {string} logoAlt - Alt text for the standalone logo when homeHref is empty
   * @prop {string} ariaLabel - Aria label for logo link, describes both brand and action (default: 'Invisible Sloth home')
   */
  import LogoLink from './LogoLink.svelte';
  import { DEFAULT_LOGO_ALT } from '../lib/logo';

  let {
    homeHref = '/',
    logoAlt = DEFAULT_LOGO_ALT,
    ariaLabel = 'Invisible Sloth home',
    class: className = '',
  }: {
    homeHref?: string;
    logoAlt?: string;
    ariaLabel?: string;
    class?: string;
  } = $props();
</script>

<header class={`site-header ${className}`}>
  <div class="site-header__inner">
    <LogoLink
      href={homeHref}
      variant="technical"
      size="var(--header-logo-size)"
      {ariaLabel}
      {logoAlt}
    />
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

  @media (min-width: 1015px) {
    .site-header {
      --header-padding-inline: var(--space-rail-inline);
      --header-padding-block: var(--space-section-block);
    }
  }
</style>
