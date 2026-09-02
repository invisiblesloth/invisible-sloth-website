function normalizeHref(value) {
  if (typeof value !== 'string') {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed || undefined;
}

function normalizePathForActiveComparison(value) {
  const href = normalizeHref(value);

  if (!href || !href.startsWith('/') || href.startsWith('//')) {
    return href;
  }

  const [pathname = ''] = href.split(/[?#]/);
  return pathname.replace(/\/+$/, '') || '/';
}

function isPathHrefWithState(value) {
  return value.startsWith('/') && !value.startsWith('//') && /[?#]/.test(value);
}

export function hasExactActiveNavigationItem(activeValue, menuSections) {
  const active = normalizeHref(activeValue);

  if (!active) {
    return false;
  }

  return menuSections.some((section) =>
    section.items.some((item) => normalizeHref(item.href) === active)
  );
}

export function isActiveNavigationItem(
  activeValue,
  itemHref,
  exactActiveMatchExists
) {
  const active = normalizeHref(activeValue);
  const item = normalizeHref(itemHref);

  if (!active || !item) {
    return false;
  }

  if (active === item) {
    return true;
  }

  if (exactActiveMatchExists || isPathHrefWithState(item)) {
    return false;
  }

  return normalizePathForActiveComparison(active) === normalizePathForActiveComparison(item);
}

export function getNavigationAriaCurrent(
  activeValue,
  itemHref,
  exactActiveMatchExists
) {
  return isActiveNavigationItem(activeValue, itemHref, exactActiveMatchExists)
    ? 'page'
    : undefined;
}
