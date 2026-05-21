<script lang="ts">
  import type { Snippet } from 'svelte';

  let {
    children,
    class: className = '',
  }: {
    children?: Snippet;
    class?: string;
  } = $props();

  const rootClasses = $derived(['header-root', className].filter(Boolean).join(' '));
</script>

<header class={rootClasses}>
  {@render children?.()}
</header>

<style>
  .header-root {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-400);
    inline-size: 100%;
    padding-block-end: var(--space-section-block);
    color: var(--color-on-surface);
  }
</style>
