<script lang="ts">
  import {
    IMAGE_DECLARATIVE_MODES,
    IMAGE_ENHANCEMENT_ATTRIBUTES,
    IMAGE_LOAD_STATES,
    IMAGE_LOADING_MODES,
  } from '../lib/imageEnhancementContract';

  /**
   * Image atom for consistent media rendering across layouts.
   *
   * Behavior:
   * - fit="cover" fills the frame and may crop.
   * - fit="contain" shows the whole image inside the frame.
   * - frame="ratio" enforces a fixed aspect ratio.
   * - frame="auto" uses the image's intrinsic dimensions.
   * - frame="clamped" applies aspect ratio with viewport-driven height clamping.
   *
   * Enhancement contract:
   * - Image owns SSR-safe inputs and the initial pending state.
   * - imageLoadingEnhancer owns runtime load state and fallback switching.
   */
  type ImageFit = 'cover' | 'contain';
  type Frame = 'ratio' | 'auto' | 'clamped';
  type AspectRatio = '3:2' | '2:3' | '1:1' | '16:9';
  type Radius = 'none' | 'small' | 'medium' | 'large';
  type LoadingMode = 'lazy' | 'eager';
  type DecodingMode = 'auto' | 'sync' | 'async';
  type FetchPriority = 'auto' | 'high' | 'low';
  type ImageDimension = number | string;

  const RATIO_MAP: Record<AspectRatio, string> = {
    '3:2': '3 / 2',
    '2:3': '2 / 3',
    '1:1': '1 / 1',
    '16:9': '16 / 9',
  };

  const DEFAULT_FALLBACK_SRC = '/assets/image-fallback-default-1024.webp';
  const DEFAULT_FALLBACK_WIDTH = 1024;
  const DEFAULT_FALLBACK_HEIGHT = 683;
  const DEFAULT_FALLBACK_SRCSET = [
    '/assets/image-fallback-default-640.webp 640w',
    '/assets/image-fallback-default-1024.webp 1024w',
    '/assets/image-fallback-default-1512.webp 1512w',
    '/assets/image-fallback-default.webp 3000w',
  ].join(', ');
  const DEFAULT_FALLBACK_SIZES =
    '(min-width: 1176px) 1512px, (min-width: 1015px) 1024px, (min-width: 632px) 744px, 100vw';

  const normalizeDimension = (value?: ImageDimension): string | undefined => {
    if (typeof value === 'number') {
      return Number.isInteger(value) && value > 0 ? String(value) : undefined;
    }

    if (typeof value !== 'string') {
      return undefined;
    }

    const trimmed = value.trim();
    return /^[1-9]\d*$/.test(trimmed) ? trimmed : undefined;
  };

  let {
    src = '',
    srcset = '',
    sizes = '',
    alt = '',
    decorative = false,
    fit = 'cover',
    frame = 'ratio',
    ratio = '3:2',
    minHeight = '220px',
    preferredHeight = '45svh',
    maxHeight = '560px',
    objectPosition = 'center',
    radius = 'small',
    loading = 'lazy',
    decoding = 'async',
    fetchPriority = 'auto',
    width = undefined,
    height = undefined,
    fallbackSrc = DEFAULT_FALLBACK_SRC,
    fallbackSrcset = DEFAULT_FALLBACK_SRCSET,
    fallbackSizes = DEFAULT_FALLBACK_SIZES,
    fallbackAlt = 'Fallback image showing Sloth-Luc, the Invisible Sloth logo character.',
    fallbackWidth = DEFAULT_FALLBACK_WIDTH,
    fallbackHeight = DEFAULT_FALLBACK_HEIGHT,
    class: className = '',
  }: {
    src?: string;
    srcset?: string;
    sizes?: string;
    alt?: string;
    decorative?: boolean;
    fit?: ImageFit;
    frame?: Frame;
    ratio?: AspectRatio;
    minHeight?: string;
    preferredHeight?: string;
    maxHeight?: string;
    objectPosition?: string;
    radius?: Radius;
    loading?: LoadingMode;
    decoding?: DecodingMode;
    fetchPriority?: FetchPriority;
    width?: ImageDimension;
    height?: ImageDimension;
    fallbackSrc?: string;
    fallbackSrcset?: string;
    fallbackSizes?: string;
    fallbackAlt?: string;
    fallbackWidth?: ImageDimension;
    fallbackHeight?: ImageDimension;
    class?: string;
  } = $props();

  const normalizedSrc = $derived(src.trim());
  const normalizedFallbackSrc = $derived(fallbackSrc.trim());
  const hasSource = $derived(normalizedSrc.length > 0);
  const activeIsFallback = $derived(!hasSource);
  const canRenderImage = $derived(
    activeIsFallback ? normalizedFallbackSrc.length > 0 : normalizedSrc.length > 0
  );
  const activeSrc = $derived(activeIsFallback ? normalizedFallbackSrc : normalizedSrc);
  const activeSrcset = $derived.by(() => {
    if (activeIsFallback) {
      return fallbackSrcset.trim().length > 0 ? fallbackSrcset : undefined;
    }

    return srcset.trim().length > 0 ? srcset : undefined;
  });
  const activeSizes = $derived.by(() => {
    if (activeIsFallback) {
      return fallbackSizes.trim().length > 0 ? fallbackSizes : undefined;
    }

    return sizes.trim().length > 0 ? sizes : undefined;
  });
  const resolvedAlt = $derived.by(() => {
    if (decorative) {
      return '';
    }

    if (activeIsFallback) {
      if (alt.trim().length > 0) {
        return alt;
      }

      if (fallbackAlt.trim().length > 0) {
        return fallbackAlt;
      }
    }

    return alt;
  });
  const ratioValue = $derived(RATIO_MAP[ratio]);
  const imageMode = $derived(
    activeIsFallback
      ? IMAGE_DECLARATIVE_MODES.declarativeFallback
      : IMAGE_DECLARATIVE_MODES.primary
  );
  const normalizedWidth = $derived(normalizeDimension(width));
  const normalizedHeight = $derived(normalizeDimension(height));
  const normalizedFallbackWidth = $derived(normalizeDimension(fallbackWidth));
  const normalizedFallbackHeight = $derived(normalizeDimension(fallbackHeight));
  const activeWidth = $derived(activeIsFallback ? normalizedFallbackWidth : normalizedWidth);
  const activeHeight = $derived(activeIsFallback ? normalizedFallbackHeight : normalizedHeight);
  const fallbackDataSrc = $derived.by(() => {
    if (activeIsFallback || normalizedFallbackSrc.length === 0) {
      return undefined;
    }

    return normalizedFallbackSrc;
  });
  const fallbackDataSrcset = $derived.by(() => {
    if (activeIsFallback) {
      return undefined;
    }

    return fallbackSrcset.trim().length > 0 ? fallbackSrcset : undefined;
  });
  const fallbackDataSizes = $derived.by(() => {
    if (activeIsFallback) {
      return undefined;
    }

    return fallbackSizes.trim().length > 0 ? fallbackSizes : undefined;
  });
  const fallbackDataAlt = $derived.by(() => {
    if (activeIsFallback || decorative || alt.trim().length > 0) {
      return undefined;
    }

    return fallbackAlt.trim().length > 0 ? fallbackAlt : undefined;
  });
  const imageEnhancementAttributes = $derived.by((): Record<string, string | undefined> => ({
    [IMAGE_ENHANCEMENT_ATTRIBUTES.loading]: IMAGE_LOADING_MODES.fade,
    [IMAGE_ENHANCEMENT_ATTRIBUTES.loadState]: IMAGE_LOAD_STATES.pending,
    [IMAGE_ENHANCEMENT_ATTRIBUTES.mode]: imageMode,
    [IMAGE_ENHANCEMENT_ATTRIBUTES.fallbackSrc]: fallbackDataSrc,
    [IMAGE_ENHANCEMENT_ATTRIBUTES.fallbackSrcset]: fallbackDataSrcset,
    [IMAGE_ENHANCEMENT_ATTRIBUTES.fallbackSizes]: fallbackDataSizes,
    [IMAGE_ENHANCEMENT_ATTRIBUTES.fallbackAlt]: fallbackDataAlt,
    [IMAGE_ENHANCEMENT_ATTRIBUTES.fallbackWidth]: activeIsFallback
      ? undefined
      : normalizedFallbackWidth,
    [IMAGE_ENHANCEMENT_ATTRIBUTES.fallbackHeight]: activeIsFallback
      ? undefined
      : normalizedFallbackHeight,
  }));

  const imageClasses = $derived(
    [
      'image',
      `image--${fit}`,
      frame === 'clamped' ? 'image--ratio image--clamped' : `image--${frame}`,
      `image--radius-${radius}`,
      className,
    ]
      .filter(Boolean)
      .join(' ')
  );

  const imageStyle = $derived.by(() => {
    const styles = [
      `--image-fit: ${fit}`,
      `--image-object-position: ${objectPosition}`,
      `--image-min-height: ${minHeight}`,
      `--image-preferred-height: ${preferredHeight}`,
      `--image-max-height: ${maxHeight}`,
    ];

    if (frame === 'ratio' || frame === 'clamped') {
      styles.push(`--image-ratio: ${ratioValue}`);
    }

    return styles.join('; ');
  });

  $effect(() => {
    if (!decorative && resolvedAlt.trim().length === 0) {
      console.warn(
        '[Image] Non-decorative images should include meaningful alt text.'
      );
    }
  });

