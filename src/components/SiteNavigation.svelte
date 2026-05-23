<script lang="ts">
  import type { Snippet } from 'svelte';
  import { normalizeTarget } from '../lib/linkBehavior';
  import { DEFAULT_LOGO_ALT, DEFAULT_LOGO_LINK_LABEL } from '../lib/logo';
  import type {
    NavigationCloseReason,
    ResolvedNavigationItem,
    ResolvedNavigationSection,
  } from '../lib/navigation';
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
    sections?: ResolvedNavigationSection[];
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
    onNavigate?: (event: MouseEvent, item: ResolvedNavigationItem) => void;
    children?: Snippet;
    class?: string;
  } = $props();

  let drawerOpen = $state(false);

  const siteNavigationClasses = $derived(
    ['site-navigation', className].filter(Boolean).join(' ')
  );
  const hasNavigation = $derived(sections.length > 0);
  const normalizedDrawerId = $derived(
    typeof drawerId === 'string'
      ? drawerId.trim() || 'site-navigation-drawer'
      : 'site-navigation-drawer'
  );

  function openDrawer(): void {
    if (!hasNavigation) return;
    drawerOpen = true;
  }

  function closeDrawer(reason: NavigationCloseReason): void {
    drawerOpen = false;
    onClose?.(reason);
  }

  function handleClose(
    _event?: MouseEvent | KeyboardEvent,
    reason: NavigationCloseReason = 'button'
  ): void {
    closeDrawer(reason);
  }

  function shouldCloseAfterNavigation(
    event: MouseEvent,
    item: ResolvedNavigationItem
  ): boolean {
    if (event.defaultPrevented) return false;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return false;
    if (event.button !== 0) return false;

    return normalizeTarget(item.target) !== '_blank';
  }

  function handleNavigate(event: MouseEvent, item: ResolvedNavigationItem): void {
    onNavigate?.(event, item);

    if (shouldCloseAfterNavigation(event, item)) {
      closeDrawer('navigation');
    }
  }

  $effect(() => {
    if (!hasNavigation && drawerOpen) {
      drawerOpen = false;
    }
  });
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
      leading={hasNavigation ? menuTrigger : undefined}
    />

    {@render children?.()}
  </div>

  {#if hasNavigation}
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
  {/if}
</div>

<style>
  .site-navigation {
    --site-chrome-header-inline: var(--space-rail-inline);
    --site-chrome-header-block: var(--space-section-block);
    --site-chrome-trigger-block-size: 48px;
    --site-chrome-drawer-panel-padding: var(--space-300);
    --site-chrome-drawer-panel-inline-start: calc(
      var(--site-chrome-header-inline) - var(--site-chrome-drawer-panel-padding)
    );
    --site-chrome-drawer-panel-contained-inline-start: calc(
      50% - (var(--size-rail-md) / 2) + var(--space-gutter) -
        var(--site-chrome-drawer-panel-padding)
    );

    min-block-size: inherit;
  }

  .site-navigation__content {
    min-block-size: inherit;
  }
</style>
