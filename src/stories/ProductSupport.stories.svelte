<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import ProductSupport from '../components/ProductSupport.svelte';
  import type { ProductSupportDocumentLink } from '../components/ProductSupport.svelte';

  const headingLevelOptions = ['h2', 'h3', 'h4', 'h5', 'h6'] as const;
  const documentsHeadingLevelOptions = ['h3', 'h4', 'h5', 'h6'] as const;
  const invalidRuntimeHeadingLevel =
    'h1' as unknown as (typeof headingLevelOptions)[number];
  const invalidRuntimeDocumentsHeadingLevel =
    'h2' as unknown as (typeof documentsHeadingLevelOptions)[number];

  const defaultDocuments: ProductSupportDocumentLink[] = [
    {
      label: 'Tracer App Privacy Policy',
      href: '/tracer/privacy',
    },
    {
      label: 'Tracer App Terms of Use',
      href: '/tracer/terms',
    },
  ];

  const longDocuments: ProductSupportDocumentLink[] = [
    {
      label:
        'Tracer App Privacy Policy With A Longer Label That Still Wraps Inside The Support Surface',
      href: '#tracer-app-privacy-policy-with-long-label',
    },
    {
      label: 'Tracer App Terms of Use',
      href: '#tracer-app-terms-of-use',
    },
    {
      label:
        'SuperLongUnbrokenTracerSupportDocumentReferenceThatShouldWrapWithoutEscapingTheSurface',
      href: '#super-long-unbroken-tracer-support-document-reference',
    },
  ];

  const manyDocuments: ProductSupportDocumentLink[] = [
    ...defaultDocuments,
    {
      label: 'Tracer App Beta Notes',
      href: '#tracer-app-beta-notes',
    },
    {
      label: 'Tracer App Data Export Guide',
      href: '#tracer-app-data-export-guide',
    },
  ];

  const defaultArgs = {
    heading: 'Support',
    emailPrompt: 'For feedback, bug reports, or questions, email',
    supportEmail: 'support@invisiblesloth.com',
    supportDetails: [
      'Tracer stores data on your device, so Invisible Sloth does not have access to your activities, entries, notes, or backups unless you choose to send them.',
      'We are a small team, so we may not be able to reply to every email, but we do our best to read them all. Thank you for understanding.',
    ],
    documentsHeading: 'Tracer App Documents',
    documents: defaultDocuments,
    headingLevel: 'h2',
  };

  const { Story } = defineMeta({
    title: 'Organisms/ProductSupport',
    component: ProductSupport,
    tags: ['autodocs'],
    parameters: {
      layout: 'fullscreen',
      controls: {
        include: [
          'heading',
          'emailPrompt',
          'supportEmail',
          'supportDetails',
          'documentsHeading',
          'documents',
          'headingLevel',
          'documentsHeadingLevel',
        ],
      },
      docs: {
        description: {
          component:
            'Product support panel with support contact copy and document links. Parent composition owns section semantics, anchors, rails, placement, and section rhythm; these stories use preview-only wrapper markup for realistic rail width. Pass exactly one support-copy prop: preferred multi-paragraph supportDetails or deprecated legacy single-paragraph supportDetail. Required strings and document links fail fast when blank or malformed. Email syntax validation is out of scope. Root panel attributes land on the root div. Default documents heading level derives from the resolved support heading level unless documentsHeadingLevel is provided.',
        },
      },
    },
    args: defaultArgs,
    argTypes: {
      heading: {
        control: 'text',
        description: 'Required visible support section heading.',
      },
      emailPrompt: {
        control: 'text',
        description:
          'Required copy rendered before the support email link. The component inserts the space before the link.',
      },
      supportEmail: {
        control: 'text',
        description:
          'Required email address used for the visible link label and mailto target. Syntax validation is out of scope.',
      },
      supportDetail: {
        control: false,
        description:
          'Deprecated legacy single-paragraph support copy. Pass exactly one of supportDetail or supportDetails.',
      },
      supportDetails: {
        control: 'object',
        description:
          'Preferred multi-paragraph support copy. Pass exactly one of supportDetails or supportDetail.',
      },
      documentsHeading: {
        control: 'text',
        description: 'Required visible heading for the document links list.',
      },
      documents: {
        control: 'object',
        description:
          'Required non-empty array of document links. Each entry needs non-empty string label and href values; fragment hrefs are allowed.',
      },
      headingLevel: {
        control: { type: 'select' },
        options: headingLevelOptions,
        description: 'Semantic heading level for the main support heading.',
      },
      documentsHeadingLevel: {
        control: { type: 'select' },
        options: documentsHeadingLevelOptions,
        description:
          'Optional semantic heading level for the documents heading. When omitted, derives from headingLevel as h2 to h3, h3 to h4, h4 to h5, h5 to h6, and h6 to h6.',
      },
      class: {
        control: false,
        description:
          'Optional root panel class hook; root div attributes also forward to the panel.',
      },
    },
  });
