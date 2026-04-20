const IMAGE_LOADING_SELECTOR = 'img[data-image-loading="fade"]';
const GLOBAL_STATE_KEY = '__invisible_sloth_image_loading_enhancer__';

const OBSERVED_ATTRIBUTE_NAMES = [
  'src',
  'srcset',
  'sizes',
  'width',
  'height',
  'alt',
  'data-image-mode',
  'data-fallback-src',
  'data-fallback-srcset',
  'data-fallback-sizes',
  'data-fallback-alt',
  'data-fallback-width',
  'data-fallback-height',
  'data-image-loading',
];

const PRIMARY_SOURCE_ATTRIBUTES = new Set(['src', 'srcset', 'sizes', 'data-image-mode']);
const PRIMARY_INPUT_ATTRIBUTES = new Set(['src', 'srcset', 'sizes', 'width', 'height', 'alt']);
const FALLBACK_CONFIG_ATTRIBUTES = new Set([
  'data-fallback-src',
  'data-fallback-srcset',
  'data-fallback-sizes',
  'data-fallback-alt',
  'data-fallback-width',
  'data-fallback-height',
]);
const FALLBACK_RESOURCE_ATTRIBUTES = new Set([
  'data-fallback-src',
  'data-fallback-srcset',
  'data-fallback-sizes',
]);

type EnhancerCandidate = 'primary' | 'fallback';
type EnhancerFallbackMode = 'none' | 'declarative' | 'error-driven';
type EnhancerLoadState =
  | 'primary-pending'
  | 'primary-loaded'
  | 'fallback-pending'
  | 'fallback-loaded'
  | 'failed';

type PublicLoadState = 'pending' | 'loaded' | 'failed';

type ImageSnapshot = {
  src?: string;
  srcset?: string;
  sizes?: string;
  width?: string;
  height?: string;
  alt: string;
};

type ImageState = {
  candidate: EnhancerCandidate;
  fallbackMode: EnhancerFallbackMode;
  loadState: EnhancerLoadState;
  ignoredAttributeMutations?: Map<string, number>;
  loadedResourceToken?: string;
  pendingAsyncToken?: string;
  primarySnapshot?: ImageSnapshot;
};

type EnhancerState = {
  initialized: boolean;
  observer: MutationObserver | null;
  images: WeakMap<HTMLImageElement, ImageState>;
};

type GlobalWithImageEnhancer = typeof globalThis & {
  [GLOBAL_STATE_KEY]?: EnhancerState;
};

const getEnhancerState = (): EnhancerState => {
  const scopedGlobal = globalThis as GlobalWithImageEnhancer;

  if (!scopedGlobal[GLOBAL_STATE_KEY]) {
    scopedGlobal[GLOBAL_STATE_KEY] = {
      initialized: false,
      observer: null,
      images: new WeakMap(),
    };
  }

  return scopedGlobal[GLOBAL_STATE_KEY];
};

const isEnhancedImage = (value: EventTarget | Element | null): value is HTMLImageElement =>
  value instanceof HTMLImageElement && value.matches(IMAGE_LOADING_SELECTOR);

const attributeSetHasAny = (attributes: Set<string>, candidates: Set<string>): boolean => {
  for (const attributeName of candidates) {
    if (attributes.has(attributeName)) {
      return true;
    }
  }

  return false;
};

const getOptionalAttribute = (element: HTMLElement, attributeName: string): string | undefined =>
  element.hasAttribute(attributeName) ? (element.getAttribute(attributeName) ?? '') : undefined;

const ignoreNextAttributeMutation = (state: ImageState, attributeName: string): void => {
  state.ignoredAttributeMutations ??= new Map<string, number>();
  state.ignoredAttributeMutations.set(
    attributeName,
    (state.ignoredAttributeMutations.get(attributeName) ?? 0) + 1
  );
};

const consumeIgnoredAttributeMutation = (
  state: ImageState,
  attributeName: string
): boolean => {
  const ignoredAttributeMutations = state.ignoredAttributeMutations;
  const ignoredCount = ignoredAttributeMutations?.get(attributeName) ?? 0;

  if (ignoredCount === 0 || !ignoredAttributeMutations) {
    return false;
  }

  if (ignoredCount === 1) {
    ignoredAttributeMutations.delete(attributeName);
  } else {
    ignoredAttributeMutations.set(attributeName, ignoredCount - 1);
  }

  if (ignoredAttributeMutations.size === 0) {
    delete state.ignoredAttributeMutations;
  }

  return true;
};

