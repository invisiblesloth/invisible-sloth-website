<script lang="ts">
  /**
   * ProductStatus
   *
   * Quiet product-page status panel for short explanatory status copy.
   * The public API is intentionally narrow: only visible text and a root class
   * hook are supported.
   *
   * @prop {string} text - Required visible status text, trimmed at the boundary
   * @prop {string} class - Additional CSS classes for the root wrapper
   */
  import { warnOnce } from '../lib/devWarnings';

  let {
    text,
    class: className = '',
  }: {
    text: string;
    class?: string;
  } = $props();

  const normalizedText = $derived(typeof text === 'string' ? text.trim() : '');
  const hasText = $derived(normalizedText.length > 0);
  const normalizedClassName = $derived(String(className ?? '').trim());
  const productStatusClasses = $derived(
    ['product-status', normalizedClassName].filter(Boolean).join(' ')
  );

  $effect(() => {
    if (!hasText) {
      warnOnce(
        'product-status:blank-text',
        '[ProductStatus] `text` must be a non-empty string after trimming. Rendering nothing.'
      );
    }
  });
</script>

{#if hasText}
  <div class={productStatusClasses}>
    <div class="product-status__rail">
      <div class="product-status__panel">
        <p class="product-status__text text-body-responsive">{normalizedText}</p>
      </div>
    </div>
  </div>
{/if}

<style>
  .product-status {
    display: flex;
    flex-direction: column;
    align-items: center;
    inline-size: 100%;
    padding-block-end: var(--space-section-block);
  }

  .product-status__rail {
    box-sizing: border-box;
    inline-size: 100%;
    margin-inline: auto;
    padding-inline: var(--space-rail-inline);
  }

  .product-status__panel {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    box-sizing: border-box;
    inline-size: 100%;
    padding: var(--space-400) var(--space-600);
    border-radius: var(--radius-sm);
    background: var(--color-secondary-container);
    color: var(--color-on-secondary-container);
  }

  .product-status__text {
    inline-size: 100%;
    min-inline-size: 0;
    margin: 0;
    overflow-wrap: break-word;
    word-break: normal;
  }

  @media (min-width: 1176px) {
    .product-status__rail {
      max-inline-size: var(--size-rail-sm);
      padding-inline: 0;
    }
  }
</style>
