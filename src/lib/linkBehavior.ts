const BLANK_TARGET = '_blank';
const SECURITY_REL_TOKENS = ['noopener', 'noreferrer'] as const;

export function normalizeHref(value?: string): string | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export function normalizeTarget(value?: string): string | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }

  return trimmed.toLowerCase() === BLANK_TARGET ? BLANK_TARGET : trimmed;
}

// Non-blank targets pass rel through unchanged. Blank targets are hardened while
// preserving caller token order and first-token casing.
export function normalizeRelForTarget(targetValue?: string, relValue?: string): string | undefined {
  if (normalizeTarget(targetValue) !== BLANK_TARGET) {
    return relValue;
  }

  const rawTokens = (relValue ?? '')
    .split(/\s+/)
    .map((token) => token.trim())
    .filter(Boolean);

  const dedupedTokens: string[] = [];
  const tokenSet = new Set<string>();

  for (const token of rawTokens) {
    const normalized = token.toLowerCase();
    if (tokenSet.has(normalized)) continue;
    tokenSet.add(normalized);
    dedupedTokens.push(token);
  }

  for (const token of SECURITY_REL_TOKENS) {
    if (!tokenSet.has(token)) {
      dedupedTokens.push(token);
      tokenSet.add(token);
    }
  }

  return dedupedTokens.join(' ');
}