</script>

<style>
  .product-support-story__preview-section {
    inline-size: 100%;
    padding-block-end: var(--space-section-block);
  }

  .product-support-story__preview-rail {
    box-sizing: border-box;
    inline-size: 100%;
    margin-inline: auto;
  }

  @media (min-width: 632px) {
    .product-support-story__preview-rail {
      padding-inline: var(--space-rail-inline);
    }
  }

  @media (min-width: 1176px) {
    .product-support-story__preview-rail {
      max-inline-size: var(--size-rail-md);
      padding-inline: 0;
    }
  }
</style>

<Story name="Default">
  {#snippet template(args)}
    <section class="product-support-story__preview-section" data-preview-layout="story-owned">
      <div class="product-support-story__preview-rail">
        <ProductSupport {...args} />
      </div>
    </section>
  {/snippet}
</Story>

<Story
  name="Long Content"
  args={{
    emailPrompt:
      'Have a long support question, found a subtle bug, want to send beta feedback, or need help understanding how Tracer records time on your iPhone? Email',
    supportDetails: [
      'Because Tracer keeps every activity, entry, note, and timer record on your device, Invisible Sloth cannot inspect your records remotely.',
      'We can still help you troubleshoot settings, exports, editing questions, and the options available directly on your phone.',
    ],
    documents: longDocuments,
  }}
>
  {#snippet template(args)}
    <section class="product-support-story__preview-section" data-preview-layout="story-owned">
      <div class="product-support-story__preview-rail">
        <ProductSupport {...args} />
      </div>
    </section>
  {/snippet}
</Story>

<Story
  name="Many Documents"
  args={{
    documents: manyDocuments,
  }}
>
  {#snippet template(args)}
    <section class="product-support-story__preview-section" data-preview-layout="story-owned">
      <div class="product-support-story__preview-rail">
        <ProductSupport {...args} />
      </div>
    </section>
  {/snippet}
</Story>

<Story
  name="Whitespace Trim"
  args={{
    heading: '  Support  ',
    emailPrompt: '  For feedback, bug reports, or questions, email  ',
    supportEmail: '  support@invisiblesloth.com  ',
    supportDetails: [
      '  Tracer stores data on your device, so Invisible Sloth does not have access to your activities, entries, notes, or backups unless you choose to send them.  ',
      '  We are a small team, so we may not be able to reply to every email, but we do our best to read them all. Thank you for understanding.  ',
    ],
    documentsHeading: '  Tracer App Documents  ',
    documents: [
      {
        label: '  Tracer App Privacy Policy  ',
        href: '  /tracer/privacy  ',
      },
      {
        label: '  Tracer App Terms of Use  ',
        href: '  /tracer/terms  ',
      },
    ],
  }}
>
  {#snippet template(args)}
    <section class="product-support-story__preview-section" data-preview-layout="story-owned">
      <div class="product-support-story__preview-rail">
        <ProductSupport {...args} />
      </div>
    </section>
  {/snippet}
</Story>

<Story
  name="Derived H6 Documents Heading"
  args={{
    headingLevel: 'h6',
  }}
  parameters={{
    docs: {
      description: {
        story:
          'Omitting documentsHeadingLevel with headingLevel h6 derives an h6 documents heading instead of exceeding the heading range.',
      },
    },
  }}
>
  {#snippet template(args)}
    <section class="product-support-story__preview-section" data-preview-layout="story-owned">
      <div class="product-support-story__preview-rail">
        <ProductSupport {...args} />
      </div>
    </section>
  {/snippet}
</Story>

<Story
  name="Invalid Heading Level Fallback"
  args={{
    headingLevel: invalidRuntimeHeadingLevel,
    documentsHeadingLevel: invalidRuntimeDocumentsHeadingLevel,
  }}
  parameters={{
    docs: {
      description: {
        story:
          'Malformed explicit semantic heading levels fall back to h2 and h3. This is not a supported TypeScript authoring shape.',
      },
    },
  }}
>
  {#snippet template(args)}
    <section class="product-support-story__preview-section" data-preview-layout="story-owned">
      <div class="product-support-story__preview-rail">
        <ProductSupport {...args} />
      </div>
    </section>
  {/snippet}
</Story>
