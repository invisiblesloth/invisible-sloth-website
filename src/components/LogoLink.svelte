<script lang="ts">
  import Logo from './Logo.svelte';
  import { warnOnce } from '../lib/devWarnings';
  import {
    isBlankString,
    normalizeLogoAlt,
    resolveLogoSize,
    type LogoSize,
    type LogoVariant,
  } from '../lib/logo';
  import { normalizeHref } from '../lib/linkBehavior';

  /**
   * Logo wrapper that may render as either a home/brand link or a structural
   * non-link wrapper. It owns logo sizing, focus treatment, and decorative tilt.
   */
  let {
    href = undefined,
    variant = 'standard',
    size = 'md',
    ariaLabel = undefined,
    logoAlt = undefined,
    class: className = '',
  }: {
    href?: string;
    variant?: LogoVariant;
    size?: LogoSize;
    ariaLabel?: string;
    logoAlt?: string;
    class?: string;
  } = $props();

  const normalizedHref = $derived(normalizeHref(href));
  const hasHrefProp = $derived(href !== undefined && href !== null);
  const isLinked = $derived(Boolean(normalizedHref));
  const logoLinkSize = $derived(resolveLogoSize(size));
  const normalizedLogoAlt = $derived(normalizeLogoAlt(logoAlt));
  const normalizedAriaLabel = $derived(ariaLabel?.trim() || normalizedLogoAlt);
  const logoLinkClasses = $derived(
    ['logo-link', isLinked ? 'logo-link--linked' : 'logo-link--unlinked', className]
      .filter(Boolean)
      .join(' ')
  );

  $effect(() => {
    if (hasHrefProp && !normalizedHref) {
      warnOnce(
        'logo-link:invalid-href',
        '[LogoLink] `href` must resolve to a non-empty string after trimming. Rendering a non-linked logo.'
      );
    }

    if (isLinked && isBlankString(ariaLabel)) {
      warnOnce(
        'logo-link:blank-aria-label',
        '[LogoLink] Linked logos need a non-empty `ariaLabel`. Falling back to the logo alt text.'
      );
    }
  });
</script>

{#if isLinked}
  <a
    class={logoLinkClasses}
    href={normalizedHref}
    aria-label={normalizedAriaLabel}
    style="--logo-link-size: {logoLinkSize}"
    data-logo-hover-tilt
  >
    <Logo {variant} size="100%" alt={normalizedLogoAlt} decorative />
  </a>
{:else}
  <div
    class={logoLinkClasses}
    style="--logo-link-size: {logoLinkSize}"
  >
    <Logo {variant} size="100%" alt={normalizedLogoAlt} />
  </div>
{/if}

<style>
  .logo-link {
    --logo-hover-rotate: 0deg;

    display: inline-flex;
    align-items: center;
    justify-content: center;
    text-decoration: none;
    width: var(--logo-link-size);
    height: var(--logo-link-size);
    border-radius: var(--radius-sm);
    -webkit-tap-highlight-color: transparent;
  }

  .logo-link--linked {
    cursor: pointer;
  }

  .logo-link--unlinked {
    cursor: auto;
  }

  @media (prefers-reduced-motion: no-preference) {
    .logo-link--linked {
      transition: transform 160ms ease;
    }
  }

  @media (hover: hover) {
    .logo-link--linked:hover {
      transform: scale(1.04) rotate(var(--logo-hover-rotate));
    }
  }

  .logo-link--linked:active {
    transform: scale(1.04) rotate(var(--logo-hover-rotate));
  }

  .logo-link--linked:focus-visible {
    outline: var(--focus-outline-width) solid var(--color-focus);
    outline-offset: 4px;
  }

  .logo-link--unlinked:focus {
    outline: none;
  }
</style>
