<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import ProductStatus from '../components/ProductStatus.svelte';

  const longStatusText =
    'Tracer is currently in private beta with a small group while the core timer, entry editing, and on-device data workflows are being tested.';
  const defaultDetailText = 'Requires iPhone running iOS 26 or later.';
  const longDetailText =
    'Requires iPhone running iOS 26 or later while the private beta remains limited to a small testing group.';
  const longUnbrokenTokenText =
    'Tracer private beta reference: TracerPrivateBetaStatusSuperLongUnbrokenTokenThatShouldStillWrapInsideTheStatusPanelAtCompactWidthsWithoutEscapingTheCanvas.';
  const blankRuntimeText = '   ' as unknown as string;
  const nonStringRuntimeText = { text: 'Tracer is currently in private beta.' } as unknown as string;

  const { Story } = defineMeta({
    title: 'Molecules/ProductStatus',
    component: ProductStatus,
    tags: ['autodocs'],
    parameters: {
      controls: {
        include: ['text', 'detail'],
      },
      docs: {
        description: {
          component:
            'Figma-aligned quiet product status panel for short product-page context. ProductStatus intentionally supports only `text`, `detail`, and a root `class` for layout hooks, global utilities, and global selectors; use wrapper markup for demo structure.',
        },
      },
    },
    args: {
      text: 'Tracer is currently in private beta.',
      detail: defaultDetailText,
    },
    argTypes: {
      text: {
        control: 'text',
        description:
          'Required visible status copy. Blank or non-string runtime values are guarded and render no DOM.',
      },
      detail: {
        control: 'text',
        description: 'Optional secondary status detail.',
      },
    },
  });
</script>

<style>
  .product-status-story__absence-check {
    min-block-size: var(--space-1200);
    padding: var(--space-300);
    border: 1px dashed var(--color-outline);
  }

  .product-status-story__absence-label {
    margin: 0 0 var(--space-300);
    color: var(--color-on-surface-variant);
  }
</style>

<Story name="Default" />

<Story
  name="Long Sentence"
  args={{
    text: longStatusText,
    detail: longDetailText,
  }}
/>

<Story
  name="Long Unbroken Token"
  args={{
    text: 'Tracer is currently in private beta.',
    detail: longUnbrokenTokenText,
  }}
/>

<Story
  name="Blank Runtime Text (No DOM)"
  args={{
    text: blankRuntimeText,
  }}
  parameters={{
    docs: {
      description: {
        story:
          'Blank runtime text is guarded against and renders no ProductStatus DOM. This is not a supported TypeScript authoring shape.',
      },
    },
  }}
>
  {#snippet template(args)}
    <div class="product-status-story__absence-check" data-case="blank-text">
      <p class="product-status-story__absence-label text-label-large">
        Absence check: no ProductStatus DOM should render below.
      </p>
      <ProductStatus {...args} />
    </div>
  {/snippet}
</Story>

<Story
  name="Non-string Runtime Text (No DOM)"
  args={{
    text: nonStringRuntimeText,
  }}
  parameters={{
    docs: {
      description: {
        story:
          'Malformed non-string runtime text is guarded against and renders no ProductStatus DOM. This is not a supported TypeScript authoring shape.',
      },
    },
  }}
>
  {#snippet template(args)}
    <div class="product-status-story__absence-check" data-case="non-string-text">
      <p class="product-status-story__absence-label text-label-large">
        Absence check: no ProductStatus DOM should render below.
      </p>
      <ProductStatus {...args} />
    </div>
  {/snippet}
</Story>
