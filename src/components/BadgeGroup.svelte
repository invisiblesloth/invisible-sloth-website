<script module lang="ts">
  import type { Snippet } from 'svelte';

  export type BadgeGroupProps = {
    children?: Snippet;
    class?: string;
  };
</script>

<script lang="ts">
  /**
   * BadgeGroup component for displaying multiple badges in a flexible layout
   *
   * Wraps badges in a responsive flex container with consistent spacing.
   * Use with Badge components as children.
   * Root-hook component: `class` is appended to the root <div> for
   * layout hooks, global utilities, and global selectors.
   *
   * @slot default - Badge components to display in the group
   */
  let {
    children,
    class: className = '',
  }: BadgeGroupProps = $props();

  const normalizedClassName = $derived(String(className ?? '').trim());
  const badgeGroupClasses = $derived(
    ['badge-group', normalizedClassName].filter(Boolean).join(' ')
  );
</script>

<div class={badgeGroupClasses}>
  {@render children?.()}
</div>

<style>
  .badge-group {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-gutter-tight);
  }
</style>
