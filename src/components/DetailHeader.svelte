<script lang="ts">
  /**
   * Detail Header
   *
   * Content-only title and excerpt block for page and post header wrappers.
   *
   * @prop {string} title - Required visible page title text
   * @prop {string} excerpt - Optional supporting excerpt text
   * @prop {string} class - Additional CSS classes for the root wrapper
   */
  let {
    title,
    excerpt,
    class: className = '',
    ...restProps
  }: {
    title: string;
    excerpt?: string;
    class?: string;
    [key: string]: unknown;
  } = $props();

  const validatedTitle = $derived.by(() => {
    if (String(title ?? '').trim().length === 0) {
      throw new Error('DetailHeader requires a non-empty title.');
    }

    return title;
  });

  const hasExcerpt = $derived(String(excerpt ?? '').trim().length > 0);
  const detailHeaderClasses = $derived(['detail-header', className].filter(Boolean).join(' '));
</script>

<div class={detailHeaderClasses} {...restProps}>
  <h1 class="detail-header__title heading-h1">{validatedTitle}</h1>

  {#if hasExcerpt}
    <p class="detail-header__excerpt">{excerpt}</p>
  {/if}
</div>

<style>
  .detail-header {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-200);
    inline-size: 100%;
    color: var(--color-on-surface);
  }

  .detail-header__title,
  .detail-header__excerpt {
    margin: 0;
    inline-size: 100%;
  }

  .detail-header__excerpt {
    font-family: var(--typography-headline-small-family);
    font-size: var(--typography-headline-small-size);
    font-weight: var(--typography-headline-small-weight);
    line-height: var(--typography-headline-small-line-height);
    letter-spacing: var(--typography-headline-small-letter-spacing);
  }

  @media (min-width: 632px) {
    .detail-header__excerpt {
      font-family: var(--typography-headline-medium-family);
      font-size: var(--typography-headline-medium-size);
      font-weight: var(--typography-headline-medium-weight);
      line-height: var(--typography-headline-medium-line-height);
      letter-spacing: var(--typography-headline-medium-letter-spacing);
    }
  }

  @media (min-width: 1015px) {
    .detail-header {
      gap: var(--space-400);
    }

    .detail-header__excerpt {
      font-family: var(--typography-headline-large-family);
      font-size: var(--typography-headline-large-size);
      font-weight: var(--typography-headline-large-weight);
      line-height: var(--typography-headline-large-line-height);
      letter-spacing: var(--typography-headline-large-letter-spacing);
    }
  }
</style>
