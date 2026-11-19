/**
 * Only direct HTTPS App Store product URLs are accepted. Optional country and
 * app-name segments precede a positive numeric app ID. Campaign query strings
 * and fragments are preserved. An omitted destination is an intentional preview.
 * @param {unknown} value
 * @returns {{ href: string | undefined, invalid: boolean }}
 */
export function resolveAppStoreHref(value) {
  if (value === undefined) return { href: undefined, invalid: false };

  if (typeof value === 'string') {
    const href = value.trim();
    // URL() repairs controls and backslashes. Supplied malformed input should
    // recover to the pending badge instead of producing a repaired destination.
    if (/[\s\u0000-\u001f\u007f\\]/.test(href)) return { href: undefined, invalid: true };
    try {
      const url = new URL(href);
      if (
        /^https:\/\//i.test(href) &&
        url.protocol === 'https:' && url.hostname === 'apps.apple.com' &&
        !url.username && !url.password && !url.port &&
        /^\/(?:[a-z]{2}\/)?app\/(?:[^/]+\/)?id[1-9]\d*\/?$/.test(url.pathname)
      ) {
        return { href, invalid: false };
      }
    } catch {
      // Supplied malformed values recover to the same noninteractive preview.
    }
  }

  return { href: undefined, invalid: true };
}
