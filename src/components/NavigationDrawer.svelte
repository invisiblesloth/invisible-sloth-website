<script lang="ts">
  import NavigationMenu from './NavigationMenu.svelte';
  import { normalizeTarget } from '../lib/linkBehavior';
  import type { NavigationItem, NavigationSection } from '../lib/navigation';

  const FOCUSABLE_SELECTOR = [
    'a[href]',
    'button:not([disabled])',
    'textarea:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ].join(',');

  let {
    id = 'site-navigation-drawer',
    open = false,
    sections = [],
    activeHref = undefined,
    dialogLabel = 'Navigation menu',
    closeButtonLabel = 'Close navigation menu',
    onclose = undefined,
    onClose = undefined,
    onnavigate = undefined,
    onNavigate = undefined,
  }: {
    id?: string;
    open?: boolean;
    sections?: NavigationSection[];
    activeHref?: string;
    dialogLabel?: string;
    closeButtonLabel?: string;
    onclose?: (event?: MouseEvent) => void;
    onClose?: (event?: MouseEvent) => void;
    onnavigate?: (event: MouseEvent, item: NavigationItem) => void;
    onNavigate?: (event: MouseEvent, item: NavigationItem) => void;
  } = $props();

  let drawerElement = $state<HTMLDivElement | undefined>();
  let previousFocusElement: HTMLElement | undefined;
  const closeCallback = $derived(onclose ?? onClose);
  const navigateCallback = $derived(onnavigate ?? onNavigate);

  function closeDrawer(event?: MouseEvent): void {
    closeCallback?.(event);
  }

  function handleDrawerClick(event: MouseEvent): void {
    if (
      event.target instanceof Element &&
      event.target.closest('[data-navigation-menu-close]')
    ) {
      closeDrawer(event);
      return;
    }

    if (event.target === event.currentTarget) {
      closeDrawer(event);
    }
  }

  function isElementVisible(element: HTMLElement): boolean {
    return Boolean(element.offsetWidth || element.offsetHeight || element.getClientRects().length);
  }

  function getFocusableElements(): HTMLElement[] {
    if (!drawerElement) return [];

    return Array.from(drawerElement.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
      (element) =>
        !element.hasAttribute('disabled') &&
        element.getAttribute('aria-hidden') !== 'true' &&
        isElementVisible(element)
    );
  }

  function shouldCloseAfterNavigation(event: MouseEvent, item: NavigationItem): boolean {
    if (event.defaultPrevented) return false;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return false;
    if (event.button !== 0) return false;

    return normalizeTarget(item.target) !== '_blank';
  }

  function handleKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      event.preventDefault();
      closeDrawer();
      return;
    }

    if (event.key !== 'Tab') {
      return;
    }

    const focusableElements = getFocusableElements();

    if (focusableElements.length === 0) {
      event.preventDefault();
      return;
    }

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    const activeElement = document.activeElement;

    if (!drawerElement?.contains(activeElement)) {
      event.preventDefault();
      firstElement.focus();
      return;
    }

    if (event.shiftKey && activeElement === firstElement) {
      event.preventDefault();
      lastElement.focus();
      return;
    }

    if (!event.shiftKey && activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus();
    }
  }

  function handleNavigate(event: MouseEvent, item: NavigationItem): void {
    navigateCallback?.(event, item);

    if (shouldCloseAfterNavigation(event, item)) {
      closeDrawer();
    }
  }

  $effect(() => {
    if (!open || typeof document === 'undefined') {
      return;
    }

    previousFocusElement =
      document.activeElement instanceof HTMLElement ? document.activeElement : undefined;

    const previousBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    queueMicrotask(() => {
      const closeButton = drawerElement?.querySelector<HTMLElement>('[data-navigation-menu-close]');
      closeButton?.focus();
    });

    return () => {
      document.body.style.overflow = previousBodyOverflow;

      queueMicrotask(() => {
        if (previousFocusElement?.isConnected) {
          previousFocusElement.focus();
        }
      });
    };
  });
</script>

{#if open}
  <div
    {id}
    class="navigation-drawer"
    role="dialog"
    aria-modal="true"
    aria-label={dialogLabel}
    tabindex="-1"
    bind:this={drawerElement}
    onclick={handleDrawerClick}
    onkeydown={handleKeydown}
  >
    <NavigationMenu
      class="navigation-drawer__menu"
      {sections}
      {activeHref}
      {closeButtonLabel}
      onclose={closeDrawer}
      onnavigate={handleNavigate}
    />
  </div>
{:else}
  <div {id} hidden></div>
{/if}

<style>
  .navigation-drawer {
    --navigation-drawer-panel-padding: var(--space-300);
    --navigation-drawer-panel-inline-size: 360px;
    --navigation-drawer-panel-block-end-gap: calc(
      var(--radius-xl) + env(safe-area-inset-bottom, 0px)
    );
    --navigation-drawer-header-inline: var(--space-rail-inline);
    --navigation-drawer-header-block: var(--space-section-block);
    --navigation-drawer-menu-button-block-offset: clamp(0px, calc(9vw - 24px), 24px);
    --navigation-drawer-menu-button-block-start: calc(
      var(--navigation-drawer-header-block) + var(--navigation-drawer-menu-button-block-offset)
    );
    --navigation-menu-inline-size: 100%;
    --navigation-menu-padding-block: var(--navigation-drawer-menu-button-block-start)
      var(--space-section-block-lg);
    --navigation-menu-padding-inline: var(--navigation-drawer-header-inline);
    --navigation-menu-border-radius: 0;

    position: fixed;
    inset: 0;
    z-index: 1000;
    overflow: hidden;
    background: rgba(0, 0, 0, 0.45);
    background: color-mix(in srgb, var(--color-scrim) 45%, transparent);
  }

  :global(.navigation-drawer__menu) {
    position: absolute;
    inset-block: 0;
    inset-inline-start: 0;
    min-block-size: 100%;
    max-block-size: 100dvh;
    overflow-y: auto;
    overscroll-behavior: contain;
    -webkit-overflow-scrolling: touch;
  }

  @media (min-width: 632px) {
    .navigation-drawer {
      --navigation-drawer-menu-button-block-offset: clamp(8.5px, calc(7vw - 24px), 24px);
      --navigation-menu-inline-size: var(--navigation-drawer-panel-inline-size);
      --navigation-menu-padding-block: var(--navigation-drawer-panel-padding);
      --navigation-menu-padding-inline: var(--navigation-drawer-panel-padding);
      --navigation-menu-border-radius: var(--radius-xl);
    }

    :global(.navigation-drawer__menu) {
      inset-block-start: calc(
        var(--navigation-drawer-menu-button-block-start) - var(--navigation-drawer-panel-padding)
      );
      inset-block-end: var(--navigation-drawer-panel-block-end-gap);
      inset-inline-start: calc(
        var(--navigation-drawer-header-inline) - var(--navigation-drawer-panel-padding)
      );
      min-block-size: 0;
      max-block-size: none;
    }
  }

  @media (min-width: 1015px) {
    .navigation-drawer {
      --navigation-drawer-menu-button-block-offset: 24px;
    }
  }

  @media (min-width: 1176px) {
    :global(.navigation-drawer__menu) {
      inset-inline-start: calc(
        50% - (var(--size-rail-md) / 2) + var(--space-gutter) -
          var(--navigation-drawer-panel-padding)
      );
    }
  }
</style>
