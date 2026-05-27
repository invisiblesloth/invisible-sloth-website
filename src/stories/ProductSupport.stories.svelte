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
      href: '#tracer-app-privacy-policy',
    },
    {
      label: 'Tracer App Terms of Use',
      href: '#tracer-app-terms-of-use',
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
    emailPrompt: 'Have a question, found a bug, or want to send beta feedback? Email',
    supportEmail: 'tracer@invisiblesloth.com',
    supportDetail:
      "Because Tracer keeps your data on your device, Invisible Sloth doesn't have access to your records. We can still help you troubleshoot and work through the options available on your phone.",
    documentsHeading: 'Tracer app documents',
    documents: defaultDocuments,
    headingLevel: 'h2',
    documentsHeadingLevel: 'h3',
  };

  const { Story } = defineMeta({
    title: 'Molecules/ProductSupport',
    component: ProductSupport,
    tags: ['autodocs'],
    parameters: {
      controls: {
        include: [
          'heading',
          'emailPrompt',
          'supportEmail',
          'supportDetail',
          'documentsHeading',
          'documents',
          'headingLevel',
          'documentsHeadingLevel',
        ],
      },
      docs: {
        description: {
          component:
            'Self-contained product support section with a Figma-aligned rail, support contact copy, and document links. Required strings and document links fail fast when blank or malformed. Email syntax validation is out of scope. Default heading structure is h2 then h3; callers using a different page hierarchy should set both heading levels intentionally.',
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
        control: 'text',
        description: 'Required explanatory support copy.',
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
          'Semantic heading level for the documents heading. Defaults independently to h3.',
      },
    },
  });
</script>

<Story name="Default" />

<Story
  name="Long Content"
  args={{
    emailPrompt:
      'Have a long support question, found a subtle bug, want to send beta feedback, or need help understanding how Tracer records time on your iPhone? Email',
    supportDetail:
      'Because Tracer keeps every activity, entry, note, and timer record on your device, Invisible Sloth cannot inspect your records remotely. We can still help you troubleshoot settings, exports, editing questions, and the options available directly on your phone.',
    documents: longDocuments,
  }}
/>

<Story
  name="Many Documents"
  args={{
    documents: manyDocuments,
  }}
/>

<Story
  name="Whitespace Trim"
  args={{
    heading: '  Support  ',
    emailPrompt: '  Have a question, found a bug, or want to send beta feedback? Email  ',
    supportEmail: '  tracer@invisiblesloth.com  ',
    supportDetail:
      "  Because Tracer keeps your data on your device, Invisible Sloth doesn't have access to your records. We can still help you troubleshoot and work through the options available on your phone.  ",
    documentsHeading: '  Tracer app documents  ',
    documents: [
      {
        label: '  Tracer App Privacy Policy  ',
        href: '  #tracer-app-privacy-policy  ',
      },
      {
        label: '  Tracer App Terms of Use  ',
        href: '  #tracer-app-terms-of-use  ',
      },
    ],
  }}
/>

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
          'Malformed semantic heading levels fall back to h2 and h3. This is not a supported TypeScript authoring shape.',
      },
    },
  }}
/>
