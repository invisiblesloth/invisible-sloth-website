<!--
/**
 * PostDate
 *
 * Content-only publication date atom that renders preformatted,
 * human-readable metadata text inside a semantic <time> element.
 *
 * @prop {string} date - Required human-readable date text rendered as provided
 * @prop {string} dateTime - Optional machine-readable value mapped to the datetime attribute
 * @prop {string} class - Additional CSS classes for the root time element
 */
-->
<script lang="ts">
  let {
    date,
    dateTime,
    class: className = '',
  }: {
    date: string;
    dateTime?: string;
    class?: string;
  } = $props();

  const validatedDate = $derived.by(() => {
    const normalizedDate = String(date ?? '').trim();

    if (normalizedDate.length === 0) {
      throw new Error('PostDate requires a non-empty date.');
    }

    return normalizedDate;
  });

  const normalizedDateTime = $derived.by(() => {
    const value = String(dateTime ?? '').trim();
    return value.length > 0 ? value : undefined;
  });

  const postDateClasses = $derived(['post-date', className].filter(Boolean).join(' '));
</script>

<time class={postDateClasses} datetime={normalizedDateTime}>
  {validatedDate}
</time>

<style>
  .post-date {
    display: block;
    inline-size: 100%;
    margin: 0;
    padding-block: var(--space-100);
    color: var(--color-on-surface);
    text-align: start;
    /* Metadata text treatment; not part of page/section heading scale. */
    font-family: var(--typography-title-medium-family);
    font-size: var(--typography-title-medium-size);
    font-weight: var(--typography-title-medium-weight);
    line-height: var(--typography-title-medium-line-height);
    letter-spacing: var(--typography-title-medium-letter-spacing);
  }

  @media (min-width: 1015px) {
    .post-date {
      font-family: var(--typography-title-large-family);
      font-size: var(--typography-title-large-size);
      font-weight: var(--typography-title-large-weight);
      line-height: var(--typography-title-large-line-height);
      letter-spacing: var(--typography-title-large-letter-spacing);
    }
  }
</style>