const setOptionalAttribute = (
  element: HTMLElement,
  attributeName: string,
  value?: string
): boolean => {
  if (value) {
    if (element.getAttribute(attributeName) !== value) {
      element.setAttribute(attributeName, value);
      return true;
    }

    return false;
  }

  if (element.hasAttribute(attributeName)) {
    element.removeAttribute(attributeName);
    return true;
  }

  return false;
};

const setRequiredAttribute = (
  element: HTMLElement,
  attributeName: string,
  value: string
): boolean => {
  if (element.getAttribute(attributeName) !== value) {
    element.setAttribute(attributeName, value);
    return true;
  }

  return false;
};

const setEnhancerOptionalAttribute = (
  image: HTMLImageElement,
  state: ImageState,
  attributeName: string,
  value?: string
): void => {
  if (setOptionalAttribute(image, attributeName, value)) {
    ignoreNextAttributeMutation(state, attributeName);
  }
};

const setEnhancerRequiredAttribute = (
  image: HTMLImageElement,
  state: ImageState,
  attributeName: string,
  value: string
): void => {
  if (setRequiredAttribute(image, attributeName, value)) {
    ignoreNextAttributeMutation(state, attributeName);
  }
};

const getDeclarativeMode = (image: HTMLImageElement): 'primary' | 'declarative-fallback' =>
  image.dataset.imageMode === 'declarative-fallback' ? 'declarative-fallback' : 'primary';

const getPublicLoadState = (state: ImageState): PublicLoadState => {
  if (state.loadState === 'failed') {
    return 'failed';
  }

  return state.loadState.endsWith('loaded') ? 'loaded' : 'pending';
};

const getResourceToken = (image: HTMLImageElement, state: ImageState): string =>
  [
    state.candidate,
    state.fallbackMode,
    image.getAttribute('src') ?? '',
    image.getAttribute('srcset') ?? '',
    image.getAttribute('sizes') ?? '',
  ].join('|');

const getAsyncToken = (image: HTMLImageElement, state: ImageState): string =>
  [getResourceToken(image, state), image.currentSrc].join('|');

const asyncTokenStillMatches = (
  image: HTMLImageElement,
  state: ImageState,
  token: string
): boolean => image.isConnected && isEnhancedImage(image) && getAsyncToken(image, state) === token;

const syncDiagnostics = (image: HTMLImageElement, state: ImageState): void => {
  image.dataset.enhancerCandidate = state.candidate;
  image.dataset.enhancerFallbackMode = state.fallbackMode;
  image.dataset.enhancerState = state.loadState;

  const publicLoadState = getPublicLoadState(state);
  image.dataset.loadState = publicLoadState;

  if (publicLoadState === 'loaded') {
    image.dataset.loadComplete = 'true';
    image.dataset.loadedResourceToken = state.loadedResourceToken ?? getResourceToken(image, state);
    return;
  }

  delete image.dataset.loadComplete;
  delete image.dataset.loadedResourceToken;
};

const setRuntimeState = (
  image: HTMLImageElement,
  state: ImageState,
  loadState: EnhancerLoadState
): void => {
  state.loadState = loadState;

  if (loadState.endsWith('loaded')) {
    state.loadedResourceToken = getResourceToken(image, state);
    delete state.pendingAsyncToken;
  } else {
    delete state.loadedResourceToken;
    state.pendingAsyncToken = getAsyncToken(image, state);
  }

  syncDiagnostics(image, state);
};

const createInitialState = (image: HTMLImageElement): ImageState => {
  if (getDeclarativeMode(image) === 'declarative-fallback') {
    return {
      candidate: 'fallback',
      fallbackMode: 'declarative',
      loadState: 'fallback-pending',
    };
  }

  return {
    candidate: 'primary',
    fallbackMode: 'none',
    loadState: 'primary-pending',
  };
};

const getImageState = (image: HTMLImageElement): ImageState => {
  const stateMap = getEnhancerState().images;
  const existingState = stateMap.get(image);

  if (existingState) {
    return existingState;
  }

  const state = createInitialState(image);
  stateMap.set(image, state);
  syncDiagnostics(image, state);
  return state;
};

const getPrimarySnapshot = (image: HTMLImageElement): ImageSnapshot => ({
  src: getOptionalAttribute(image, 'src'),
  srcset: getOptionalAttribute(image, 'srcset'),
  sizes: getOptionalAttribute(image, 'sizes'),
  width: getOptionalAttribute(image, 'width'),
  height: getOptionalAttribute(image, 'height'),
  alt: image.getAttribute('alt') ?? '',
});

