const LOGO_HOVER_TILT_SELECTOR = '[data-logo-hover-tilt]';
const LOGO_HOVER_TILT_BOUND_ATTR = 'data-logo-hover-tilt-bound';
const LOGO_HOVER_TILT_CSS_VAR = '--logo-hover-rotate';

const getRandomTiltDegrees = (): number => Math.floor(Math.random() * 21) - 10;

const applyRandomTilt = (element: HTMLElement): void => {
  element.style.setProperty(LOGO_HOVER_TILT_CSS_VAR, `${getRandomTiltDegrees()}deg`);
};

const bindLogoHoverTilt = (element: HTMLElement, supportsFineHover: boolean): void => {
  if (element.getAttribute(LOGO_HOVER_TILT_BOUND_ATTR) === 'true') {
    return;
  }

  if (supportsFineHover) {
    element.addEventListener('pointerenter', (event: PointerEvent) => {
      if (event.pointerType !== 'mouse' && event.pointerType !== 'pen') {
        return;
      }

      if (!(event.currentTarget instanceof HTMLElement)) {
        return;
      }

      applyRandomTilt(event.currentTarget);
    });
  }

  element.addEventListener(
    'touchstart',
    (event: TouchEvent) => {
      if (!(event.currentTarget instanceof HTMLElement)) {
        return;
      }

      applyRandomTilt(event.currentTarget);
    },
    { passive: true }
  );

  element.setAttribute(LOGO_HOVER_TILT_BOUND_ATTR, 'true');
};

export const initLogoHoverTilt = (root: ParentNode = document): void => {
  if (typeof window === 'undefined') {
    return;
  }

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }

  const logoElements = root.querySelectorAll<HTMLElement>(LOGO_HOVER_TILT_SELECTOR);

  if (logoElements.length === 0) {
    return;
  }

  const supportsFineHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  logoElements.forEach((element) => bindLogoHoverTilt(element, supportsFineHover));
};
