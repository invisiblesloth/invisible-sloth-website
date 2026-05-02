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
   * @prop {string} logoAlt - Alt text for the standalone logo when homeHref is empty
   * @prop {string} ariaLabel - Aria label for logo link (default: 'Invisible Sloth home')
   * @prop {string} tagline - Tagline text (default: "We may be slow, but we're not slowing down!")
   * @prop {string} copyrightText - Copyright text (default: 'Invisible Sloth, LLC © 2024-2025')
   * @slot default - Optional page-owned content between tagline and copyright
   */
  import type { Snippet } from 'svelte';
  import Divider from './Divider.svelte';
  import LogoLink from './LogoLink.svelte';
  import { DEFAULT_LOGO_ALT } from '../lib/logo';

  let {
    homeHref = '/',
    logoAlt = DEFAULT_LOGO_ALT,
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
</script>

<footer class={`site-footer ${className}`}>
  <Divider ariaHidden />

  <div class="site-footer__inner">
    <!-- Logo Section -->
    <div class="site-footer__logo-section">
      <LogoLink
        href={homeHref}
        variant="standard"
        size="var(--footer-logo-size)"
        {ariaLabel}
        {logoAlt}
      />
    </div>

    <!-- Tagline Section -->
    <div class="site-footer__tagline">
      <p class="site-footer__tagline-text text-headline-small">{tagline}</p>
    </div>
    
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