const updatePrimarySnapshotFromChangedAttributes = (
  image: HTMLImageElement,
  state: ImageState,
  changedAttributes: Set<string>
): void => {
  if (!state.primarySnapshot) {
    return;
  }

  if (changedAttributes.has('src')) {
    state.primarySnapshot.src = getOptionalAttribute(image, 'src');
  }

  if (changedAttributes.has('srcset')) {
    state.primarySnapshot.srcset = getOptionalAttribute(image, 'srcset');
  }

  if (changedAttributes.has('sizes')) {
    state.primarySnapshot.sizes = getOptionalAttribute(image, 'sizes');
  }

  if (changedAttributes.has('width')) {
    state.primarySnapshot.width = getOptionalAttribute(image, 'width');
  }

  if (changedAttributes.has('height')) {
    state.primarySnapshot.height = getOptionalAttribute(image, 'height');
  }

  if (changedAttributes.has('alt')) {
    state.primarySnapshot.alt = image.getAttribute('alt') ?? '';
  }
};

const getSnapshotValue = (
  image: HTMLImageElement,
  snapshot: ImageSnapshot,
  attributeName: keyof ImageSnapshot,
  changedAttributes: Set<string>
): string | undefined => {
  if (attributeName !== 'alt' && changedAttributes.has(attributeName)) {
    return getOptionalAttribute(image, attributeName);
  }

  if (attributeName === 'alt' && changedAttributes.has(attributeName)) {
    return image.getAttribute('alt') ?? '';
  }

  return snapshot[attributeName];
};

const applyPrimarySnapshot = (
  image: HTMLImageElement,
  state: ImageState,
  snapshot: ImageSnapshot,
  changedAttributes: Set<string>
): void => {
  const src = getSnapshotValue(image, snapshot, 'src', changedAttributes);
  const srcset = getSnapshotValue(image, snapshot, 'srcset', changedAttributes);
  const sizes = getSnapshotValue(image, snapshot, 'sizes', changedAttributes);
  const width = getSnapshotValue(image, snapshot, 'width', changedAttributes);
  const height = getSnapshotValue(image, snapshot, 'height', changedAttributes);
  const alt = getSnapshotValue(image, snapshot, 'alt', changedAttributes) ?? '';

  setEnhancerOptionalAttribute(image, state, 'sizes', sizes);
  setEnhancerOptionalAttribute(image, state, 'srcset', srcset);
  setEnhancerOptionalAttribute(image, state, 'width', width);
  setEnhancerOptionalAttribute(image, state, 'height', height);
  setEnhancerRequiredAttribute(image, state, 'alt', alt);
  setEnhancerOptionalAttribute(image, state, 'src', src);
};

const getFallbackAlt = (image: HTMLImageElement, state: ImageState): string => {
  const primaryAlt = state.primarySnapshot?.alt ?? image.getAttribute('alt') ?? '';

  if (primaryAlt.trim().length > 0) {
    return primaryAlt;
  }

  return image.dataset.fallbackAlt ?? primaryAlt;
};

const applyFallbackAttributes = (image: HTMLImageElement, state: ImageState): boolean => {
  const { fallbackSrc, fallbackSrcset, fallbackSizes, fallbackWidth, fallbackHeight } =
    image.dataset;

  if (!fallbackSrc) {
    return false;
  }

  setEnhancerOptionalAttribute(image, state, 'sizes', fallbackSizes);
  setEnhancerOptionalAttribute(image, state, 'srcset', fallbackSrcset);
  setEnhancerOptionalAttribute(image, state, 'width', fallbackWidth);
  setEnhancerOptionalAttribute(image, state, 'height', fallbackHeight);
  setEnhancerRequiredAttribute(image, state, 'alt', getFallbackAlt(image, state));
  setEnhancerOptionalAttribute(image, state, 'src', fallbackSrc);
  return true;
};

const enterDeclarativeFallback = (image: HTMLImageElement, state: ImageState): void => {
  state.candidate = 'fallback';
  state.fallbackMode = 'declarative';
  delete state.primarySnapshot;
  setRuntimeState(image, state, 'fallback-pending');
};

const enterPrimaryFromCurrentDom = (image: HTMLImageElement, state: ImageState): void => {
  state.candidate = 'primary';
  state.fallbackMode = 'none';
  delete state.primarySnapshot;
  setRuntimeState(image, state, 'primary-pending');
};

