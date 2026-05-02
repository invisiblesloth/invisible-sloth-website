<script lang="ts">
  import { warnOnce } from '../lib/devWarnings';
  import {
    DEFAULT_LOGO_ALT,
    isBlankString,
    isLogoVariant,
    normalizeLogoAlt,
    normalizeLogoVariant,
    resolveLogoSize,
    type LogoSize,
    type LogoVariant,
  } from '../lib/logo';

  /**
   * Brand logo mark with theme-aware asset routing.
   *
   * Decorative logos are hidden from assistive technology and render no image
   * role or label. Non-decorative logos expose the mark as an image using alt.
   */
  let {
    variant = 'standard',
    size = 'md',
    alt = DEFAULT_LOGO_ALT,
    decorative = false,
  }: {
    variant?: LogoVariant;
    size?: LogoSize;
    alt?: string;
    decorative?: boolean;
  } = $props();

  const logoSize = $derived(resolveLogoSize(size));
  const normalizedVariant = $derived(normalizeLogoVariant(variant));
  const normalizedAlt = $derived(normalizeLogoAlt(alt));
  const variantClass = $derived(`logo--${normalizedVariant}`);

  $effect(() => {
    if (!isLogoVariant(variant)) {
      warnOnce(
        'logo:invalid-variant',
        '[Logo] `variant` must be "standard" or "technical". Falling back to "standard".'
      );
    }

    if (!decorative && isBlankString(alt)) {
      warnOnce(
        'logo:blank-alt',
        '[Logo] Non-decorative logos need non-empty alt text. Falling back to the default logo description.'
      );
    }
  });
</script>

<div
  class={`logo ${variantClass}`}
  style="--logo-size: {logoSize}"
  aria-hidden={decorative ? 'true' : undefined}
>
  <div
    class="logo__mark"
    role={decorative ? undefined : 'img'}
    aria-label={decorative ? undefined : normalizedAlt}
  ></div>
</div>

<style>
  .logo {
    display: inline-block;
    width: var(--logo-size);
    height: var(--logo-size);
  }

  .logo__mark {
    width: 100%;
    height: 100%;
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
  }

  .logo--standard .logo__mark {
    background-image: url('/logos/logo-standard-light.svg');
  }

  .logo--technical .logo__mark {
    background-image: url('/logos/logo-technical-light.svg');
  }

  @media (prefers-color-scheme: dark) {
    .logo--standard .logo__mark {
      background-image: url('/logos/logo-standard-dark.svg');
    }

    .logo--technical .logo__mark {
      background-image: url('/logos/logo-technical-dark.svg');
    }
  }

  :global(html[data-theme='dark']) .logo--standard .logo__mark {
    background-image: url('/logos/logo-standard-dark.svg');
  }

  :global(html[data-theme='dark']) .logo--technical .logo__mark {
    background-image: url('/logos/logo-technical-dark.svg');
  }

  :global(html[data-theme='light']) .logo--standard .logo__mark {
    background-image: url('/logos/logo-standard-light.svg');
  }

  :global(html[data-theme='light']) .logo--technical .logo__mark {
    background-image: url('/logos/logo-technical-light.svg');
  }
</style>
