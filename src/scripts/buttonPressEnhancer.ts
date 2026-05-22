const BUTTON_PRESS_SELECTOR = '.button';
const BUTTON_PRESS_BOUND_ATTR = 'data-button-press-bound';
const BUTTON_PRESS_CLASS = 'is-enhanced-pressed';
const MINIMUM_PRESS_VISIBLE_MS = 140;

type PressState = {
  pressReleaseAt: number;
  cleanupTimer: number | undefined;
  pointerId: number | undefined;
};

const pressStateByElement = new WeakMap<HTMLElement, PressState>();

let globalCleanupBound = false;

const getNow = (): number => window.performance.now();

const isDisabledControl = (element: HTMLElement): boolean => {
  if (element.classList.contains('is-disabled') || element.getAttribute('aria-disabled') === 'true') {
    return true;
  }

  return element.matches(':disabled');
};

const clearCleanupTimer = (state: PressState): void => {
  if (state.cleanupTimer === undefined) {
    return;
  }

  window.clearTimeout(state.cleanupTimer);
  state.cleanupTimer = undefined;
};

const hasActivePointerCapture = (element: HTMLElement, state: PressState): boolean => {
  if (state.pointerId === undefined || typeof element.hasPointerCapture !== 'function') {
    return false;
  }

  try {
    return element.hasPointerCapture(state.pointerId);
  } catch {
    return false;
  }
};

const releasePointerCapture = (element: HTMLElement, state: PressState): void => {
  const pointerId = state.pointerId;

  if (pointerId === undefined || !hasActivePointerCapture(element, state)) {
    return;
  }

  try {
    element.releasePointerCapture(pointerId);
  } catch {
    // Pointer capture can disappear if the element is removed mid-press.
  }
};

const forceClearPress = (element: HTMLElement): void => {
  const state = pressStateByElement.get(element);

  if (state) {
    clearCleanupTimer(state);
    pressStateByElement.delete(element);
    releasePointerCapture(element, state);
  }

  element.classList.remove(BUTTON_PRESS_CLASS);
};

const clearPressIfCurrent = (element: HTMLElement, state: PressState): void => {
  if (pressStateByElement.get(element) !== state) {
    return;
  }

  forceClearPress(element);
};

const getRemainingPressTime = (element: HTMLElement): number => {
  const state = pressStateByElement.get(element);

  if (!state) {
    return 0;
  }

  return Math.max(0, state.pressReleaseAt - getNow());
};

const requestPressCleanup = (element: HTMLElement): void => {
  const state = pressStateByElement.get(element);

  if (!state) {
    element.classList.remove(BUTTON_PRESS_CLASS);
    return;
  }

  clearCleanupTimer(state);

  const remainingPressTime = getRemainingPressTime(element);

  if (remainingPressTime === 0) {
    forceClearPress(element);
    return;
  }

  state.cleanupTimer = window.setTimeout(
    () => clearPressIfCurrent(element, state),
    remainingPressTime
  );
};

const startPress = (element: HTMLElement, pointerId?: number): boolean => {
  if (pressStateByElement.has(element)) {
    forceClearPress(element);
  }

  if (isDisabledControl(element)) {
    forceClearPress(element);
    return false;
  }

  const pressStartedAt = getNow();
  const state: PressState = {
    pressReleaseAt: pressStartedAt + MINIMUM_PRESS_VISIBLE_MS,
    cleanupTimer: undefined,
    pointerId,
  };

  pressStateByElement.set(element, state);
  element.classList.add(BUTTON_PRESS_CLASS);
  return true;
};

const isPrimaryPointerPress = (event: PointerEvent): boolean =>
  event.isPrimary && event.button === 0;

const isPrimaryUnmodifiedClick = (event: MouseEvent): boolean =>
  event.button === 0 && !event.altKey && !event.ctrlKey && !event.metaKey && !event.shiftKey;

const hasNativePrivacyPolicy = (anchor: HTMLAnchorElement): boolean => {
  if (anchor.hasAttribute('referrerpolicy')) {
    return true;
  }

  return (anchor.getAttribute('rel') ?? '')
    .split(/\s+/)
    .some((token) => token.toLowerCase() === 'noreferrer');
};

