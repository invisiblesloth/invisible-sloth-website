<script module lang="ts">
  import type { FigureCaptionContent } from '../../FigureCaption.svelte';
  import type { FigureImageProps } from '../../Figure.svelte';

  export type HeaderImageProps = Omit<
    FigureImageProps,
    'class' | 'decorative' | 'frame' | 'fit' | 'ratio' | 'radius' | 'containSizing'
  >;

  export type HeaderMedia = FigureCaptionContent & {
    image: HeaderImageProps;
  };
</script>

<script lang="ts">
  import Figure from '../../Figure.svelte';
  import type { FigureMediaTreatment } from '../../Figure.svelte';
  import { warnOnce } from '../../../lib/devWarnings';
  import HeaderRail from './HeaderRail.svelte';

  type RuntimeHeaderMedia = FigureCaptionContent & {
    image?: unknown;
    [key: string]: unknown;
  };

  type RuntimeHeaderImageProps = HeaderImageProps & {
    class?: unknown;
    decorative?: unknown;
    frame?: unknown;
    fit?: unknown;
    ratio?: unknown;
    radius?: unknown;
    containSizing?: unknown;
  };

  function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }

  function getRuntimeMedia(value: unknown): RuntimeHeaderMedia | undefined {
    return isRecord(value) ? (value as RuntimeHeaderMedia) : undefined;
  }

  function sanitizeImageProps(value: unknown): HeaderImageProps {
    const runtimeImage = value as RuntimeHeaderImageProps;
    const {
      class: _ignoredClass,
      decorative: _ignoredDecorative,
      frame: _ignoredFrame,
      fit: _ignoredFit,
      ratio: _ignoredRatio,
      radius: _ignoredRadius,
      containSizing: _ignoredContainSizing,
      ...rest
    } = runtimeImage;

    return rest as HeaderImageProps;
  }

  let {
    media = undefined,
    mediaTreatment,
    componentLabel,
    warningNamespace,
  }: {
    media?: unknown;
    mediaTreatment: FigureMediaTreatment;
    componentLabel: string;
    warningNamespace: string;
  } = $props();

  const runtimeMedia = $derived(getRuntimeMedia(media));
  const imageIsObject = $derived(isRecord(runtimeMedia?.image));
  const imageProps = $derived(imageIsObject ? sanitizeImageProps(runtimeMedia?.image) : undefined);
  const hasImageSource = $derived(String(imageProps?.src ?? '').trim().length > 0);

  $effect(() => {
    if (media == null) {
      return;
    }

    if (!runtimeMedia) {
      warnOnce(
        `${warningNamespace}:invalid-media`,
        `${componentLabel} \`media\` must be an object. Rendering without media.`
      );
      return;
    }

    if (!imageIsObject) {
      warnOnce(
        `${warningNamespace}:invalid-media-image`,
        `${componentLabel} \`media.image\` must be an object. Rendering without media.`
      );
    }
  });
</script>

{#if hasImageSource && imageProps}
  <HeaderRail kind="image">
    <Figure
      imageProps={imageProps}
      {mediaTreatment}
      captionText={runtimeMedia?.captionText}
      creditText={runtimeMedia?.creditText}
      caption={runtimeMedia?.caption}
      credit={runtimeMedia?.credit}
    />
  </HeaderRail>
{/if}
