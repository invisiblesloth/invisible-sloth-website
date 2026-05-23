<script lang="ts">
  import { normalizeHref } from '../lib/linkBehavior';
  import {
    resolveNavigationSections,
    type NavigationSection,
    type ResolvedNavigationItem,
    type ResolvedNavigationSection,
  } from '../lib/navigation';

  function normalizeLabel(value: unknown, fallback: string): string {
    return typeof value === 'string' ? value.trim() || fallback : fallback;
  }

  let {
    sections = [],
    activeHref = undefined,
    ariaLabel = 'Site navigation',
    onnavigate = undefined,
    onNavigate = undefined,
    class: className = '',
  }: {
    sections?: NavigationSection[];
    activeHref?: string;
    ariaLabel?: string;
    onnavigate?: (event: MouseEvent, item: ResolvedNavigationItem) => void;
    onNavigate?: (event: MouseEvent, item: ResolvedNavigationItem) => void;
    class?: string;
  } = $props();

  const normalizedActiveHref = $derived(normalizeHref(activeHref));
  const normalizedAriaLabel = $derived(normalizeLabel(ariaLabel, 'Site navigation'));
  const menuClasses = $derived(['navigation-menu', className].filter(Boolean).join(' '));
  const navigateCallback = $derived(onnavigate ?? onNavigate);

  const resolvedSections = $derived<ResolvedNavigationSection[]>(
    resolveNavigationSections(sections)
  );

  function handleNavigate(event: MouseEvent, item: ResolvedNavigationItem): void {
    navigateCallback?.(event, item);
  }
</script>

{#if resolvedSections.length > 0}
  <nav class={menuClasses} aria-label={normalizedAriaLabel}>
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

<style>
  .navigation-menu {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    inline-size: var(--navigation-menu-inline-size, 100%);
    color: var(--color-on-surface);
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
