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

  const { Story } = defineMeta({
    title: 'Molecules/ProductStatus',
    component: ProductStatus,
    tags: ['autodocs'],
    parameters: {
      layout: 'fullscreen',
      controls: {
        include: ['text', 'detail', 'class'],
      },
      docs: {
        description: {
          component:
            'Figma-aligned quiet product status panel for short product-page context. ProductStatus intentionally supports only `text`, `detail`, and a root `class`; `class` lands on the `.product-status` root panel as a styling hook. Parent composition owns rails, placement, and section rhythm; these stories use preview-only wrapper markup for realistic rail width.',
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
          'Required visible status copy. Blank or non-string runtime values throw during render.',
      },
      detail: {
        control: 'text',
        description: 'Optional secondary status detail, trimmed before rendering.',
      },
      class: {
        control: 'text',
        description:
          'Optional string classes appended to the `.product-status` root panel as a styling hook.',
      },
    },
  });
</script>

<style>
  .product-status-story__preview-rail {
    box-sizing: border-box;
    inline-size: 100%;
    margin-inline: auto;
    padding-inline: var(--space-rail-inline);
  }

  :global(.product-status-story__panel-hook) {
    outline: 2px solid var(--color-outline);
    outline-offset: -4px;
  }

  @media (min-width: 1176px) {
    .product-status-story__preview-rail {
      max-inline-size: var(--size-rail-md);
      padding-inline: 0;
    }
  }
</style>

<Story name="Default">
  {#snippet template(args)}
    <div class="product-status-story__preview-rail" data-preview-layout="story-owned">
      <ProductStatus {...args} />
    </div>
  {/snippet}
</Story>

<Story
  name="Long Sentence"
  args={{
    text: longStatusText,
    detail: longDetailText,
  }}
>
  {#snippet template(args)}
    <div class="product-status-story__preview-rail" data-preview-layout="story-owned">
      <ProductStatus {...args} />
    </div>
  {/snippet}
</Story>

<Story
  name="Long Unbroken Token"
  args={{
    text: 'Tracer is currently in private beta.',
    detail: longUnbrokenTokenText,
  }}
>
  {#snippet template(args)}
    <div class="product-status-story__preview-rail" data-preview-layout="story-owned">
      <ProductStatus {...args} />
    </div>
  {/snippet}
</Story>

<Story
  name="Panel Class Hook"
  args={{
    class: 'product-status-story__panel-hook',
  }}
>
  {#snippet template(args)}
    <div class="product-status-story__preview-rail" data-preview-layout="story-owned">
      <ProductStatus {...args} />
    </div>
  {/snippet}
</Story>
