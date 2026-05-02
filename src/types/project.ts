export const PROJECT_BADGE_VARIANTS = [
  'default',
  'boardgame',
  'playdate',
  'apple',
  'error',
  'web',
] as const;

export type ProjectBadgeVariant = (typeof PROJECT_BADGE_VARIANTS)[number];

export type ProjectBadge = {
  label: string;
  variant: ProjectBadgeVariant;
};

export type ProjectButton = {
  label: string;
  href: string;
  target?: string;
  rel?: string;
  hasTrailingIcon?: boolean;
};
