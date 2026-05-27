<script module lang="ts">
  import { requireNonEmptyString } from '../lib/componentValidation';

  export type ProductSupportDocumentLink = {
    label: string;
    href: string;
  };

  type ResolvedProductSupportDocumentLink = ProductSupportDocumentLink & {
    index: number;
  };

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

    return documents.map((documentLink, index) => {
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
   * Self-contained product support section with a Figma-aligned rail, support
   * contact copy, and document links. Required primary content fails fast.
   * Forwarded section attributes land on the root <section>.
   *
   * Default heading structure is h2 then h3. Callers using a different page
   * hierarchy should set both heading levels intentionally.
   *
   * @prop {string} heading - Required visible section heading, trimmed at the boundary
   * @prop {string} emailPrompt - Required copy before the support email link
   * @prop {string} supportEmail - Required visible email and mailto target; syntax validation is out of scope
   * @prop {string} supportDetail - Required explanatory support copy
   * @prop {string} documentsHeading - Required visible heading for document links
   * @prop {ProductSupportDocumentLink[]} documents - Required non-empty document link list
   * @prop {string} headingLevel - Semantic heading level for heading, h2-h6
   * @prop {string} documentsHeadingLevel - Semantic heading level for documentsHeading, h3-h6
   * @prop {string} class - Additional classes merged onto the root section
   */
  import type { SvelteHTMLElements } from 'svelte/elements';
  import { warnOnce } from '../lib/devWarnings';
  import Heading from './Heading.svelte';

  const SUPPORT_HEADING_LEVELS = ['h2', 'h3', 'h4', 'h5', 'h6'] as const;
  const DOCUMENTS_HEADING_LEVELS = ['h3', 'h4', 'h5', 'h6'] as const;
  const VALID_SUPPORT_HEADING_LEVELS = new Set<unknown>(SUPPORT_HEADING_LEVELS);
  const VALID_DOCUMENTS_HEADING_LEVELS = new Set<unknown>(DOCUMENTS_HEADING_LEVELS);

  type SupportHeadingLevel = (typeof SUPPORT_HEADING_LEVELS)[number];
  type DocumentsHeadingLevel = (typeof DOCUMENTS_HEADING_LEVELS)[number];
  type SectionAttributes = Omit<SvelteHTMLElements['section'], 'children' | 'class'>;

  type Props = SectionAttributes & {
    heading: string;
    emailPrompt: string;
    supportEmail: string;
    supportDetail: string;
    documentsHeading: string;
    documents: ProductSupportDocumentLink[];
    headingLevel?: SupportHeadingLevel;
    documentsHeadingLevel?: DocumentsHeadingLevel;
    class?: string;
  };

  let {
    heading,
    emailPrompt,
    supportEmail,
    supportDetail,
    documentsHeading,
    documents,
    headingLevel = 'h2',
    documentsHeadingLevel = 'h3',
    class: className = '',
    ...restProps
  }: Props = $props();

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
  const normalizedSupportDetail = $derived(
    requireNonEmptyString(supportDetail, {
      componentName: 'ProductSupport',
      propName: 'supportDetail',
    })
  );
  const normalizedDocumentsHeading = $derived(
    requireNonEmptyString(documentsHeading, {
      componentName: 'ProductSupport',
      propName: 'documentsHeading',
    })
  );
  const normalizedDocuments = $derived(resolveProductSupportDocuments(documents));
  const emailHref = $derived(`mailto:${normalizedSupportEmail}`);
  const normalizedHeadingLevel = $derived(
    VALID_SUPPORT_HEADING_LEVELS.has(headingLevel) ? headingLevel : 'h2'
  );
  const normalizedDocumentsHeadingLevel = $derived(
    VALID_DOCUMENTS_HEADING_LEVELS.has(documentsHeadingLevel) ? documentsHeadingLevel : 'h3'
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

    if (!VALID_DOCUMENTS_HEADING_LEVELS.has(documentsHeadingLevel)) {
      warnOnce(
        'product-support:invalid-documents-heading-level',
        '[ProductSupport] `documentsHeadingLevel` must be one of h3, h4, h5, h6. Falling back to h3.'
      );
    }
  });
</script>

<section {...restProps} class={productSupportClasses}>
  <div class="product-support__rail">
    <div class="product-support__surface">
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
          <p>{normalizedSupportDetail}</p>
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
  </div>
</section>

<style>
  .product-support {
    display: flex;
    flex-direction: column;
    align-items: center;
    inline-size: 100%;
    padding-block-end: var(--space-section-block);
  }

  .product-support__rail {
    box-sizing: border-box;
    inline-size: 100%;
    margin-inline: auto;
  }

  .product-support__surface {
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
    .product-support__rail {
      padding-inline: var(--space-rail-inline);
    }

    .product-support__surface {
      padding-inline: var(--space-rail-inline-sm);
      border-radius: var(--radius-xl);
    }
  }

  @media (min-width: 1176px) {
    .product-support__rail {
      max-inline-size: var(--size-rail-md);
      padding-inline: 0;
    }

    .product-support__surface {
      padding-inline: var(--space-rail-inline);
    }
  }
</style>
