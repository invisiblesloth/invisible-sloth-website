<script lang="ts">
  /**
   * Site Footer Component
   *
   * Responsive footer with logo, tagline, and copyright.
   * All content is centered with responsive spacing.
   *
   * Breakpoint sizing strategy:
   * - Base (0-631px): Compact layout with smaller logo
   * - Medium (632-1014px): Larger logo, headline-small tagline
   * - Extended (1015px+): Same logo, headline-large tagline
   * - Large (1176px+): Content constrained to max-width
   *
   * @prop {string} homeHref - URL for logo link (default: '/') - set to empty string to disable link
   * @prop {string} logoAlt - Alt text for logo image (default: 'Invisible Sloth')
   * @prop {string} ariaLabel - Aria label for logo link (default: 'Invisible Sloth home')
   * @prop {string} tagline - Tagline text (default: "We may be slow, but we're not slowing down!")
   * @prop {string} copyrightText - Copyright text (default: 'Invisible Sloth, LLC © 2024-2025')
   * @slot default - Optional content above copyright - appears below tagline
   */
  import type { Snippet } from 'svelte';
  import Divider from './Divider.svelte';
  import LogoStandard from './LogoStandard.svelte';
  import ContactUs from './ContactUs.svelte';

  let {
    homeHref = '/',
    logoAlt = 'Invisible Sloth',
    ariaLabel = 'Invisible Sloth home',
    tagline = "We may be slow, but we're not slowing down!",
    copyrightText = '© Invisible Sloth, LLC',
    children,
    class: className = '',
  }: {
    homeHref?: string;
    logoAlt?: string;
    ariaLabel?: string;
    tagline?: string;
    copyrightText?: string;
    children?: Snippet;
    class?: string;
  } = $props();

  const hasContent = $derived(Boolean(children));
  const isLink = $derived(Boolean(homeHref));
</script>

<footer class={`site-footer ${className}`}>
  <Divider ariaHidden />

  <div class="site-footer__inner">
    <!-- Logo Section -->
    <div class="site-footer__logo-section">
      {#if isLink}
        <a class="site-footer__logo-wrapper" href={homeHref} aria-label={ariaLabel} data-logo-hover-tilt>
          <LogoStandard alt={logoAlt} />
        </a>
      {:else}
        <div class="site-footer__logo-wrapper" data-logo-hover-tilt>
          <LogoStandard alt={logoAlt} />
        </div>
      {/if}
    </div>

    <!-- Tagline Section -->
    <div class="site-footer__tagline">
      <p class="site-footer__tagline-text text-headline-small">{tagline}</p>
    </div>
    
    <!-- Contact Us Section -->
    <ContactUs />

    {#if hasContent && children}
      <div class="site-footer__slot-content">
        {@render children()}
      </div>
    {/if}

    <!-- Copyright Section -->
    <div class="site-footer__copyright">
      <p class="text-body-small">{copyrightText}</p>
    </div>
  </div>
</footer>

<style>
  .site-footer {
    --footer-logo-min: 96px;
    --footer-logo-max: 160px;
    --footer-logo-size: clamp(var(--footer-logo-min), 30vw, var(--footer-logo-max));

    display: flex;
    flex-direction: column;
    width: 100%;
  }

  .site-footer__inner {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-gutter-loose);
    padding-inline: var(--space-rail-inline);
    padding-block: var(--space-section-block) var(--space-section-block-xl);
    width: 100%;
    margin-inline: auto;
  }

  .site-footer__logo-section {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
  }

  .site-footer__logo-wrapper {
    --logo-hover-rotate: 0deg;

    display: inline-flex;
    align-items: center;
    justify-content: center;
    text-decoration: none;
    width: var(--footer-logo-size);
    height: var(--footer-logo-size);
    border-radius: var(--radius-sm);
  }

  @media (prefers-reduced-motion: no-preference) {
    .site-footer__logo-wrapper {
      transition: transform 160ms ease;
    }
  }

  @media (hover: hover) {
    .site-footer__logo-wrapper:hover {
      transform: scale(1.04) rotate(var(--logo-hover-rotate));
    }
  }

  .site-footer__logo-wrapper:active {
    transform: scale(1.04) rotate(var(--logo-hover-rotate));
  }

  .site-footer__logo-wrapper:focus-visible {
    outline: var(--focus-outline-width) solid var(--color-focus);
    outline-offset: 4px;
  }

  /* Override Logo component's default size */
  .site-footer__logo-wrapper :global(.logo-standard) {
    width: 100%;
    height: 100%;
  }

  .site-footer__tagline {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
  }

  .site-footer__tagline-text {
    margin: 0;
    text-align: center;
    width: 100%;
  }

  .site-footer__copyright {
    color: var(--color-on-background-dim);
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
  }

  .site-footer__slot-content {
    width: 100%;
  }

  .site-footer__copyright p {
    margin: 0;
    text-align: center;
    width: 100%;
  }

  /* Extended breakpoint (1015px+) */
  @media (min-width: 1015px) {
    .site-footer__tagline-text {
      /* Extended+ (1015px+): headline-medium */
      font-family: var(--typography-headline-medium-family);
      font-size: var(--typography-headline-medium-size);
      font-weight: var(--typography-headline-medium-weight);
      line-height: var(--typography-headline-medium-line-height);
      letter-spacing: var(--typography-headline-medium-letter-spacing);
    }
  }

  /* Large breakpoint (1176px+) */
  @media (min-width: 1176px) {
    .site-footer__inner {
      max-width: var(--size-rail-md);
    }
  }
</style>
