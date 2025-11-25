<script lang="ts">
  /**
   * BadgeGroup component for displaying multiple badges in a flexible layout
   *
   * Wraps badges in a responsive flex container with consistent spacing.
   * Use with Badge components as children.
   *
   * @slot default - Badge components to display in the group
   */
  import type { Snippet } from 'svelte';

  let {
    children,
  }: {
    children?: Snippet;
  } = $props();
</script>

<div class="badge-group">
  {@render children?.()}
</div>

<style>
  .badge-group {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-gutter-tight);
    padding-block-end: var(--space-200);
  }
</style>
