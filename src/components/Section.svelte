<script lang="ts">
  /**
   * Section component for page sections with responsive spacing
   * Uses the new rail-based layout system
   *
   * @prop {string} as - HTML element to render (default: 'section')
   * @prop {boolean} bleed - Make section full-bleed (default: false)
   * @prop {string} class - Additional CSS classes
   */
  let {
    as = 'section',
    bleed = false,
    class: className = '',
  }: {
    as?: 'section' | 'div' | 'article' | 'main' | 'aside';
    bleed?: boolean;
    class?: string;
  } = $props();

  const sectionClasses = [
    'section',
    bleed && 'section--full-bleed',
    className
  ].filter(Boolean).join(' ');
</script>

<svelte:element this={as} class={sectionClasses}>
  <slot />
</svelte:element>

<style>
  /* Layout utility classes are imported from src/styles/layout.css */
  /* This component is a thin wrapper for convenience */
</style>