const resolvesToSameDocumentFragment = (url: URL, rawHref: string): boolean => {
  const currentUrl = new URL(window.location.href);

  return (
    url.origin === currentUrl.origin &&
    url.pathname === currentUrl.pathname &&
    url.search === currentUrl.search &&
    (url.hash.length > 0 || rawHref.trim().startsWith('#'))
  );
};

const getDelayedNavigationUrl = (anchor: HTMLAnchorElement, event: MouseEvent): URL | undefined => {
  if (!isPrimaryUnmodifiedClick(event)) {
    return undefined;
  }

  const rawHref = anchor.getAttribute('href');

  if (!rawHref?.trim() || anchor.hasAttribute('download') || hasNativePrivacyPolicy(anchor)) {
    return undefined;
  }

  const target = anchor.getAttribute('target')?.trim().toLowerCase();

  if (target && target !== '_self') {
    return undefined;
  }

  let url: URL;

  try {
    url = new URL(anchor.href, document.baseURI);
  } catch {
    return undefined;
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    return undefined;
  }

  if (resolvesToSameDocumentFragment(url, rawHref)) {
    return undefined;
  }

  return url;
};

const handleButtonClick = (element: HTMLElement, event: MouseEvent): void => {
  if (!(element instanceof HTMLAnchorElement)) {
    requestPressCleanup(element);
    return;
  }

  if (isDisabledControl(element) || event.defaultPrevented) {
    requestPressCleanup(element);
    return;
  }

  const navigationUrl = getDelayedNavigationUrl(element, event);

  if (!navigationUrl) {
    requestPressCleanup(element);
    return;
  }

  const remainingPressTime = getRemainingPressTime(element);

  if (remainingPressTime === 0) {
    requestPressCleanup(element);
    return;
  }

  event.preventDefault();
  requestPressCleanup(element);

  window.setTimeout(() => {
    window.location.assign(navigationUrl.href);
  }, remainingPressTime);
};

const bindButtonPress = (element: HTMLElement, supportsPointerEvents: boolean): void => {
  if (element.getAttribute(BUTTON_PRESS_BOUND_ATTR) === 'true') {
    return;
  }

  if (supportsPointerEvents) {
    element.addEventListener('pointerdown', (event: PointerEvent) => {
      if (!isPrimaryPointerPress(event)) {
        return;
      }

      if (!startPress(element, event.pointerId)) {
        return;
      }

      if (typeof element.setPointerCapture === 'function') {
        try {
          element.setPointerCapture(event.pointerId);
        } catch {
          // Capture can fail if the pointer is no longer active.
        }
      }
    });

    element.addEventListener('pointerup', () => requestPressCleanup(element));
    element.addEventListener('pointercancel', () => requestPressCleanup(element));
    element.addEventListener('pointerleave', () => {
      const state = pressStateByElement.get(element);

      if (state && hasActivePointerCapture(element, state)) {
        return;
      }

      requestPressCleanup(element);
    });
    element.addEventListener('lostpointercapture', () => requestPressCleanup(element));
  } else {
    element.addEventListener(
      'touchstart',
      () => {
        startPress(element);
      },
      { passive: true }
    );
    element.addEventListener('touchend', () => requestPressCleanup(element));
    element.addEventListener('touchcancel', () => requestPressCleanup(element));
  }

  element.addEventListener('blur', () => requestPressCleanup(element));
  element.addEventListener('click', (event: MouseEvent) => handleButtonClick(element, event));

  element.setAttribute(BUTTON_PRESS_BOUND_ATTR, 'true');
};

const clearPressedButtons = (): void => {
  document
    .querySelectorAll<HTMLElement>(`${BUTTON_PRESS_SELECTOR}.${BUTTON_PRESS_CLASS}`)
    .forEach(forceClearPress);
};

const bindGlobalCleanup = (): void => {
  if (globalCleanupBound) {
    return;
  }

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      clearPressedButtons();
    }
  });
  window.addEventListener('pagehide', clearPressedButtons);

  globalCleanupBound = true;
};

export const initButtonPressEnhancer = (root: ParentNode = document): void => {
  if (typeof window === 'undefined') {
    return;
  }

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }

  const buttonElements = root.querySelectorAll<HTMLElement>(BUTTON_PRESS_SELECTOR);

  if (buttonElements.length === 0) {
    return;
  }

  bindGlobalCleanup();

  const supportsPointerEvents = 'PointerEvent' in window;

  buttonElements.forEach((element) => bindButtonPress(element, supportsPointerEvents));
};
