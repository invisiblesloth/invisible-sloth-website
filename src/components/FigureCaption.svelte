<!--
/**
 * FigureCaption
 * Semantic caption/credit renderer for figure media.
 *
 * Render directly inside a <figure>. Rich snippet links are caller-authored
 * content and should opt into the shared .text-link utility when needed.
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
<script module lang="ts">
  import type { Snippet } from 'svelte';

  export type FigureCaptionContent = {
    captionText?: string;
    creditText?: string;
    caption?: Snippet;
    credit?: Snippet;
  };

  type Props = FigureCaptionContent & {
    class?: string;
  };
</script>

<script lang="ts">
  let {
    captionText = '',
    creditText = '',
    caption,
    credit,
    class: className = '',
  }: Props = $props();

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
    inline-size: 100%;
    margin-inline: auto;
    /* Parent figure compositions can constrain caption measure without
       selecting FigureCaption internals. */
    max-inline-size: var(--figure-caption-max-inline-size, none);
    text-align: center;
    color: var(--color-on-surface-dim);
  }

  .figure-caption__caption,
  .figure-caption__credit {
    margin: 0;
    inline-size: 100%;
  }
</style>
