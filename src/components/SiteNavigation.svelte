<script lang="ts">
  import type { Snippet } from 'svelte';
  import { DEFAULT_LOGO_ALT, DEFAULT_LOGO_LINK_LABEL } from '../lib/logo';
  import type { NavigationCloseReason, NavigationItem, NavigationSection } from '../lib/navigation';
  import Menu from '../icons/Menu.svelte';
  import Button from './Button.svelte';
  import NavigationDrawer from './NavigationDrawer.svelte';
  import SiteHeader from './SiteHeader.svelte';

  let {
    sections = [],
    activeHref = undefined,
    drawerId = 'site-navigation-drawer',
    homeHref = '/',
    homeLabel = DEFAULT_LOGO_LINK_LABEL,
    logoAlt = DEFAULT_LOGO_ALT,
    menuButtonLabel = 'Open navigation menu',
    closeButtonLabel = 'Close navigation menu',
    dialogLabel = 'Navigation menu',
    navigationLabel = 'Site navigation',
    onClose = undefined,
    onNavigate = undefined,
    children = undefined,
    class: className = '',
  }: {
    sections?: NavigationSection[];
    activeHref?: string;
    drawerId?: string;
    homeHref?: string;
    homeLabel?: string;
    logoAlt?: string;
    menuButtonLabel?: string;
    closeButtonLabel?: string;
    dialogLabel?: string;
    navigationLabel?: string;
    onClose?: (reason: NavigationCloseReason) => void;
    onNavigate?: (event: MouseEvent, item: NavigationItem) => void;
    children?: Snippet;
    class?: string;
  } = $props();

  let drawerOpen = $state(false);

  const siteNavigationClasses = $derived(
    ['site-navigation', className].filter(Boolean).join(' ')
  );
  const normalizedDrawerId = $derived(
    typeof drawerId === 'string'
      ? drawerId.trim() || 'site-navigation-drawer'
      : 'site-navigation-drawer'
  );

  function openDrawer(): void {
    drawerOpen = true;
  }

  function handleClose(
    _event?: MouseEvent | KeyboardEvent,
    reason: NavigationCloseReason = 'button'
  ): void {
    drawerOpen = false;
    onClose?.(reason);
  }

  function handleNavigate(event: MouseEvent, item: NavigationItem): void {
    onNavigate?.(event, item);
  }
</script>

{#snippet menuIcon()}
  <Menu />
{/snippet}

{#snippet menuTrigger()}
  <Button
    variant="filled-inverse-primary"
    shape="icon"
    type="button"
    label={menuButtonLabel}
    icon={menuIcon}
    aria-expanded={drawerOpen}
    aria-controls={normalizedDrawerId}
    onclick={openDrawer}
  />
{/snippet}

<div class={siteNavigationClasses}>
  <div
    class="site-navigation__content"
    aria-hidden={drawerOpen ? 'true' : undefined}
    inert={drawerOpen}
  >
    <SiteHeader
      {homeHref}
      {homeLabel}
      {logoAlt}
      leading={menuTrigger}
    />

    {@render children?.()}
  </div>

  <NavigationDrawer
    id={normalizedDrawerId}
    open={drawerOpen}
    {sections}
    {activeHref}
    {dialogLabel}
    {navigationLabel}
    {closeButtonLabel}
    onClose={handleClose}
    onNavigate={handleNavigate}
  />
</div>

<style>
  .site-navigation {
    --site-navigation-header-inline: var(--space-rail-inline);
    --site-navigation-header-block: var(--space-section-block);
    --site-navigation-trigger-block-size: 48px;
    --site-navigation-drawer-panel-padding: var(--space-300);
    --site-navigation-drawer-panel-inline-start: calc(
      var(--site-navigation-header-inline) - var(--site-navigation-drawer-panel-padding)
    );
    --site-navigation-drawer-panel-contained-inline-start: calc(
      50% - (var(--size-rail-md) / 2) + var(--space-gutter) -
        var(--site-navigation-drawer-panel-padding)
    );

    min-block-size: inherit;
  }

  .site-navigation__content {
    min-block-size: inherit;
  }
</style>
