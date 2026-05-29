<script module lang="ts">
  export type { FeatureListItem } from '../lib/featureListItems';
</script>

<script lang="ts">
  /**
   * FeatureList
   *
   * Structured feature copy list for use inside structured ContentSection bodies.
   * Owns runtime item validation and quiet, token-driven list presentation.
   * Existing broader root forwarding is part of the public root-hook contract:
   * list attributes land on the root <ul>.
   *
   * @prop {FeatureListItem[]} items - Feature entries with non-empty title and description
   * @prop {string} class - Additional classes merged onto the root list
   */
  import type { SvelteHTMLElements } from 'svelte/elements';
  import { warnOnce } from '../lib/devWarnings';
  import { resolveFeatureListItems } from '../lib/featureListItems';
  import type { FeatureListItem } from '../lib/featureListItems';

  type ListAttributes = Omit<SvelteHTMLElements['ul'], 'children' | 'class'>;

  type Props = ListAttributes & {
    items?: FeatureListItem[];
    class?: string;
  };

  let {
    items = [],
    role = 'list',
    class: className = '',
    ...restProps
  }: Props = $props();

  const featureListResolution = $derived(resolveFeatureListItems(items));
  const normalizedItems = $derived(featureListResolution.items);
  const hasItems = $derived(normalizedItems.length > 0);
  const normalizedClassName = $derived(String(className ?? '').trim());
  const featureListClasses = $derived(
    ['feature-list', normalizedClassName].filter(Boolean).join(' ')
  );

  $effect(() => {
    if (!featureListResolution.inputWasArray) {
      warnOnce(
        'feature-list:invalid-items',
        '[FeatureList] `items` must be an array. Rendering without features.'
      );
    }

    for (const index of featureListResolution.invalidIndexes) {
      warnOnce(
        `feature-list:invalid-item:${index}`,
        '[FeatureList] Feature items need non-empty title and description values. Skipping invalid feature.'
      );
    }
  });
</script>

{#if hasItems}
  <ul {...restProps} {role} class={featureListClasses}>
    {#each normalizedItems as item (item.index)}
      <li class="feature-list__item">
        <span class="feature-list__title text-title-medium-prominent">{item.title}</span>
        <p class="feature-list__description text-body-responsive-tight">{item.description}</p>
      </li>
    {/each}
  </ul>
{/if}

<style>
  .feature-list.feature-list {
    display: grid;
    gap: var(--space-gutter);
    inline-size: 100%;
    min-inline-size: 0;
    padding-inline-start: 0;
    margin-block: 0;
    list-style: none;
    overflow-wrap: break-word;
  }

  .feature-list__item.feature-list__item {
    display: grid;
    gap: var(--space-100);
    min-inline-size: 0;
    padding-inline-start: 0;
    margin-block-start: 0;
    overflow-wrap: break-word;
  }

  .feature-list__title,
  .feature-list__description {
    min-inline-size: 0;
    overflow-wrap: anywhere;
  }

  .feature-list__title {
    display: block;
    color: var(--color-on-surface);
  }

  @media (min-width: 1015px) {
    .feature-list__title {
      font-family: var(--typography-title-large-family);
      font-size: var(--typography-title-large-size);
      font-weight: var(--typography-title-large-weight-prominent);
      line-height: var(--typography-title-large-line-height);
      letter-spacing: var(--typography-title-large-letter-spacing);
    }
  }

  .feature-list__description {
    margin: 0;
    color: var(--color-on-surface);
  }
</style>
