<script module lang="ts">
  import type { SvelteHTMLElements } from 'svelte/elements';
  import { requireNonEmptyString } from '../lib/componentValidation';

  export type ProductSupportDocumentLink = {
    label: string;
    href: string;
  };

  type ResolvedProductSupportDocumentLink = ProductSupportDocumentLink & {
    index: number;
  };

  const SUPPORT_HEADING_LEVELS = ['h2', 'h3', 'h4', 'h5', 'h6'] as const;
  const DOCUMENTS_HEADING_LEVELS = ['h3', 'h4', 'h5', 'h6'] as const;
  const VALID_SUPPORT_HEADING_LEVELS = new Set<unknown>(SUPPORT_HEADING_LEVELS);
  const VALID_DOCUMENTS_HEADING_LEVELS = new Set<unknown>(DOCUMENTS_HEADING_LEVELS);

  type SupportHeadingLevel = (typeof SUPPORT_HEADING_LEVELS)[number];
  type DocumentsHeadingLevel = (typeof DOCUMENTS_HEADING_LEVELS)[number];
  type PanelAttributes = Omit<SvelteHTMLElements['div'], 'children' | 'class'>;
  type SupportCopyProps =
    | {
        /** @deprecated Use supportDetails for support copy. */
        supportDetail: string;
        supportDetails?: never;
      }
    | {
        supportDetail?: never;
        supportDetails: string[];
      };

  type BaseProps = PanelAttributes & {
    heading: string;
    emailPrompt: string;
    supportEmail: string;
    documentsHeading: string;
    documents: ProductSupportDocumentLink[];
    headingLevel?: SupportHeadingLevel;
    documentsHeadingLevel?: DocumentsHeadingLevel;
    class?: string;
  };

  export type ProductSupportProps = BaseProps & SupportCopyProps;

  const DERIVED_DOCUMENTS_HEADING_LEVELS: Record<SupportHeadingLevel, DocumentsHeadingLevel> = {
    h2: 'h3',
    h3: 'h4',
    h4: 'h5',
    h5: 'h6',
    h6: 'h6',
  };

  function requireSupportDetailsItem(value: unknown, index: number): string {
    const normalizedValue = typeof value === 'string' ? value.trim() : '';

    if (normalizedValue.length === 0) {
      throw new Error(
        `[ProductSupport] \`supportDetails.${index}\` must resolve to a non-empty string after trimming.`
      );
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
        '[ProductSupport] Pass exactly one of `supportDetail` or `supportDetails`; both were provided.'
      );
    }

    if (!hasSupportDetail && !hasSupportDetails) {
      throw new Error(
        '[ProductSupport] Pass exactly one of `supportDetail` or `supportDetails`; neither was provided.'
      );
    }

    if (hasSupportDetails) {
      if (!Array.isArray(supportDetails) || supportDetails.length === 0) {
        throw new Error('[ProductSupport] `supportDetails` must be a non-empty array.');
      }

      return Array.from(supportDetails, (supportDetailItem, index) =>
        requireSupportDetailsItem(supportDetailItem, index)
      );
    }

    return [
      requireNonEmptyString(supportDetail, {
        componentName: 'ProductSupport',
        propName: 'supportDetail',
      }),
    ];
  }

  function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }

  function requireDocumentString(
    value: unknown,
    index: number,
    propName: keyof ProductSupportDocumentLink
  ): string {
    if (typeof value !== 'string' || value.trim().length === 0) {
      throw new Error(
        `[ProductSupport] \`documents.${index}.${propName}\` must resolve to a non-empty string after trimming.`
      );
    }

    return requireNonEmptyString(value, {
      componentName: 'ProductSupport',
      propName: `documents.${propName}`,
    });
  }

  function resolveProductSupportDocuments(
    documents: unknown
  ): ResolvedProductSupportDocumentLink[] {
    if (!Array.isArray(documents) || documents.length === 0) {
      throw new Error('[ProductSupport] `documents` must be a non-empty array.');
    }

    return Array.from(documents, (documentLink, index) => {
      if (!isRecord(documentLink)) {
        throw new Error(
          `[ProductSupport] \`documents.${index}\` must include non-empty string label and href values.`
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
</script>

<script lang="ts">
  /**
   * ProductSupport
   *
   * Product support panel with support contact copy and document links.
   * Required primary content fails fast. Parent composition owns section
   * semantics, anchors, rails, placement, and section rhythm.
   * Forwarded div attributes land on the root panel <div>.
   *
   * Default heading structure is h2 then derived document heading level.
   * Callers using a different page hierarchy may set both heading levels
   * intentionally.
   *
   * @prop {string} heading - Required visible section heading, trimmed at the boundary
   * @prop {string} emailPrompt - Required copy before the support email link
   * @prop {string} supportEmail - Required visible email and mailto target; syntax validation is out of scope
   * @prop {string} supportDetail - Deprecated legacy single-paragraph support copy; pass exactly one of supportDetail or supportDetails
   * @prop {string[]} supportDetails - Preferred multi-paragraph support copy; pass exactly one of supportDetail or supportDetails
   * @prop {string} documentsHeading - Required visible heading for document links
   * @prop {ProductSupportDocumentLink[]} documents - Required non-empty document link list
   * @prop {string} headingLevel - Semantic heading level for heading, h2-h6
   * @prop {string} documentsHeadingLevel - Optional semantic heading level for documentsHeading, h3-h6; derives from headingLevel when omitted
   * @prop {string} class - Additional classes merged onto the root panel
   */
  import { warnOnce } from '../lib/devWarnings';
  import Heading from './Heading.svelte';

  let {
    heading,
    emailPrompt,
    supportEmail,
    supportDetail,
    supportDetails,
    documentsHeading,
    documents,
    headingLevel = 'h2',
    documentsHeadingLevel,
    class: className = '',
    ...restProps
  }: ProductSupportProps = $props();

  function normalizeSupportHeadingLevel(value: unknown): SupportHeadingLevel {
    return VALID_SUPPORT_HEADING_LEVELS.has(value) ? (value as SupportHeadingLevel) : 'h2';
  }

  function resolveDocumentsHeadingLevel(
    value: unknown,
    derivedHeadingLevel: SupportHeadingLevel
  ): DocumentsHeadingLevel {
    if (value === undefined) {
      return DERIVED_DOCUMENTS_HEADING_LEVELS[derivedHeadingLevel];
    }

    return VALID_DOCUMENTS_HEADING_LEVELS.has(value) ? (value as DocumentsHeadingLevel) : 'h3';
  }

  const normalizedHeading = $derived(
    requireNonEmptyString(heading, {
      componentName: 'ProductSupport',
      propName: 'heading',
    })
  );
  const normalizedEmailPrompt = $derived(
    requireNonEmptyString(emailPrompt, {
      componentName: 'ProductSupport',
      propName: 'emailPrompt',
    })
  );
  const normalizedSupportEmail = $derived(
    requireNonEmptyString(supportEmail, {
      componentName: 'ProductSupport',
      propName: 'supportEmail',
    })
  );
  const normalizedSupportDetails = $derived(
    resolveProductSupportDetails(supportDetail, supportDetails)
  );
  const normalizedDocumentsHeading = $derived(
    requireNonEmptyString(documentsHeading, {
      componentName: 'ProductSupport',
      propName: 'documentsHeading',
    })
  );
  const normalizedDocuments = $derived(resolveProductSupportDocuments(documents));
  const emailHref = $derived(`mailto:${normalizedSupportEmail}`);
  const normalizedHeadingLevel = $derived(normalizeSupportHeadingLevel(headingLevel));
  const normalizedDocumentsHeadingLevel = $derived(
    resolveDocumentsHeadingLevel(documentsHeadingLevel, normalizedHeadingLevel)
  );
  const normalizedClassName = $derived(String(className ?? '').trim());
  const productSupportClasses = $derived(
    ['product-support', normalizedClassName].filter(Boolean).join(' ')
  );

  $effect(() => {
    if (!VALID_SUPPORT_HEADING_LEVELS.has(headingLevel)) {
      warnOnce(
        'product-support:invalid-heading-level',
        '[ProductSupport] `headingLevel` must be one of h2, h3, h4, h5, h6. Falling back to h2.'
      );
    }

    if (
      documentsHeadingLevel !== undefined &&
      !VALID_DOCUMENTS_HEADING_LEVELS.has(documentsHeadingLevel)
    ) {
      warnOnce(
        'product-support:invalid-documents-heading-level',
        '[ProductSupport] `documentsHeadingLevel` must be one of h3, h4, h5, h6. Falling back to h3.'
      );
    }
  });
</script>

<div {...restProps} class={productSupportClasses}>
  <div class="product-support__content">
    <Heading
      level={normalizedHeadingLevel}
      visualLevel="h3"
      text={normalizedHeading}
      class="product-support__heading"
    />

    <div class="product-support__body text-body-responsive-tight">
      <p>
        {normalizedEmailPrompt}{' '}
        <a href={emailHref} class="product-support__link text-link">{normalizedSupportEmail}</a>.
      </p>
      {#each normalizedSupportDetails as normalizedSupportDetail}
        <p>{normalizedSupportDetail}</p>
      {/each}
    </div>
  </div>

  <div class="product-support__divider" aria-hidden="true"></div>

  <div class="product-support__content">
    <Heading
      level={normalizedDocumentsHeadingLevel}
      visualLevel="h4"
      text={normalizedDocumentsHeading}
      class="product-support__documents-heading"
    />

    <ul class="product-support__documents text-body-responsive-tight">
      {#each normalizedDocuments as documentLink (documentLink.index)}
        <li class="product-support__document">
          <a href={documentLink.href} class="product-support__link text-link">
            {documentLink.label}
          </a>
        </li>
      {/each}
    </ul>
  </div>
</div>

<style>
  .product-support {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    box-sizing: border-box;
    inline-size: 100%;
    gap: var(--space-gutter-loose);
    padding: var(--space-section-block-lg) var(--space-rail-inline);
    border-radius: var(--radius-sm);
    background: var(--color-primary-container);
    color: var(--color-on-primary-container);
    box-shadow: var(--effect-elevation-2);

    --text-link-underline: color-mix(in srgb, currentColor 58%, transparent);
  }

  .product-support__content {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    inline-size: 100%;
    min-inline-size: 0;
    gap: var(--space-gutter);
    overflow-wrap: break-word;
  }

  .product-support__heading,
  .product-support__documents-heading,
  .product-support__body,
  .product-support__documents {
    inline-size: 100%;
    min-inline-size: 0;
  }

  .product-support__body {
    overflow-wrap: break-word;
  }

  .product-support__body p {
    margin: 0;
    min-inline-size: 0;
    overflow-wrap: break-word;
  }

  .product-support__body p + p {
    margin-block-start: var(--space-gutter);
  }

  .product-support__link {
    color: inherit;
    overflow-wrap: anywhere;
  }

  .product-support__divider {
    inline-size: 100%;
    block-size: 2px;
    background: var(--color-inverse-primary);
  }

  .product-support__documents {
    display: grid;
    gap: var(--space-400);
    list-style: disc;
    padding-inline-start: var(--space-600);
    margin: 0;
  }

  .product-support__document {
    padding-inline-start: var(--space-100);
    overflow-wrap: break-word;
  }

  @media (min-width: 632px) {
    .product-support {
      border-radius: var(--radius-xl);
      padding-inline: var(--space-rail-inline-sm);
    }
  }

  @media (min-width: 1176px) {
    .product-support {
      padding-inline: var(--space-rail-inline);
    }
  }
</style>
