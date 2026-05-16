export const BADGE_VARIANTS = [
  'default',
  'boardgame',
  'playdate',
  'apple',
  'error',
  'web',
] as const;

export type BadgeVariant = (typeof BADGE_VARIANTS)[number];

export const DEFAULT_BADGE_VARIANT: BadgeVariant = 'default';

export function isBadgeVariant(value: string | null | undefined): value is BadgeVariant {
  return BADGE_VARIANTS.includes(value as BadgeVariant);
}

export function normalizeBadgeVariantCandidate(value: string | null | undefined): string {
  return value?.trim().toLowerCase() ?? '';
}

export function normalizeBadgeVariant(value: string | null | undefined): BadgeVariant {
  const candidate = normalizeBadgeVariantCandidate(value);

  return isBadgeVariant(candidate) ? candidate : DEFAULT_BADGE_VARIANT;
}
