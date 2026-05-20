<script lang="ts">
  import Close from '../icons/Close.svelte';
  import { normalizeTarget } from '../lib/linkBehavior';
  import type {
    NavigationCloseCallback,
    NavigationCloseEvent,
    NavigationCloseReason,
    NavigationItem,
    NavigationSection,
  } from '../lib/navigation';
  import NavigationMenu from './NavigationMenu.svelte';

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
    navigationLabel = 'Site navigation',
    closeButtonLabel = 'Close navigation menu',
    onclose = undefined,
    onClose = undefined,
    onnavigate = undefined,
    onNavigate = undefined,
    class: className = '',
  }: {
    id?: string;
    open?: boolean;
    sections?: NavigationSection[];
    activeHref?: string;
    dialogLabel?: string;
    navigationLabel?: string;
    closeButtonLabel?: string;
    onclose?: NavigationCloseCallback;
    onClose?: NavigationCloseCallback;
    onnavigate?: (event: MouseEvent, item: NavigationItem) => void;
    onNavigate?: (event: MouseEvent, item: NavigationItem) => void;
    class?: string;
  } = $props();

  let drawerElement = $state<HTMLDivElement | undefined>();
  let closeButtonElement = $state<HTMLButtonElement | undefined>();
  let previousFocusElement: HTMLElement | undefined;
  let pendingCloseReason: NavigationCloseReason | undefined;

  function normalizeLabel(value: unknown, fallback: string): string {
    return typeof value === 'string' ? value.trim() || fallback : fallback;
  }

  const drawerClasses = $derived(['navigation-drawer', className].filter(Boolean).join(' '));
  const normalizedDialogLabel = $derived(normalizeLabel(dialogLabel, 'Navigation menu'));
  const normalizedNavigationLabel = $derived(normalizeLabel(navigationLabel, 'Site navigation'));
  const normalizedCloseButtonLabel = $derived(
    normalizeLabel(closeButtonLabel, 'Close navigation menu')
  );
  const closeCallback = $derived(onclose ?? onClose);
  const navigateCallback = $derived(onnavigate ?? onNavigate);

  function requestClose(
    event: NavigationCloseEvent,
    reason: NavigationCloseReason
  ): void {
    pendingCloseReason = reason;
    closeCallback?.(event, reason);
  }

  function handleCloseButtonClick(event: MouseEvent): void {
    event.stopPropagation();
    requestClose(event, 'button');
  }

  function handleDrawerClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      requestClose(event, 'backdrop');
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
      requestClose(event, 'escape');
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
      requestClose(event, 'navigation');
    }
  }

  $effect(() => {
    if (!open || typeof document === 'undefined') {
      return;
    }

    pendingCloseReason = undefined;
    previousFocusElement =
      document.activeElement instanceof HTMLElement ? document.activeElement : undefined;

    const previousBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    queueMicrotask(() => {
      closeButtonElement?.focus();
    });

    return () => {
      const shouldRestoreFocus = pendingCloseReason !== 'navigation';
      const focusTarget = previousFocusElement;
      pendingCloseReason = undefined;
      document.body.style.overflow = previousBodyOverflow;

      if (shouldRestoreFocus) {
        queueMicrotask(() => {
          if (focusTarget?.isConnected) {
            focusTarget.focus();
          }
        });
      }
    };
  });
</script>

