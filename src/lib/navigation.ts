import {
  normalizeHref,
  normalizeRelForTarget,
  normalizeTarget,
} from './linkBehavior';

export type NavigationItem = {
  label: string;
  href: string;
  target?: string;
  rel?: string;
};

export type NavigationSection = {
  heading?: string;
  items: NavigationItem[];
};

export type ResolvedNavigationItem = NavigationItem & {
  href: string;
  label: string;
  target?: string;
  rel?: string;
};

export type ResolvedNavigationSection = {
  heading?: string;
  items: ResolvedNavigationItem[];
};

export type NavigationCloseReason = 'button' | 'escape' | 'backdrop' | 'navigation';

export type NavigationCloseEvent = MouseEvent | KeyboardEvent | undefined;

export type NavigationCloseCallback = {
  bivarianceHack(event?: NavigationCloseEvent, reason?: NavigationCloseReason): void;
}['bivarianceHack'];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function resolveNavigationSections(value: unknown): ResolvedNavigationSection[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((section) => {
      const sectionRecord = isRecord(section) ? section : undefined;
      const sectionItems = Array.isArray(sectionRecord?.items) ? sectionRecord.items : [];

      const resolvedItems = sectionItems
        .map((item): ResolvedNavigationItem | undefined => {
          if (!isRecord(item)) {
            return undefined;
          }

          const labelValue = item.label;
          const hrefValue = item.href;

          if (typeof labelValue !== 'string' || typeof hrefValue !== 'string') {
            return undefined;
          }

          const label = labelValue.trim();
          const href = normalizeHref(hrefValue);

          if (!label || !href) {
            return undefined;
          }

          const target = normalizeTarget(
            typeof item.target === 'string' ? item.target : undefined
          );
          const rel = normalizeRelForTarget(
            target,
            typeof item.rel === 'string' ? item.rel : undefined
          );

          const resolvedItem: ResolvedNavigationItem = { label, href };

          if (target) {
            resolvedItem.target = target;
          }

          if (rel) {
            resolvedItem.rel = rel;
          }

          return resolvedItem;
        })
        .filter((item): item is ResolvedNavigationItem => Boolean(item));

      return {
        heading:
          typeof sectionRecord?.heading === 'string'
            ? sectionRecord.heading.trim() || undefined
            : undefined,
        items: resolvedItems,
      };
    })
    .filter((section) => section.items.length > 0);
}