const enterPrimaryFromSnapshot = (
  image: HTMLImageElement,
  state: ImageState,
  changedAttributes: Set<string>
): void => {
  const snapshot = state.primarySnapshot ?? getPrimarySnapshot(image);
  applyPrimarySnapshot(image, state, snapshot, changedAttributes);
  enterPrimaryFromCurrentDom(image, state);
};

const enterErrorFallback = (image: HTMLImageElement, state: ImageState): boolean => {
  if (!image.dataset.fallbackSrc) {
    return false;
  }

  state.primarySnapshot = getPrimarySnapshot(image);
  state.candidate = 'fallback';
  state.fallbackMode = 'error-driven';

  if (!applyFallbackAttributes(image, state)) {
    return false;
  }

  setRuntimeState(image, state, 'fallback-pending');
  return true;
};

const retryErrorFallback = (image: HTMLImageElement, state: ImageState): boolean => {
  if (state.fallbackMode !== 'error-driven') {
    return false;
  }

  state.candidate = 'fallback';

  if (!applyFallbackAttributes(image, state)) {
    return false;
  }

  setRuntimeState(image, state, 'fallback-pending');
  return true;
};

const syncStateWithDeclarativeInputs = (
  image: HTMLImageElement,
  state: ImageState,
  changedAttributes: Set<string>
): void => {
  const declarativeMode = getDeclarativeMode(image);
  const primarySourceChanged = attributeSetHasAny(changedAttributes, PRIMARY_SOURCE_ATTRIBUTES);
  const primaryInputChanged = attributeSetHasAny(changedAttributes, PRIMARY_INPUT_ATTRIBUTES);
  const fallbackConfigChanged = attributeSetHasAny(changedAttributes, FALLBACK_CONFIG_ATTRIBUTES);
  const fallbackResourceChanged = attributeSetHasAny(changedAttributes, FALLBACK_RESOURCE_ATTRIBUTES);

  if (declarativeMode === 'declarative-fallback') {
    if (
      state.candidate !== 'fallback' ||
      state.fallbackMode !== 'declarative' ||
      primarySourceChanged
    ) {
      enterDeclarativeFallback(image, state);
    }

    return;
  }

  if (state.fallbackMode === 'declarative') {
    enterPrimaryFromCurrentDom(image, state);
    return;
  }

  if (state.fallbackMode === 'error-driven') {
    if (primaryInputChanged) {
      updatePrimarySnapshotFromChangedAttributes(image, state, changedAttributes);
    }

    if (primarySourceChanged) {
      enterPrimaryFromSnapshot(image, state, changedAttributes);
      return;
    }

    if (state.candidate === 'fallback' && changedAttributes.has('alt')) {
      applyFallbackAttributes(image, state);
      syncDiagnostics(image, state);
    }

    if (fallbackConfigChanged && state.candidate === 'fallback') {
      if (state.loadState === 'failed' || fallbackResourceChanged) {
        if (!retryErrorFallback(image, state)) {
          setRuntimeState(image, state, 'failed');
        }

        return;
      }

      applyFallbackAttributes(image, state);
      syncDiagnostics(image, state);
    }

    return;
  }

  if (primarySourceChanged) {
    enterPrimaryFromCurrentDom(image, state);
  }
};

const markImageLoaded = (image: HTMLImageElement, state: ImageState): void => {
  setRuntimeState(
    image,
    state,
    state.candidate === 'primary' ? 'primary-loaded' : 'fallback-loaded'
  );
};

const markImageFailed = (image: HTMLImageElement, state: ImageState): void => {
  setRuntimeState(image, state, 'failed');
};

const processImage = (image: HTMLImageElement, changedAttributes = new Set<string>()): void => {
  if (!isEnhancedImage(image)) {
    return;
  }

  const state = getImageState(image);
  syncStateWithDeclarativeInputs(image, state, changedAttributes);

  if (state.loadedResourceToken === getResourceToken(image, state)) {
    syncDiagnostics(image, state);
    return;
  }

  if (!image.complete) {
    if (!state.loadState.endsWith('pending')) {
      setRuntimeState(
        image,
        state,
        state.candidate === 'primary' ? 'primary-pending' : 'fallback-pending'
      );
    } else {
      syncDiagnostics(image, state);
    }

    return;
  }

  if (image.naturalWidth > 0) {
    void revealLoadedImage(image, getAsyncToken(image, state));
    return;
  }

  handleImageError(image, getAsyncToken(image, state));
};

