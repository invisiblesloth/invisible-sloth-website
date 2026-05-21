import { normalizeHref, normalizeRelForTarget, normalizeTarget } from './linkBehavior';

export type PostAuthorItem = {
  name: string;
  href?: string;
  target?: string;
  rel?: string;
};

export type ResolvedPostAuthorItem = PostAuthorItem & {
  index: number;
  key: string;
};

export type PostAuthorResolution = {
  inputWasPresent: boolean;
  inputWasArray: boolean;
  authors: ResolvedPostAuthorItem[];
  invalidAuthorIndexes: number[];
  blankHrefIndexes: number[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function resolvePostAuthors(input: unknown): PostAuthorResolution {
  if (input === undefined || input === null) {
    return {
      inputWasPresent: false,
      inputWasArray: false,
      authors: [],
      invalidAuthorIndexes: [],
      blankHrefIndexes: [],
    };
  }

  if (!Array.isArray(input)) {
    return {
      inputWasPresent: true,
      inputWasArray: false,
      authors: [],
      invalidAuthorIndexes: [],
      blankHrefIndexes: [],
    };
  }

  const authors: ResolvedPostAuthorItem[] = [];
  const invalidAuthorIndexes: number[] = [];
  const blankHrefIndexes: number[] = [];

  input.forEach((author, index) => {
    const authorRecord = isRecord(author) ? author : undefined;
    const name = String(authorRecord?.name ?? '').trim();

    if (!authorRecord || !name) {
      invalidAuthorIndexes.push(index);
      return;
    }

    const hrefWasPresent = authorRecord.href !== undefined && authorRecord.href !== null;
    const href = normalizeHref(
      typeof authorRecord.href === 'string' ? authorRecord.href : undefined
    );

    if (hrefWasPresent && !href) {
      blankHrefIndexes.push(index);
    }

    const target = normalizeTarget(
      typeof authorRecord.target === 'string' ? authorRecord.target : undefined
    );

    const resolvedAuthor: ResolvedPostAuthorItem = {
      index,
      key: `${name}:${index}`,
      name,
    };

    if (href) {
      resolvedAuthor.href = href;
      resolvedAuthor.target = target;
      resolvedAuthor.rel = normalizeRelForTarget(
        target,
        typeof authorRecord.rel === 'string' ? authorRecord.rel : undefined
      );
    }

    authors.push(resolvedAuthor);
  });

  return {
    inputWasPresent: true,
    inputWasArray: true,
    authors,
    invalidAuthorIndexes,
    blankHrefIndexes,
  };
}
