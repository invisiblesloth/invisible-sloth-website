<!--
/**
 * Figure
 * Composes Image and FigureCaption into a semantic figure block.
 *
 * API note:
 * - Figure v1 intentionally does not forward arbitrary root figure attributes.
 * - Use `class` for root-level styling hooks.
 * - `imageProps.class` is unsupported; Figure owns Image styling internally.
 * - The default and featured-art treatments preserve the full image and rely on
 *   Image for corner radius defaults; use featured-cover only for intentional
 *   photo cropping.
 * - Rich caption/credit snippets are caller-authored content; use `.text-link`
 *   for links when the shared inline link treatment is needed.
 *
 * Accessibility:
 * - When imageProps.decorative is not true, provide meaningful imageProps.alt.
 */
-->
<script module lang="ts">
  import Image, { type ImageProps } from './Image.svelte';

  export type FigureImageProps = Omit<ImageProps, 'class'>;
  export const FIGURE_MEDIA_TREATMENTS = [
    'default',
    'wide-contain',
    'featured-art',
    'featured-cover',
  ] as const;
  export type FigureMediaTreatment = (typeof FIGURE_MEDIA_TREATMENTS)[number];
</script>

<script lang="ts">
  import FigureCaption from './FigureCaption.svelte';
  import type { FigureCaptionContent } from './FigureCaption.svelte';
  import { warnOnce } from '../lib/devWarnings';

  type RuntimeFigureImageProps = Partial<FigureImageProps> & { class?: string };
  type Props = FigureCaptionContent & {
    imageProps: FigureImageProps;
    mediaTreatment?: FigureMediaTreatment;
    class?: string;
  };

  const getRuntimeImageProps = (value: unknown): RuntimeFigureImageProps => {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      return {};
    }

    return value as RuntimeFigureImageProps;
  };

  const isFigureMediaTreatment = (value: unknown): value is FigureMediaTreatment =>
    typeof value === 'string' &&
    (FIGURE_MEDIA_TREATMENTS as readonly string[]).includes(value);

  let {
    imageProps,
    captionText = '',
    creditText = '',
    caption,
    credit,
    mediaTreatment: requestedMediaTreatment = 'default',
    class: className = '',
  }: Props = $props();

  const sanitizedImageProps = $derived.by((): FigureImageProps => {
    const runtimeImageProps = getRuntimeImageProps(imageProps);
    const { class: _ignoredClass = '', ...rest } = runtimeImageProps;
    return rest as FigureImageProps;
  });
  const mediaTreatment = $derived(
    isFigureMediaTreatment(requestedMediaTreatment) ? requestedMediaTreatment : 'default'
  );
  const resolvedImageProps = $derived.by((): FigureImageProps => {
    if (mediaTreatment === 'wide-contain') {
      return {
        ...sanitizedImageProps,
        decorative: false,
        frame: 'auto',
        fit: 'contain',
        containSizing: 'fill-inline',
      };
    }

    if (mediaTreatment === 'featured-cover') {
      return {
        ...sanitizedImageProps,
        frame: 'ratio',
        ratio: '3:2',
        fit: 'cover',
        radius: 'small',
      };
    }

    if (mediaTreatment === 'featured-art') {
      return {
        ...sanitizedImageProps,
        frame: 'auto',
        fit: 'contain',
        containSizing: 'fill-inline',
      };
    }

    return {
      ...sanitizedImageProps,
      frame: 'auto',
      fit: 'contain',
    };
  });
  const hasPrimarySource = $derived(String(sanitizedImageProps.src ?? '').trim().length > 0);
  const figureClasses = $derived(['figure', className].filter(Boolean).join(' '));

  $effect(() => {
    if (requestedMediaTreatment !== mediaTreatment) {
      warnOnce(
        'figure:invalid-media-treatment',
        `[Figure] \`mediaTreatment\` must be one of ${FIGURE_MEDIA_TREATMENTS.map((treatment) => `"${treatment}"`).join(', ')}. Falling back to "default".`
      );
    }
  });
</script>

{#if hasPrimarySource}
  <figure class={figureClasses}>
    <Image {...resolvedImageProps} class="figure__image" />
    <FigureCaption {captionText} {creditText} {caption} {credit} />
  </figure>
{/if}

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

  @media (min-width: 632px) {
    .figure {
      gap: var(--space-200);
    }
  }

</style>