{#if open}
  <div
    {id}
    class={drawerClasses}
    role="dialog"
    aria-modal="true"
    aria-label={normalizedDialogLabel}
    tabindex="-1"
    bind:this={drawerElement}
    onclick={handleDrawerClick}
    onkeydown={handleKeydown}
  >
    <div class="navigation-drawer__panel">
      <div class="navigation-drawer__close-row">
        <button
          class="navigation-drawer__close-button"
          type="button"
          aria-label={normalizedCloseButtonLabel}
          bind:this={closeButtonElement}
          onclick={handleCloseButtonClick}
        >
          <span class="navigation-drawer__close-state" aria-hidden="true"></span>
          <span class="navigation-drawer__close-icon" aria-hidden="true">
            <Close />
          </span>
        </button>
      </div>

      <NavigationMenu
        class="navigation-drawer__menu"
        {sections}
        {activeHref}
        ariaLabel={normalizedNavigationLabel}
        onnavigate={handleNavigate}
      />
    </div>
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
    --navigation-drawer-panel-current-inline-size: 100%;
    --navigation-drawer-panel-padding-block: var(--navigation-drawer-menu-button-block-start)
      var(--space-section-block-lg);
    --navigation-drawer-panel-padding-inline: var(--navigation-drawer-header-inline);
    --navigation-drawer-panel-border-radius: 0;

    position: fixed;
    inset: 0;
    z-index: 1000;
    overflow: hidden;
    background: rgba(0, 0, 0, 0.45);
    background: color-mix(in srgb, var(--color-scrim) 45%, transparent);
  }

  .navigation-drawer__panel {
    position: absolute;
    inset-block: 0;
    inset-inline-start: 0;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    inline-size: var(--navigation-drawer-panel-current-inline-size);
    min-block-size: 100%;
    max-block-size: 100dvh;
    padding-block: var(--navigation-drawer-panel-padding-block);
    padding-inline: var(--navigation-drawer-panel-padding-inline);
    overflow-y: auto;
    overscroll-behavior: contain;
    border-radius: var(--navigation-drawer-panel-border-radius);
    background: var(--color-surface-container);
    color: var(--color-on-surface);
    box-shadow: var(--effect-elevation-4);
    -webkit-overflow-scrolling: touch;
  }

  .navigation-drawer__close-row {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    inline-size: 100%;
    padding-block-end: var(--space-200);
  }

  .navigation-drawer__close-button {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    inline-size: 80px;
    min-inline-size: 64px;
    block-size: 48px;
    padding: 0;
    border: 0;
    border-radius: var(--radius-full);
    background: transparent;
    color: var(--color-on-surface);
    cursor: pointer;
    font: inherit;
    -webkit-tap-highlight-color: transparent;
  }

  .navigation-drawer__close-state {
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background: var(--color-state-on-surface-08);
    opacity: 0;
    pointer-events: none;
  }

  .navigation-drawer__close-icon {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    inline-size: 32px;
    block-size: 32px;
    font-size: 32px;
  }

  @media (hover: hover) and (pointer: fine) {
    .navigation-drawer__close-button:hover .navigation-drawer__close-state {
      opacity: 1;
    }
  }

  .navigation-drawer__close-button:active .navigation-drawer__close-state {
    background: var(--color-state-on-surface-12);
    opacity: 1;
  }

  .navigation-drawer__close-button:focus-visible {
    outline: var(--focus-outline-width) solid var(--color-focus);
    outline-offset: 4px;
  }

  .navigation-drawer__close-button:focus-visible .navigation-drawer__close-state {
    background: var(--color-state-on-surface-12);
    opacity: 1;
  }

  @media (min-width: 632px) {
    .navigation-drawer {
      --navigation-drawer-menu-button-block-offset: clamp(8.5px, calc(7vw - 24px), 24px);
      --navigation-drawer-panel-block-start: calc(
        var(--navigation-drawer-menu-button-block-start) - var(--navigation-drawer-panel-padding)
      );
      --navigation-drawer-panel-max-block-size: max(
        var(--radius-xl),
        calc(
          100dvh - var(--navigation-drawer-panel-block-start) -
            var(--navigation-drawer-panel-block-end-gap)
        )
      );
      --navigation-drawer-panel-current-inline-size: var(--navigation-drawer-panel-inline-size);
      --navigation-drawer-panel-padding-block: var(--navigation-drawer-panel-padding);
      --navigation-drawer-panel-padding-inline: var(--navigation-drawer-panel-padding);
      --navigation-drawer-panel-border-radius: var(--radius-xl);
    }

    .navigation-drawer__panel {
      inset-block-start: var(--navigation-drawer-panel-block-start);
      inset-block-end: auto;
      inset-inline-start: calc(
        var(--navigation-drawer-header-inline) - var(--navigation-drawer-panel-padding)
      );
      min-block-size: 0;
      max-block-size: var(--navigation-drawer-panel-max-block-size);
    }
  }

  @media (min-width: 1015px) {
    .navigation-drawer {
      --navigation-drawer-menu-button-block-offset: 24px;
    }
  }

  @media (min-width: 1176px) {
    .navigation-drawer__panel {
      inset-inline-start: calc(
        50% - (var(--size-rail-md) / 2) + var(--space-gutter) -
          var(--navigation-drawer-panel-padding)
      );
    }
  }
</style>
