<script lang="ts">
  import type { Snippet } from 'svelte';
  import { DEFAULT_LOGO_ALT, DEFAULT_LOGO_LINK_LABEL } from '../lib/logo';
  import type { NavigationCloseReason, NavigationItem, NavigationSection } from '../lib/navigation';
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

<div class={siteNavigationClasses}>
  <div
    class="site-navigation__content"
    aria-hidden={drawerOpen ? 'true' : undefined}
    inert={drawerOpen}
  >
    <SiteHeader
      showMenuButton
      menuExpanded={drawerOpen}
      menuControlsId={normalizedDrawerId}
      {menuButtonLabel}
      onMenuClick={openDrawer}
      {homeHref}
      {homeLabel}
      {logoAlt}
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
    min-block-size: inherit;
  }

  .site-navigation__content {
    min-block-size: inherit;
  }
</style>
