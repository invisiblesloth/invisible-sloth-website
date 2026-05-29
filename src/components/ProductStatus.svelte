<script lang="ts">
  /**
   * ProductStatus
   *
   * Quiet product-page status panel for short explanatory status copy. Parent
   * composition owns rails, placement, and section rhythm.
   * The public API is intentionally narrow: only visible copy and a root/panel
   * styling hook are supported.
   *
   * @prop {string} text - Required visible status text, trimmed at the boundary
   * @prop {string} detail - Optional secondary status detail, trimmed at the boundary
   * @prop {string} class - Additional string classes for the root panel
   */
  import { requireNonEmptyString } from '../lib/componentValidation';

  let {
    text,
    detail = '',
    class: className = '',
  }: {
    text: string;
    detail?: string;
    class?: string;
  } = $props();

  const normalizedText = $derived(
    requireNonEmptyString(text, { componentName: 'ProductStatus', propName: 'text' })
  );
  const normalizedDetail = $derived(typeof detail === 'string' ? detail.trim() : '');
  const hasDetail = $derived(normalizedDetail.length > 0);
  const normalizedClassName = $derived(typeof className === 'string' ? className.trim() : '');
  const productStatusClasses = $derived(
    ['product-status', normalizedClassName].filter(Boolean).join(' ')
  );
</script>

<div class={productStatusClasses}>
  <p class="product-status__text text-body-responsive">
    <strong class="product-status__headline">{normalizedText}</strong>
    {#if hasDetail}
      <span class="product-status__detail">{normalizedDetail}</span>
    {/if}
  </p>
</div>

<style>
  .product-status {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    inline-size: 100%;
    padding: var(--space-400) var(--space-600);
    border-radius: var(--radius-xl);
    background: var(--color-secondary-fixed-dim);
    color: var(--color-on-secondary-fixed-variant);
  }

  .product-status__text {
    inline-size: 100%;
    min-inline-size: 0;
    margin: 0;
    text-align: center;
    overflow-wrap: break-word;
    word-break: normal;
  }

  .product-status__headline,
  .product-status__detail {
    display: block;
    min-inline-size: 0;
  }

  .product-status__headline {
    font-weight: var(--typography-body-medium-weight-prominent);
  }
</style>
