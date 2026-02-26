<!--
/**
 * Figure
 * Composes Image and FigureCaption into a semantic figure block.
 *
 * API note:
 * - Figure v1 intentionally does not forward arbitrary root figure attributes.
 * - Use `class` for root-level styling hooks.
 *
 * Accessibility:
 * - When imageProps.decorative is not true, provide meaningful imageProps.alt.
 */
-->
<script lang="ts">
  import type { ComponentProps, Snippet } from 'svelte';
  import FigureCaption from './FigureCaption.svelte';
  import Image from './Image.svelte';

  type ImageProps = ComponentProps<typeof Image>;

  let {
    imageProps,
    captionText = '',
    creditText = '',
    caption,
    credit,
    class: className = '',
  }: {
    imageProps: ImageProps;
    captionText?: string;
    creditText?: string;
    caption?: Snippet;
    credit?: Snippet;
    class?: string;
  } = $props();

  const resolvedImageProps = $derived(imageProps ?? ({} as ImageProps));
  const imagePropsWithoutClass = $derived.by(() => {
    const { class: _imageClass = '', ...rest } = resolvedImageProps;
    return rest;
  });
  const imageClassName = $derived.by(() => {
    const externalClass = (resolvedImageProps.class ?? '').trim();
    return ['figure__image', externalClass].filter(Boolean).join(' ');
  });
  const figureClasses = $derived(['figure', className].filter(Boolean).join(' '));
</script>

<figure class={figureClasses}>
  <Image {...imagePropsWithoutClass} class={imageClassName} />
  <FigureCaption {captionText} {creditText} {caption} {credit} />
</figure>

<style>
  .figure {
    display: flex;
    flex-direction: column;
    align-items: center;
    inline-size: 100%;
    margin-inline: auto;
    gap: var(--space-100);
  }

  .figure__image {
    inline-size: 100%;
  }

  .figure > :global(.figure-caption) {
    margin-block-start: 0;
  }

  @media (min-width: 632px) {
    .figure {
      gap: var(--space-200);
    }
  }

  @media (min-width: 1176px) {
    .figure > :global(.figure-caption) {
      max-inline-size: var(--size-rail-sm);
    }
  }
</style>