</script>

<div class={imageClasses} style={imageStyle} aria-hidden={decorative ? 'true' : undefined}>
  {#if canRenderImage}
    <img
      class="image__media"
      {...imageEnhancementAttributes}
      src={activeSrc}
      srcset={activeSrcset}
      sizes={activeSizes}
      alt={resolvedAlt}
      width={activeWidth}
      height={activeHeight}
      {loading}
      {decoding}
      fetchpriority={fetchPriority}
    />
  {:else}
    <div class="image__placeholder" aria-hidden="true"></div>
  {/if}
</div>

<style>
  .image {
    --image-radius: 0;

    inline-size: 100%;
    overflow: hidden;
  }

  .image--ratio {
    aspect-ratio: var(--image-ratio);
  }

  .image--clamped {
    block-size: clamp(
      var(--image-min-height),
      var(--image-preferred-height),
      var(--image-max-height)
    );
  }

  .image__media,
  .image__placeholder {
    display: block;
    inline-size: 100%;
    block-size: 100%;
    border-radius: var(--image-radius);
  }

  .image__media {
    opacity: 1;
    object-fit: var(--image-fit);
    object-position: var(--image-object-position);
  }

  :global(html[data-js='true'][data-image-enhancer='pending'])
    .image__media[data-load-state='pending']:not([data-load-complete='true']),
  :global(html[data-js='true'][data-image-enhancer='active'])
    .image__media[data-load-state='pending']:not([data-load-complete='true']) {
    opacity: 0;
    color: transparent;
  }

  :global(.image__media[data-load-state='loaded']),
  :global(.image__media[data-load-complete='true']) {
    animation: image-media-fade-in var(--animation-duration-fast)
      var(--animation-easing-decelerate) both;
  }

  @keyframes image-media-fade-in {
    from {
      opacity: 0;
    }

    to {
      opacity: 1;
    }
  }

  .image--contain {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .image--contain .image__media {
    inline-size: auto;
    block-size: auto;
    max-inline-size: 100%;
    max-block-size: 100%;
  }

  .image--auto .image__media {
    block-size: auto;
  }

  .image__placeholder {
    background: linear-gradient(145deg, var(--color-green-060), var(--color-green-080));
  }

  .image--radius-small {
    --image-radius: var(--radius-sm);
  }

  .image--radius-medium {
    --image-radius: var(--radius-md);
  }

  .image--radius-large {
    --image-radius: var(--radius-lg);
  }

  @media (prefers-reduced-motion: reduce) {
    :global(.image__media[data-load-state='loaded']),
    :global(.image__media[data-load-complete='true']) {
      opacity: 1;
      animation: none;
    }
  }
</style>
