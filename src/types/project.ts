import type { BadgeVariant } from '../lib/badge';

export type ProjectBadgeVariant = BadgeVariant;

export type ProjectBadge = {
  label: string;
  variant: ProjectBadgeVariant;
};

export type ProjectButton = {
  label: string;
  href: string;
  target?: string;
  rel?: string;
};
