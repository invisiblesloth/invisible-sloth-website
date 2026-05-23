<script lang="ts">
  import LogoLink from '../LogoLink.svelte';
  import Logo from '../Logo.svelte';
  import {
    DEFAULT_LOGO_ALT,
    DEFAULT_LOGO_LINK_LABEL,
    type LogoSize,
    type LogoVariant,
  } from '../../lib/logo';
  import { normalizeHref } from '../../lib/linkBehavior';

  let {
    homeHref = '/',
    homeLabel = DEFAULT_LOGO_LINK_LABEL,
    logoAlt = DEFAULT_LOGO_ALT,
    variant = 'standard',
    size = 'md',
  }: {
    homeHref?: string;
    homeLabel?: string;
    logoAlt?: string;
    variant?: LogoVariant;
    size?: LogoSize;
  } = $props();

  const normalizedHomeHref = $derived(normalizeHref(homeHref));
</script>

{#if normalizedHomeHref}
  <LogoLink
    href={normalizedHomeHref}
    {variant}
    {size}
    label={homeLabel}
  />
{:else}
  <Logo {variant} {size} alt={logoAlt} />
{/if}
