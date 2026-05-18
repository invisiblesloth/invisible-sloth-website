import { normalizeHref } from './linkBehavior';

export type TagLink = {
  label: string;
  href: string;
  target?: string;
  rel?: string;
};

export type ResolvedTagLink = TagLink & {
  index: number;
};

export type TagLinkResolution = {
  inputWasArray: boolean;
  links: ResolvedTagLink[];
  invalidIndexes: number[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function resolveTagLinks(input: unknown): TagLinkResolution {
  if (!Array.isArray(input)) {
    return {
      inputWasArray: false,
      links: [],
      invalidIndexes: [],
    };
  }

  const links: ResolvedTagLink[] = [];
  const invalidIndexes: number[] = [];

  input.forEach((tag, index) => {
    const tagRecord = isRecord(tag) ? tag : undefined;
    const label = String(tagRecord?.label ?? '').trim();
    const hrefInput = typeof tagRecord?.href === 'string' ? tagRecord.href : undefined;
    const href = normalizeHref(hrefInput);

    if (!tagRecord || !label || !href) {
      invalidIndexes.push(index);
      return;
    }

    const resolvedTag: ResolvedTagLink = {
      index,
      label,
      href,
    };

    if (typeof tagRecord.target === 'string') {
      resolvedTag.target = tagRecord.target;
    }

    if (typeof tagRecord.rel === 'string') {
      resolvedTag.rel = tagRecord.rel;
    }

    links.push(resolvedTag);
  });

  return {
    inputWasArray: true,
    links,
    invalidIndexes,
  };
}
