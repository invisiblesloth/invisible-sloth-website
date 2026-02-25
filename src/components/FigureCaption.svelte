<!--
/**
 * FigureCaption
 * Semantic caption/credit renderer for figure media.
 *
 * Note: Line wrappers intentionally use <div> (not <p>) so snippet content
 * can safely include richer markup without invalid paragraph nesting.
 *
 * @prop {string} captionText - Plain-text caption fallback
 * @prop {string} creditText - Plain-text credit fallback
 * @prop {Snippet} caption - Optional rich caption snippet
 * @prop {Snippet} credit - Optional rich credit snippet
 * @prop {string} class - Additional CSS classes
 */
-->
<script lang="ts">
  import type { Snippet } from 'svelte';

  let {
    captionText = '',
    creditText = '',
    caption,
    credit,
    class: className = '',
  }: {
    captionText?: string;
    creditText?: string;
    caption?: Snippet;
    credit?: Snippet;
    class?: string;
  } = $props();

  const hasCaptionContent = $derived(Boolean(caption) || String(captionText ?? '').trim().length > 0);
  const hasCreditContent = $derived(Boolean(credit) || String(creditText ?? '').trim().length > 0);
  const hasVisibleContent = $derived(hasCaptionContent || hasCreditContent);

  const figureCaptionClasses = $derived(
    ['figure-caption', 'text-body-small', className].filter(Boolean).join(' ')
  );
</script>

{#if hasVisibleContent}
  <!-- svelte-ignore a11y_figcaption_parent (component is intended for use directly inside <figure>) -->
  <figcaption class={figureCaptionClasses}>
    {#if hasCaptionContent}
      <div class="figure-caption__caption">
        {#if caption}
          {@render caption()}
        {:else}
          {captionText}
        {/if}
      </div>
    {/if}

    {#if hasCreditContent}
      <div class="figure-caption__credit">
        {#if credit}
          {@render credit()}
        {:else}
          {creditText}
        {/if}
      </div>
    {/if}
  </figcaption>
{/if}

<style>
  .figure-caption {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-50);
    width: 100%;
    text-align: center;
    color: var(--color-on-surface-dim);
  }

  .figure-caption__caption,
  .figure-caption__credit {
    margin: 0;
    width: 100%;
  }

  .figure-caption :global(a) {
    color: var(--color-on-surface);
  }
</style>