const handleImageError = (image: HTMLImageElement, expectedToken?: string): void => {
  if (!isEnhancedImage(image)) {
    return;
  }

  const state = getImageState(image);

  if (expectedToken && !asyncTokenStillMatches(image, state, expectedToken)) {
    queueMicrotask(() => processImage(image));
    return;
  }

  if (
    state.candidate === 'primary' &&
    state.fallbackMode === 'none' &&
    getDeclarativeMode(image) === 'primary' &&
    enterErrorFallback(image, state)
  ) {
    queueMicrotask(() => processImage(image));
    return;
  }

  markImageFailed(image, state);
};

const revealLoadedImage = async (
  image: HTMLImageElement,
  expectedToken?: string
): Promise<void> => {
  if (!isEnhancedImage(image)) {
    return;
  }

  const state = getImageState(image);

  if (state.loadedResourceToken === getResourceToken(image, state)) {
    syncDiagnostics(image, state);
    return;
  }

  if (!image.complete) {
    setRuntimeState(
      image,
      state,
      state.candidate === 'primary' ? 'primary-pending' : 'fallback-pending'
    );
    return;
  }

  if (image.naturalWidth === 0) {
    handleImageError(image, expectedToken);
    return;
  }

  const decodeToken = expectedToken ?? getAsyncToken(image, state);

  if (typeof image.decode === 'function') {
    try {
      await image.decode();
    } catch {
      // The load event already fired; reveal the image if it is still current.
    }
  }

  if (!asyncTokenStillMatches(image, state, decodeToken)) {
    queueMicrotask(() => processImage(image));
    return;
  }

  if (image.complete && image.naturalWidth > 0) {
    markImageLoaded(image, state);
    return;
  }

  if (image.complete) {
    handleImageError(image, decodeToken);
  }
};

const processElement = (element: Element): void => {
  if (isEnhancedImage(element)) {
    processImage(element);
  }

  element
    .querySelectorAll<HTMLImageElement>(IMAGE_LOADING_SELECTOR)
    .forEach((image) => processImage(image));
};

const processRoot = (root: ParentNode): void => {
  if (root instanceof Element) {
    processElement(root);
    return;
  }

  root.querySelectorAll<HTMLImageElement>(IMAGE_LOADING_SELECTOR).forEach((image) =>
    processImage(image)
  );
};

const handleLoadEvent = (event: Event): void => {
  if (!isEnhancedImage(event.target)) {
    return;
  }

  const state = getImageState(event.target);
  void revealLoadedImage(event.target, getAsyncToken(event.target, state));
};

const handleErrorEvent = (event: Event): void => {
  if (!isEnhancedImage(event.target)) {
    return;
  }

  const state = getImageState(event.target);
  handleImageError(event.target, getAsyncToken(event.target, state));
};

const observeImages = (state: EnhancerState): void => {
  if (state.observer || typeof MutationObserver === 'undefined') {
    return;
  }

  state.observer = new MutationObserver((mutations) => {
    const changedImages = new Map<HTMLImageElement, Set<string>>();

    mutations.forEach((mutation) => {
      if (mutation.type === 'attributes' && mutation.target instanceof HTMLImageElement) {
        const image = mutation.target;
        const attributeName = mutation.attributeName;
        const imageState = getEnhancerState().images.get(image);

        if (
          attributeName &&
          imageState &&
          consumeIgnoredAttributeMutation(imageState, attributeName)
        ) {
          return;
        }

        if (attributeName && isEnhancedImage(image)) {
          const changedAttributes = changedImages.get(image) ?? new Set<string>();
          changedAttributes.add(attributeName);
          changedImages.set(image, changedAttributes);
        }

        return;
      }

      mutation.addedNodes.forEach((node) => {
        if (node instanceof Element) {
          processElement(node);
        }
      });
    });

    changedImages.forEach((changedAttributes, image) => {
      processImage(image, changedAttributes);
    });
  });

  state.observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: OBSERVED_ATTRIBUTE_NAMES,
    childList: true,
    subtree: true,
  });
};

export const initImageLoadingEnhancer = (root?: ParentNode): void => {
  if (typeof document === 'undefined') {
    return;
  }

  document.documentElement.dataset.js = 'true';
  const targetRoot = root ?? document;

  const state = getEnhancerState();

  if (!state.initialized) {
    document.addEventListener('load', handleLoadEvent, true);
    document.addEventListener('error', handleErrorEvent, true);
    observeImages(state);
    state.initialized = true;
  }

  processRoot(targetRoot);
};
