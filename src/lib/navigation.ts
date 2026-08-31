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

export type NavigationSectionDiagnosticReason =
  | 'sections-not-array'
  | 'section-not-object'
  | 'items-not-array'
  | 'heading-invalid'
  | 'item-not-object'
  | 'label-invalid'
  | 'href-invalid'
  | 'target-invalid'
  | 'rel-invalid';

export type NavigationSectionDiagnostic = {
  path: string;
  reason: NavigationSectionDiagnosticReason;
};

export type NavigationSectionResolution = {
  sections: ResolvedNavigationSection[];
  diagnostics: NavigationSectionDiagnostic[];
};

export type NavigationCloseReason = 'button' | 'escape' | 'backdrop' | 'navigation';

export type NavigationCloseEvent = MouseEvent | KeyboardEvent | undefined;

export type NavigationCloseCallback = {
  bivarianceHack(event?: NavigationCloseEvent, reason?: NavigationCloseReason): void;
}['bivarianceHack'];

export type NavigationNavigateCallback = (
  event: MouseEvent,
  item: ResolvedNavigationItem
) => void;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function hasOwn(record: Record<string, unknown>, property: string): boolean {
  return Object.prototype.hasOwnProperty.call(record, property);
}

export function resolveNavigationSectionsWithDiagnostics(
  value: unknown
): NavigationSectionResolution {
  if (!Array.isArray(value)) {
    return {
      sections: [],
      diagnostics:
        value === undefined
          ? []
          : [{ path: 'sections', reason: 'sections-not-array' }],
    };
  }

  const diagnostics: NavigationSectionDiagnostic[] = [];
  const sections: ResolvedNavigationSection[] = [];

  value.forEach((section, sectionIndex) => {
    const sectionPath = `sections[${sectionIndex}]`;

    if (!isRecord(section)) {
      diagnostics.push({ path: sectionPath, reason: 'section-not-object' });
      return;
    }

    let heading: string | undefined;

    if (hasOwn(section, 'heading')) {
      if (typeof section.heading === 'string' && section.heading.trim()) {
        heading = section.heading.trim();
      } else if (section.heading !== undefined) {
        diagnostics.push({ path: `${sectionPath}.heading`, reason: 'heading-invalid' });
      }
    }

    if (!Array.isArray(section.items)) {
      diagnostics.push({ path: `${sectionPath}.items`, reason: 'items-not-array' });
      return;
    }

    const resolvedItems: ResolvedNavigationItem[] = [];

    section.items.forEach((item, itemIndex) => {
      const itemPath = `${sectionPath}.items[${itemIndex}]`;

      if (!isRecord(item)) {
        diagnostics.push({ path: itemPath, reason: 'item-not-object' });
        return;
      }

      const label = typeof item.label === 'string' ? item.label.trim() : '';
      const href = normalizeHref(
        typeof item.href === 'string' ? item.href : undefined
      );

      if (!label) {
        diagnostics.push({ path: `${itemPath}.label`, reason: 'label-invalid' });
      }

      if (!href) {
        diagnostics.push({ path: `${itemPath}.href`, reason: 'href-invalid' });
      }

      if (!label || !href) {
        return;
      }

      let target: string | undefined;
      let rel: string | undefined;

      if (hasOwn(item, 'target') && item.target !== undefined) {
        const normalizedTarget =
          typeof item.target === 'string' ? normalizeTarget(item.target) : undefined;

        if (normalizedTarget) {
          target = normalizedTarget;
        } else {
          diagnostics.push({ path: `${itemPath}.target`, reason: 'target-invalid' });
        }
      }

      if (hasOwn(item, 'rel') && item.rel !== undefined) {
        if (typeof item.rel !== 'string' || !item.rel.trim()) {
          diagnostics.push({ path: `${itemPath}.rel`, reason: 'rel-invalid' });
        } else {
          rel = item.rel;
        }
      }

      const normalizedRel = normalizeRelForTarget(target, rel);
      const resolvedItem: ResolvedNavigationItem = { label, href };

      if (target) {
        resolvedItem.target = target;
      }

      if (normalizedRel) {
        resolvedItem.rel = normalizedRel;
      }

      resolvedItems.push(resolvedItem);
    });

    if (resolvedItems.length === 0) {
      return;
    }

    const resolvedSection: ResolvedNavigationSection = { items: resolvedItems };

    if (heading) {
      resolvedSection.heading = heading;
    }

    sections.push(resolvedSection);
  });

  return { sections, diagnostics };
}

export function resolveNavigationSections(value: unknown): ResolvedNavigationSection[] {
  return resolveNavigationSectionsWithDiagnostics(value).sections;
}
