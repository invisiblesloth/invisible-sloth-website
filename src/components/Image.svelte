<script lang="ts">
  /**
   * Image atom for consistent media rendering across layouts.
   *
   * Behavior:
   * - fit="cover" fills the frame and may crop.
   * - fit="contain" shows the whole image inside the frame.
   * - frame="ratio" enforces a fixed aspect ratio.
   * - frame="auto" uses the image's intrinsic dimensions.
   * - frame="clamped" applies aspect ratio with viewport-driven height clamping.
   */
  type ImageFit = 'cover' | 'contain';
  type Frame = 'ratio' | 'auto' | 'clamped';
  type AspectRatio = '3:2' | '2:3' | '1:1' | '16:9';
  type Radius = 'none' | 'small' | 'medium' | 'large';
  type LoadingMode = 'lazy' | 'eager';
  type DecodingMode = 'auto' | 'sync' | 'async';
  type FetchPriority = 'auto' | 'high' | 'low';

  const RATIO_MAP: Record<AspectRatio, string> = {
    '3:2': '3 / 2',
    '2:3': '2 / 3',
    '1:1': '1 / 1',
    '16:9': '16 / 9',
  };

  const DEFAULT_FALLBACK_SRC = '/assets/image-fallback-default-1024.webp';
  const DEFAULT_FALLBACK_SRCSET = [
    '/assets/image-fallback-default-640.webp 640w',
    '/assets/image-fallback-default-1024.webp 1024w',
    '/assets/image-fallback-default-1512.webp 1512w',
    '/assets/image-fallback-default.webp 3000w',
  ].join(', ');
  const DEFAULT_FALLBACK_SIZES =
    '(min-width: 1176px) 1512px, (min-width: 1015px) 1024px, (min-width: 632px) 744px, 100vw';

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
    fallbackSrc = DEFAULT_FALLBACK_SRC,
    fallbackSrcset = DEFAULT_FALLBACK_SRCSET,
    fallbackSizes = DEFAULT_FALLBACK_SIZES,
    fallbackAlt = 'Fallback image showing Sloth-Luc, the Invisible Sloth logo character.',
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
    fallbackSrc?: string;
    fallbackSrcset?: string;
    fallbackSizes?: string;
    fallbackAlt?: string;
    class?: string;
  } = $props();

  let primaryImageFailed = $state(false);
  let fallbackImageFailed = $state(false);

  const hasSource = $derived(src.trim().length > 0);
  const shouldUseFallback = $derived(!hasSource || primaryImageFailed);
  const canRenderImage = $derived(!fallbackImageFailed);
  const activeSrc = $derived(shouldUseFallback ? fallbackSrc : src);
  const activeSrcset = $derived.by(() => {
    if (shouldUseFallback) {
      return fallbackSrcset.trim().length > 0 ? fallbackSrcset : undefined;
    }

    return srcset.trim().length > 0 ? srcset : undefined;
  });
  const activeSizes = $derived.by(() => {
    if (shouldUseFallback) {
      return fallbackSizes.trim().length > 0 ? fallbackSizes : undefined;
    }

    return sizes.trim().length > 0 ? sizes : undefined;
  });
  const resolvedAlt = $derived.by(() => {
    if (decorative) {
      return '';
    }

    if (shouldUseFallback) {
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

  const sourceKey = $derived(
    `${src}|${srcset}|${sizes}|${fallbackSrc}|${fallbackSrcset}|${fallbackSizes}`
  );

  $effect(() => {
    sourceKey;
    primaryImageFailed = false;
    fallbackImageFailed = false;
  });

  const handleImageError = () => {
    if (shouldUseFallback) {
      fallbackImageFailed = true;
      return;
    }

    primaryImageFailed = true;
  };
</script>

<div class={imageClasses} style={imageStyle} aria-hidden={decorative ? 'true' : undefined}>
  {#if canRenderImage}
    {#key `${activeSrc}|${activeSrcset ?? ''}`}
      <img
        class="image__media"
        src={activeSrc}
        srcset={activeSrcset}
        sizes={activeSizes}
        alt={resolvedAlt}
        {loading}
        {decoding}
        fetchpriority={fetchPriority}
        onerror={handleImageError}
      />
    {/key}
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
    object-fit: var(--image-fit);
    object-position: var(--image-object-position);
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
    background:
      radial-gradient(circle at 20% 15%, rgb(255 255 255 / 0.28) 0 10px, transparent 11px),
      linear-gradient(145deg, var(--color-green-060), var(--color-green-080));
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
</style>
