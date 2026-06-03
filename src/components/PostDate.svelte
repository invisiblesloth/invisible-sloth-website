<!--
/**
 * PostDate
 *
 * Content-only publication date atom that renders preformatted,
 * human-readable metadata text inside a semantic <time> element.
 *
 * @prop {string} date - Required human-readable date text, trimmed at the boundary
 * @prop {string} dateTime - Optional machine-readable value mapped to the datetime attribute
 * @prop {string} class - Additional CSS classes for the root time element
 */
-->
<script module lang="ts">
  export type PostDateProps = {
    date: string;
    dateTime?: string;
    class?: string;
  };
</script>

<script lang="ts">
  import { requireNonEmptyString } from '../lib/componentValidation';

  let {
    date,
    dateTime,
    class: className = '',
  }: PostDateProps = $props();

  const validatedDate = $derived(
    requireNonEmptyString(date, { componentName: 'PostDate', propName: 'date' })
  );

  const normalizedDateTime = $derived.by(() => {
    const value = String(dateTime ?? '').trim();
    return value.length > 0 ? value : undefined;
  });

  const postDateClasses = $derived(
    ['post-date', 'text-metadata-date-responsive', className].filter(Boolean).join(' ')
  );
</script>

<time class={postDateClasses} datetime={normalizedDateTime}>
  {validatedDate}
</time>

<style>
  .post-date {
    display: block;
    inline-size: 100%;
    margin: 0;
    color: var(--color-on-surface);
    text-align: start;
  }
</style>
