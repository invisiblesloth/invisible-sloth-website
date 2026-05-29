export type FeatureListItem = {
  title: string;
  description: string;
};

export type ResolvedFeatureListItem = FeatureListItem & {
  index: number;
};

export type FeatureListResolution = {
  inputWasArray: boolean;
  items: ResolvedFeatureListItem[];
  invalidIndexes: number[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function resolveFeatureListItems(input: unknown): FeatureListResolution {
  if (!Array.isArray(input)) {
    return {
      inputWasArray: false,
      items: [],
      invalidIndexes: [],
    };
  }

  const items: ResolvedFeatureListItem[] = [];
  const invalidIndexes: number[] = [];

  input.forEach((feature, index) => {
    if (!isRecord(feature)) {
      invalidIndexes.push(index);
      return;
    }

    const title = String(feature.title ?? '').trim();
    const description = String(feature.description ?? '').trim();

    if (!title || !description) {
      invalidIndexes.push(index);
      return;
    }

    items.push({
      index,
      title,
      description,
    });
  });

  return {
    inputWasArray: true,
    items,
    invalidIndexes,
  };
}
