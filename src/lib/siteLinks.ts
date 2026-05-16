import { normalizeHref } from './linkBehavior';

export const FIRST_PARTY_HOSTNAMES = ['invisiblesloth.com', 'www.invisiblesloth.com'] as const;

const FIRST_PARTY_HOSTNAME_SET = new Set<string>(FIRST_PARTY_HOSTNAMES);
const EXTERNAL_LINK_PROTOCOLS = new Set(['http:', 'https:']);

export function isExternalAbsoluteHttpUrl(value?: string): boolean {
  const normalizedHref = normalizeHref(value);
  if (!normalizedHref) return false;

  let url: URL;
  try {
    url = new URL(normalizedHref);
  } catch {
    return false;
  }

  if (!EXTERNAL_LINK_PROTOCOLS.has(url.protocol)) {
    return false;
  }

  return !FIRST_PARTY_HOSTNAME_SET.has(url.hostname.toLowerCase());
}
