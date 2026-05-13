<script lang="ts">
  /**
   * Site Header Component
   *
   * Responsive header with brand logo by default.
   * Logo size scales fluidly across breakpoints using clamp().
   * The menu-button layout is default-off for Storybook validation and does
   * not affect the current Astro page unless explicitly enabled.
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
   * @prop {boolean} showMenuButton - Enable Storybook menu-button layout (default: false)
   * @prop {boolean} menuExpanded - Current drawer state for aria-expanded (default: false)
   * @prop {string} menuControlsId - Optional controlled drawer id for aria-controls
   * @prop {string} menuButtonLabel - Accessible name for the menu button
   * @prop {Function} onMenuClick - Click handler for the menu button
   */
  import LogoLink from './LogoLink.svelte';
  import Menu from '../icons/Menu.svelte';
  import { DEFAULT_LOGO_ALT } from '../lib/logo';

  let {
    homeHref = '/',
    logoAlt = DEFAULT_LOGO_ALT,
    ariaLabel = 'Invisible Sloth home',
    showMenuButton = false,
    menuExpanded = false,
    menuControlsId = undefined,
    menuButtonLabel = 'Open navigation menu',
    onMenuClick = undefined,
    class: className = '',
  }: {
    homeHref?: string;
    logoAlt?: string;
    ariaLabel?: string;
    showMenuButton?: boolean;
    menuExpanded?: boolean;
    menuControlsId?: string;
    menuButtonLabel?: string;
    onMenuClick?: (event: MouseEvent) => void;
    class?: string;
  } = $props();

  const headerClasses = $derived(
    ['site-header', showMenuButton ? 'site-header--with-menu' : '', className]
      .filter(Boolean)
      .join(' ')
  );
</script>

<header class={headerClasses}>
  <div class="site-header__inner">
    {#if showMenuButton}
      <div class="site-header__side site-header__side--start">
        <button
          class="site-header__menu-button"
          type="button"
          aria-label={menuButtonLabel}
          aria-expanded={menuExpanded}
          aria-controls={menuControlsId}
          onclick={onMenuClick}
        >
          <span class="site-header__menu-button-side" aria-hidden="true"></span>
          <span class="site-header__menu-button-surface" aria-hidden="true"></span>
          <span class="site-header__menu-button-state" aria-hidden="true"></span>
          <span class="site-header__menu-button-icon" aria-hidden="true">
            <Menu />
          </span>
        </button>
      </div>
    {/if}

    <LogoLink
      href={homeHref}
      variant="technical"
      size="var(--header-logo-size)"
      {ariaLabel}
      {logoAlt}
    />

    {#if showMenuButton}
      <div class="site-header__side site-header__side--end" aria-hidden="true"></div>
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
    --site-header-control-block-size: 48px;

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

  .site-header--with-menu {
    --header-padding-inline: var(--space-rail-inline);
    --header-padding-block: var(--space-section-block);
  }

  .site-header--with-menu .site-header__inner {
    --header-content-max-width: 100%;

    justify-content: space-between;
    gap: var(--space-gutter);
  }

  .site-header__side {
    display: flex;
    flex: 1 0 0;
    min-inline-size: 0;
    align-items: center;
  }

  .site-header__side--start {
    justify-content: flex-start;
  }

  .site-header__side--end {
    min-block-size: var(--site-header-control-block-size);
  }

  .site-header__menu-button {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    inline-size: 80px;
    min-inline-size: 64px;
    block-size: var(--site-header-control-block-size);
    padding: 0;
    border: 0;
    border-radius: var(--radius-full);
    background: transparent;
    color: var(--color-on-inverse-primary);
    cursor: pointer;
    font: inherit;
    -webkit-tap-highlight-color: transparent;
  }

  .site-header__menu-button-side,
  .site-header__menu-button-surface,
  .site-header__menu-button-state {
    position: absolute;
    inset: 0;
    border-radius: inherit;
    pointer-events: none;
  }

  .site-header__menu-button-side {
    background: var(--color-button-side-inverse-primary);
  }

  .site-header__menu-button-surface {
    background: var(--color-inverse-primary);
  }

  .site-header__menu-button-state {
    background: var(--color-state-on-inverse-primary-08);
    opacity: 0;
  }

  .site-header__menu-button-icon {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    inline-size: 32px;
    block-size: 32px;
    font-size: 32px;
  }

  @media (hover: hover) and (pointer: fine) {
    .site-header__menu-button:hover .site-header__menu-button-state {
      background: var(--color-state-on-inverse-primary-08);
      opacity: 1;
    }
  }

  .site-header__menu-button:active .site-header__menu-button-state {
    background: var(--color-state-on-inverse-primary-12);
    opacity: 1;
  }

  .site-header__menu-button:focus-visible {
    outline: var(--focus-outline-width) solid var(--color-focus);
    outline-offset: 4px;
  }

  .site-header__menu-button:focus-visible .site-header__menu-button-state {
    background: var(--color-state-on-inverse-primary-12);
    opacity: 1;
  }

  @media (min-width: 1015px) {
    .site-header {
      --header-padding-inline: var(--space-rail-inline);
      --header-padding-block: var(--space-section-block);
    }
  }

  @media (min-width: 1176px) {
    .site-header--with-menu .site-header__inner {
      width: min(100%, var(--size-rail-md));
      padding-inline: var(--space-gutter);
    }
  }
</style>
