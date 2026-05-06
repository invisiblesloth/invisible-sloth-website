type ThemeColorSyncState = {
  observer: MutationObserver;
  queueInitialSync: () => void;
};

const initializedDocuments = new WeakMap<Document, ThemeColorSyncState>();

export const initThemeColorSync = (root?: Document): void => {
  if (!root) {
    if (typeof document === 'undefined') {
      return;
    }

    root = document;
  }

  const view = root.defaultView;

  if (!view) {
    return;
  }

  const documentElement = root.documentElement;
  const manualThemeColorSelector = 'meta[name="theme-color"][data-manual-theme-color]';
  const systemThemeColorSelector = 'meta[name="theme-color"][data-system-theme-color]';
  const initializedState = initializedDocuments.get(root);

  if (initializedState) {
    initializedState.queueInitialSync();
    return;
  }

  let syncFrame = 0;
  let domReadyListenerQueued = false;

  const setSystemThemeColorRouting = (enabled: boolean): void => {
    root.querySelectorAll<HTMLMetaElement>(systemThemeColorSelector).forEach((meta) => {
      if (!(meta instanceof view.HTMLMetaElement)) {
        return;
      }

      if (!meta.dataset.systemThemeColorMedia) {
        meta.dataset.systemThemeColorMedia = meta.getAttribute('media') ?? '';
      }

      if (enabled) {
        const media = meta.dataset.systemThemeColorMedia;

        if (media) {
          meta.setAttribute('media', media);
        } else {
          meta.removeAttribute('media');
        }

        return;
      }

      meta.setAttribute('media', 'not all');
    });
  };

  const readConcreteBackgroundColor = (): string => {
    const probe = root.createElement('span');
    probe.style.cssText = [
      'position: fixed',
      'inline-size: 0',
      'block-size: 0',
      'overflow: hidden',
      'pointer-events: none',
      'background-color: var(--color-background)',
    ].join(';');

    (root.body || documentElement).appendChild(probe);
    const color = view.getComputedStyle(probe).backgroundColor.trim();
    probe.remove();

    return color;
  };

  const syncManualThemeColor = (): void => {
    syncFrame = 0;

    const theme = documentElement.dataset.theme;
    const hasManualTheme = theme === 'light' || theme === 'dark';
    let manualThemeColor = root.querySelector<HTMLMetaElement>(manualThemeColorSelector);

    if (!hasManualTheme) {
      manualThemeColor?.remove();
      setSystemThemeColorRouting(true);
      return;
    }

    const color = readConcreteBackgroundColor();

    if (!color || color.includes('var(')) {
      manualThemeColor?.remove();
      setSystemThemeColorRouting(true);
      return;
    }

    if (!manualThemeColor) {
      manualThemeColor = root.createElement('meta');
      manualThemeColor.setAttribute('name', 'theme-color');
      manualThemeColor.dataset.manualThemeColor = 'true';
      manualThemeColor.setAttribute('content', color);
      root.head.appendChild(manualThemeColor);
    } else {
      manualThemeColor.setAttribute('content', color);
    }

    setSystemThemeColorRouting(false);
  };

  const requestThemeColorSync = (): void => {
    if (syncFrame) {
      return;
    }

    syncFrame = view.requestAnimationFrame(syncManualThemeColor);
  };

  const queueInitialSync = (): void => {
    if (root.readyState !== 'loading') {
      requestThemeColorSync();
      return;
    }

    if (domReadyListenerQueued) {
      return;
    }

    domReadyListenerQueued = true;
    root.addEventListener(
      'DOMContentLoaded',
      () => {
        domReadyListenerQueued = false;
        requestThemeColorSync();
      },
      { once: true }
    );
  };

  const observer = new view.MutationObserver(requestThemeColorSync);
  initializedDocuments.set(root, { observer, queueInitialSync });

  queueInitialSync();

  observer.observe(documentElement, {
    attributes: true,
    attributeFilter: ['data-theme'],
  });
};
