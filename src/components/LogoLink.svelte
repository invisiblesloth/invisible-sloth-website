<script module lang="ts">
  import type { LogoSize, LogoVariant } from '../lib/logo';

  export type LogoLinkProps = {
    href?: string;
    variant?: LogoVariant;
    size?: LogoSize;
    label?: string;
    class?: string;
  };
</script>

<script lang="ts">
  import Logo from './Logo.svelte';
  import { warnOnce } from '../lib/devWarnings';
  import {
    DEFAULT_LOGO_LINK_HREF,
    DEFAULT_LOGO_LINK_LABEL,
    isBlankString,
    normalizeLogoLinkLabel,
  } from '../lib/logo';
  import { normalizeHref } from '../lib/linkBehavior';

  /**
   * Linked brand logo. The anchor owns the accessible navigation label; the
   * nested mark is decorative. Hover tilt is attached here as an enhancement
   * hook, with behavior initialized by the site shell or Storybook preview.
   */
  let {
    href = DEFAULT_LOGO_LINK_HREF,
    variant = 'standard',
    size = 'md',
    label = undefined,
    class: className = '',
  }: LogoLinkProps = $props();

  const normalizedHref = $derived(normalizeHref(href) ?? DEFAULT_LOGO_LINK_HREF);
  const normalizedLabel = $derived(normalizeLogoLinkLabel(label));
  const logoLinkClasses = $derived(['logo-link', className].filter(Boolean).join(' '));

  $effect(() => {
    if (isBlankString(href)) {
      warnOnce(
        'logo-link:invalid-href',
        `[LogoLink] \`href\` must resolve to a non-empty string after trimming. Falling back to "${DEFAULT_LOGO_LINK_HREF}".`
      );
    }

    if (isBlankString(label)) {
      warnOnce(
        'logo-link:blank-label',
        `[LogoLink] Linked logos need a non-empty \`label\`. Falling back to "${DEFAULT_LOGO_LINK_LABEL}".`
      );
    }
  });
</script>

<a
  class={logoLinkClasses}
  class:logo-link--tracer={variant === 'tracer'}
  href={normalizedHref}
  aria-label={normalizedLabel}
  data-logo-hover-tilt
>
  <Logo {variant} {size} decorative />
  {#if variant === 'tracer'}
    <div class="logo-link__hover-mark">
      <Logo variant="technical" {size} decorative />
    </div>
  {/if}
</a>

<style>
  .logo-link {
    --logo-hover-rotate: 0deg;

    display: inline-flex;
    align-items: center;
    justify-content: center;
    text-decoration: none;
    border-radius: var(--radius-sm);
    line-height: 0;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
  }

  .logo-link--tracer {
    position: relative;
  }

  .logo-link__hover-mark {
    position: absolute;
    inset: 0;
    display: none;
    pointer-events: none;
    opacity: 0;
  }

  @media (hover: hover) and (pointer: fine) {
    .logo-link__hover-mark {
      display: block;
    }

    .logo-link--tracer:hover > :global(.logo) {
      opacity: 0;
    }

    .logo-link--tracer:hover > .logo-link__hover-mark {
      opacity: 1;
    }
  }

  @media (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference) {
    .logo-link--tracer > :global(.logo),
    .logo-link__hover-mark {
      transition: opacity 100ms ease-out;
    }
  }

  @media (prefers-reduced-motion: no-preference) {
    .logo-link {
      transition: transform 160ms ease;
    }
  }

  @media (hover: hover) {
    .logo-link:hover {
      transform: scale(1.04) rotate(var(--logo-hover-rotate));
    }
  }

  .logo-link:active {
    transform: scale(1.04) rotate(var(--logo-hover-rotate));
  }

  .logo-link:focus-visible {
    outline: var(--focus-outline-width) solid var(--color-focus);
    outline-offset: 4px;
  }
</style>
