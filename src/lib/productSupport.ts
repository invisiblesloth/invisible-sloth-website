import { requireNonEmptyString } from './componentValidation';

const PRODUCT_SUPPORT_COMPONENT_NAME = 'ProductSupport';
const PRODUCT_SUPPORT_ERROR_PREFIX = `[${PRODUCT_SUPPORT_COMPONENT_NAME}]`;

export type ProductSupportDocumentLink = {
  label: string;
  href: string;
};

export type ResolvedProductSupportDocumentLink = ProductSupportDocumentLink & {
  index: number;
};

export type ProductSupportContentInput = {
  heading: unknown;
  emailPrompt: unknown;
  supportEmail: unknown;
  supportDetail?: unknown;
  supportDetails?: unknown;
  documentsHeading: unknown;
  documents: unknown;
};

export type ResolvedProductSupportContent = {
  heading: string;
  emailPrompt: string;
  supportEmail: string;
  supportDetails: string[];
  documentsHeading: string;
  documents: ResolvedProductSupportDocumentLink[];
};

function formatRequiredProductSupportPathError(propPath: string): string {
  return `${PRODUCT_SUPPORT_ERROR_PREFIX} \`${propPath}\` must resolve to a non-empty string after trimming.`;
}

function requireSupportDetailsItem(value: unknown, index: number): string {
  const normalizedValue = typeof value === 'string' ? value.trim() : '';

  if (normalizedValue.length === 0) {
    throw new Error(formatRequiredProductSupportPathError(`supportDetails.${index}`));
  }

  return normalizedValue;
}

function resolveProductSupportDetails(
  supportDetail: unknown,
  supportDetails: unknown
): string[] {
  const hasSupportDetail = supportDetail !== undefined;
  const hasSupportDetails = supportDetails !== undefined;

  if (hasSupportDetail && hasSupportDetails) {
    throw new Error(
      `${PRODUCT_SUPPORT_ERROR_PREFIX} Pass exactly one of \`supportDetail\` or \`supportDetails\`; both were provided.`
    );
  }

  if (!hasSupportDetail && !hasSupportDetails) {
    throw new Error(
      `${PRODUCT_SUPPORT_ERROR_PREFIX} Pass exactly one of \`supportDetail\` or \`supportDetails\`; neither was provided.`
    );
  }

  if (hasSupportDetails) {
    if (!Array.isArray(supportDetails) || supportDetails.length === 0) {
      throw new Error(
        `${PRODUCT_SUPPORT_ERROR_PREFIX} \`supportDetails\` must be a non-empty array.`
      );
    }

    return Array.from(supportDetails, (supportDetailItem, index) =>
      requireSupportDetailsItem(supportDetailItem, index)
    );
  }

  return [
    requireNonEmptyString(supportDetail, {
      componentName: PRODUCT_SUPPORT_COMPONENT_NAME,
      propName: 'supportDetail',
    }),
  ];
}

function isNonArrayObject(value: unknown): value is Record<string, unknown> {
  // Preserve current ProductSupport behavior: class instances and other objects
  // may provide label/href, but arrays are malformed document links.
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function requireDocumentString(
  value: unknown,
  index: number,
  propName: keyof ProductSupportDocumentLink
): string {
  const normalizedValue = typeof value === 'string' ? value.trim() : '';

  if (normalizedValue.length === 0) {
    throw new Error(
      formatRequiredProductSupportPathError(`documents.${index}.${propName}`)
    );
  }

  return normalizedValue;
}

function resolveProductSupportDocuments(
  documents: unknown
): ResolvedProductSupportDocumentLink[] {
  if (!Array.isArray(documents) || documents.length === 0) {
    throw new Error(`${PRODUCT_SUPPORT_ERROR_PREFIX} \`documents\` must be a non-empty array.`);
  }

  return Array.from(documents, (documentLink, index) => {
    if (!isNonArrayObject(documentLink)) {
      throw new Error(
        `${PRODUCT_SUPPORT_ERROR_PREFIX} \`documents.${index}\` must include non-empty string label and href values.`
      );
    }

    const label = requireDocumentString(documentLink.label, index, 'label');
    const href = requireDocumentString(documentLink.href, index, 'href');

    return {
      index,
      label,
      href,
    };
  });
}

export function resolveProductSupportContent(
  input: ProductSupportContentInput
): ResolvedProductSupportContent {
  return {
    heading: requireNonEmptyString(input.heading, {
      componentName: PRODUCT_SUPPORT_COMPONENT_NAME,
      propName: 'heading',
    }),
    emailPrompt: requireNonEmptyString(input.emailPrompt, {
      componentName: PRODUCT_SUPPORT_COMPONENT_NAME,
      propName: 'emailPrompt',
    }),
    supportEmail: requireNonEmptyString(input.supportEmail, {
      componentName: PRODUCT_SUPPORT_COMPONENT_NAME,
      propName: 'supportEmail',
    }),
    supportDetails: resolveProductSupportDetails(input.supportDetail, input.supportDetails),
    documentsHeading: requireNonEmptyString(input.documentsHeading, {
      componentName: PRODUCT_SUPPORT_COMPONENT_NAME,
      propName: 'documentsHeading',
    }),
    documents: resolveProductSupportDocuments(input.documents),
  };
}
