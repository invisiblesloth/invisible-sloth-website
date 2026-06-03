<script module lang="ts">
  import type { Snippet } from 'svelte';

  export type TagGroupProps = {
    children?: Snippet;
    class?: string;
    [key: string]: unknown;
  };
</script>

<script lang="ts">
  /**
   * TagGroup
   *
   * Wraps tags with consistent internal row and column gaps. Parent
   * compositions own outer vertical spacing and padding.
   * Existing broader root forwarding is part of the public root-hook contract:
   * class and rest props land on the root <div>.
   */
  let {
    children,
    class: className = '',
    ...restProps
  }: TagGroupProps = $props();

  const groupClasses = $derived(['tag-group', className].filter(Boolean).join(' '));
</script>

<div {...restProps} class={groupClasses}>
  {@render children?.()}
</div>

<style>
  .tag-group {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-start;
    row-gap: var(--space-300);
    column-gap: var(--space-200);
  }

  @media (min-width: 1015px) {
    .tag-group {
      row-gap: var(--space-400);
      column-gap: var(--space-300);
    }
  }
</style>
