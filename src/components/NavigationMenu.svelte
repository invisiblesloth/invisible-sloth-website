<script lang="ts">
  import Close from '../icons/Close.svelte';
  import {
    normalizeHref,
    normalizeRelForTarget,
    normalizeTarget,
  } from '../lib/linkBehavior';
  import type { NavigationItem, NavigationSection } from '../lib/navigation';

  type ResolvedNavigationItem = NavigationItem & {
    href: string;
    label: string;
    target?: string;
    rel?: string;
  };

  type ResolvedNavigationSection = {
    heading?: string;
    items: ResolvedNavigationItem[];
  };

  let {
    sections = [],
    activeHref = undefined,
    closeButtonLabel = 'Close navigation menu',
    onclose = undefined,
    onClose = undefined,
    onnavigate = undefined,
    onNavigate = undefined,
    class: className = '',
  }: {
    sections?: NavigationSection[];
    activeHref?: string;
    closeButtonLabel?: string;
    onclose?: (event?: MouseEvent) => void;
    onClose?: (event?: MouseEvent) => void;
    onnavigate?: (event: MouseEvent, item: NavigationItem) => void;
    onNavigate?: (event: MouseEvent, item: NavigationItem) => void;
    class?: string;
  } = $props();

  const normalizedActiveHref = $derived(normalizeHref(activeHref));
  const normalizedCloseButtonLabel = $derived(
    closeButtonLabel.trim() || 'Close navigation menu'
  );
  const menuClasses = $derived(['navigation-menu', className].filter(Boolean).join(' '));
  const closeCallback = $derived(onclose ?? onClose);
  const navigateCallback = $derived(onnavigate ?? onNavigate);

  const resolvedSections = $derived<ResolvedNavigationSection[]>(
    sections
      .map((section) => {
        const resolvedItems = section.items
          .map((item) => {
            const label = item.label.trim();
            const href = normalizeHref(item.href);

            if (!label || !href) {
              return undefined;
            }

            const target = normalizeTarget(item.target);
            const rel = normalizeRelForTarget(target, item.rel);

            return {
              ...item,
              label,
              href,
              target,
              rel,
            };
          })
          .filter((item): item is ResolvedNavigationItem => Boolean(item));

        return {
          heading: section.heading?.trim() || undefined,
          items: resolvedItems,
        };
      })
      .filter((section) => section.items.length > 0)
  );

  function handleClose(event: MouseEvent): void {
    event.stopPropagation();
    closeCallback?.(event);
  }

  function handleNavigate(event: MouseEvent, item: ResolvedNavigationItem): void {
    navigateCallback?.(event, item);
  }
</script>

