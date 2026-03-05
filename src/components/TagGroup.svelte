<script lang="ts">
  import type { Snippet } from 'svelte';

  let {
    children,
    class: className = '',
    ...restProps
  }: {
    children?: Snippet;
    class?: string;
    [key: string]: unknown;
  } = $props();

  const groupClasses = $derived(['tag-group', className].filter(Boolean).join(' '));
</script>

<div class={groupClasses} {...restProps}>
  {@render children?.()}
</div>

<style>
  .tag-group {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-start;
    row-gap: var(--space-300);
    column-gap: var(--space-200);
    padding-block: var(--space-100);
  }

  @media (min-width: 1015px) {
    .tag-group {
      row-gap: var(--space-400);
      column-gap: var(--space-300);
    }
  }
</style>
