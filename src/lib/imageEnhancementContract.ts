export const IMAGE_ENHANCER_AVAILABILITY = {
  pending: 'pending',
  active: 'active',
  unavailable: 'unavailable',
} as const;

export const IMAGE_LOADING_MODES = {
  fade: 'fade',
} as const;

export const IMAGE_DECLARATIVE_MODES = {
  primary: 'primary',
  declarativeFallback: 'declarative-fallback',
} as const;

export const IMAGE_LOAD_STATES = {
  pending: 'pending',
  loaded: 'loaded',
  failed: 'failed',
} as const;

export const IMAGE_ENHANCEMENT_ATTRIBUTES = {
  loading: 'data-image-loading',
  mode: 'data-image-mode',
  fallbackSrc: 'data-fallback-src',
  fallbackSrcset: 'data-fallback-srcset',
  fallbackSizes: 'data-fallback-sizes',
  fallbackAlt: 'data-fallback-alt',
  fallbackWidth: 'data-fallback-width',
  fallbackHeight: 'data-fallback-height',
  loadState: 'data-load-state',
  loadComplete: 'data-load-complete',
  enhancerCandidate: 'data-enhancer-candidate',
  enhancerFallbackMode: 'data-enhancer-fallback-mode',
  enhancerState: 'data-enhancer-state',
  loadedResourceToken: 'data-loaded-resource-token',
} as const;

export const IMAGE_ENHANCEMENT_OBSERVED_ATTRIBUTES = [
  'src',
  'srcset',
  'sizes',
  'width',
  'height',
  'alt',
  IMAGE_ENHANCEMENT_ATTRIBUTES.mode,
  IMAGE_ENHANCEMENT_ATTRIBUTES.fallbackSrc,
  IMAGE_ENHANCEMENT_ATTRIBUTES.fallbackSrcset,
  IMAGE_ENHANCEMENT_ATTRIBUTES.fallbackSizes,
  IMAGE_ENHANCEMENT_ATTRIBUTES.fallbackAlt,
  IMAGE_ENHANCEMENT_ATTRIBUTES.fallbackWidth,
  IMAGE_ENHANCEMENT_ATTRIBUTES.fallbackHeight,
  IMAGE_ENHANCEMENT_ATTRIBUTES.loading,
] as const;

export const IMAGE_PRIMARY_SOURCE_ATTRIBUTES = [
  'src',
  'srcset',
  'sizes',
  IMAGE_ENHANCEMENT_ATTRIBUTES.mode,
] as const;

export const IMAGE_PRIMARY_INPUT_ATTRIBUTES = [
  'src',
  'srcset',
  'sizes',
  'width',
  'height',
  'alt',
] as const;

export const IMAGE_FALLBACK_CONFIG_ATTRIBUTES = [
  IMAGE_ENHANCEMENT_ATTRIBUTES.fallbackSrc,
  IMAGE_ENHANCEMENT_ATTRIBUTES.fallbackSrcset,
  IMAGE_ENHANCEMENT_ATTRIBUTES.fallbackSizes,
  IMAGE_ENHANCEMENT_ATTRIBUTES.fallbackAlt,
  IMAGE_ENHANCEMENT_ATTRIBUTES.fallbackWidth,
  IMAGE_ENHANCEMENT_ATTRIBUTES.fallbackHeight,
] as const;

export const IMAGE_FALLBACK_RESOURCE_ATTRIBUTES = [
  IMAGE_ENHANCEMENT_ATTRIBUTES.fallbackSrc,
  IMAGE_ENHANCEMENT_ATTRIBUTES.fallbackSrcset,
  IMAGE_ENHANCEMENT_ATTRIBUTES.fallbackSizes,
] as const;

export const IMAGE_LOADING_SELECTOR = `img[${IMAGE_ENHANCEMENT_ATTRIBUTES.loading}="${IMAGE_LOADING_MODES.fade}"]`;

export type ImageEnhancerAvailability =
  (typeof IMAGE_ENHANCER_AVAILABILITY)[keyof typeof IMAGE_ENHANCER_AVAILABILITY];

export type ImageDeclarativeMode =
  (typeof IMAGE_DECLARATIVE_MODES)[keyof typeof IMAGE_DECLARATIVE_MODES];

export type ImagePublicLoadState =
  (typeof IMAGE_LOAD_STATES)[keyof typeof IMAGE_LOAD_STATES];