<div class={menuClasses}>
  <div class="navigation-menu__close-row">
    <button
      class="navigation-menu__close-button"
      type="button"
      aria-label={normalizedCloseButtonLabel}
      data-navigation-menu-close
      onclick={handleClose}
    >
      <span class="navigation-menu__close-state" aria-hidden="true"></span>
      <span class="navigation-menu__close-icon" aria-hidden="true">
        <Close />
      </span>
    </button>
  </div>

  {#if resolvedSections.length > 0}
    <nav class="navigation-menu__sections" aria-label="Site navigation">
      {#each resolvedSections as section, sectionIndex}
        {#if sectionIndex > 0}
          <div class="navigation-menu__divider-row" aria-hidden="true">
            <div class="navigation-menu__divider"></div>
          </div>
        {/if}

        {#if section.heading}
          <div class="navigation-menu__section-heading-row">
            <p class="navigation-menu__section-heading text-title-small-prominent">
              {section.heading}
            </p>
          </div>
        {/if}

        <div class="navigation-menu__group">
          {#each section.items as item}
            {@const isActive = normalizedActiveHref === item.href}
            <a
              class="navigation-menu__item text-label-large"
              class:navigation-menu__item--active={isActive}
              href={item.href}
              target={item.target}
              rel={item.rel}
              aria-current={isActive ? 'page' : undefined}
              onclick={(event) => handleNavigate(event, item)}
            >
              <span class="navigation-menu__item-state" aria-hidden="true"></span>
              <span class="navigation-menu__item-label">{item.label}</span>
            </a>
          {/each}
        </div>
      {/each}
    </nav>
  {/if}
</div>

<style>
  .navigation-menu {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    inline-size: var(--navigation-menu-inline-size, min(100%, 360px));
    padding-block: var(--navigation-menu-padding-block, var(--space-300));
    padding-inline: var(--navigation-menu-padding-inline, var(--space-300));
    border-radius: var(--navigation-menu-border-radius, var(--radius-xl));
    background: var(--color-surface-container);
    color: var(--color-on-surface);
    box-shadow: var(--effect-elevation-4);
  }

  .navigation-menu__close-row {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    inline-size: 100%;
    padding-block-end: var(--space-200);
  }

  .navigation-menu__close-button {
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

  .navigation-menu__close-state {
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background: var(--color-state-on-surface-08);
    opacity: 0;
    pointer-events: none;
  }

  .navigation-menu__close-icon {
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
    .navigation-menu__close-button:hover .navigation-menu__close-state {
      opacity: 1;
    }
  }

  .navigation-menu__close-button:active .navigation-menu__close-state {
    background: var(--color-state-on-surface-12);
    opacity: 1;
  }

  .navigation-menu__close-button:focus-visible {
    outline: var(--focus-outline-width) solid var(--color-focus);
    outline-offset: 4px;
  }

  .navigation-menu__close-button:focus-visible .navigation-menu__close-state {
    background: var(--color-state-on-surface-12);
    opacity: 1;
  }

  .navigation-menu__sections {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    inline-size: 100%;
  }

  .navigation-menu__section-heading-row,
  .navigation-menu__divider-row {
    display: flex;
    align-items: center;
    inline-size: 100%;
    block-size: 48px;
    overflow: hidden;
    border-radius: var(--radius-full);
  }

  .navigation-menu__section-heading-row {
    padding-block: var(--space-400);
    padding-inline: var(--space-600) var(--space-400);
  }

  .navigation-menu__section-heading {
    margin: 0;
    color: var(--color-on-surface);
    white-space: nowrap;
  }

  .navigation-menu__divider-row {
    justify-content: center;
    padding-block: var(--space-400);
    padding-inline: var(--space-600);
  }

  .navigation-menu__divider {
    inline-size: 100%;
    block-size: 1px;
    background: var(--color-outline-variant);
  }

  .navigation-menu__group {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-100);
    inline-size: 100%;
  }

  .navigation-menu__item {
    --navigation-menu-item-state-hover: var(--color-state-on-surface-dim-08);
    --navigation-menu-item-state-focus: var(--color-state-on-surface-dim-08);
    --navigation-menu-item-state-pressed: var(--color-state-on-surface-dim-16);

    position: relative;
    display: flex;
    align-items: center;
    inline-size: 100%;
    min-inline-size: 0;
    block-size: 48px;
    padding-block: var(--space-400);
    padding-inline: var(--space-600);
    border-radius: var(--radius-full);
    color: var(--color-on-surface-dim);
    text-decoration: none;
    overflow: hidden;
    -webkit-tap-highlight-color: transparent;
  }

  .navigation-menu__item-state {
    position: absolute;
    inset: 0;
    z-index: 0;
    border-radius: inherit;
    background: var(--navigation-menu-item-state-hover);
    opacity: 0;
    pointer-events: none;
  }

  .navigation-menu__item-label {
    position: relative;
    z-index: 1;
    min-inline-size: 0;
  }

  .navigation-menu__item--active {
    --navigation-menu-item-state-hover: var(--color-state-on-tertiary-container-08);
    --navigation-menu-item-state-focus: var(--color-state-on-tertiary-container-08);
    --navigation-menu-item-state-pressed: var(--color-state-on-tertiary-container-16);

    background: var(--color-inverse-tertiary);
    color: var(--color-on-tertiary-container);
    font-weight: var(--typography-label-large-weight-prominent);
  }

  @media (hover: hover) and (pointer: fine) {
    .navigation-menu__item:hover .navigation-menu__item-state {
      background: var(--navigation-menu-item-state-hover);
      opacity: 1;
    }
  }

  .navigation-menu__item:focus-visible {
    outline: var(--focus-outline-width) solid var(--color-focus);
    outline-offset: 2px;
  }

  .navigation-menu__item:focus-visible .navigation-menu__item-state {
    background: var(--navigation-menu-item-state-focus);
    opacity: 1;
  }

  .navigation-menu__item:active .navigation-menu__item-state,
  .navigation-menu__item:hover:active .navigation-menu__item-state,
  .navigation-menu__item:focus-visible:active .navigation-menu__item-state,
  .navigation-menu__item:focus-visible:hover:active .navigation-menu__item-state {
    background: var(--navigation-menu-item-state-pressed);
    opacity: 1;
  }
</style>
