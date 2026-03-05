<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import DetailHeader from '../components/DetailHeader.svelte';

  const { Story } = defineMeta({
    title: 'Molecules/DetailHeader',
    component: DetailHeader,
    tags: ['autodocs'],
    parameters: {
      layout: 'fullscreen',
      controls: {
        include: ['title', 'excerpt'],
      },
      docs: {
        description: {
          component:
            'Content-only page/post detail header block with responsive title and excerpt typography.',
        },
      },
    },
    args: {
      title: 'Page Title',
      excerpt: 'Page excerpt',
    },
    argTypes: {
      title: {
        control: 'text',
        description: 'Required visible page title text.',
      },
      excerpt: {
        control: 'text',
        description: 'Optional supporting excerpt text.',
      },
      class: {
        control: false,
        table: {
          disable: true,
        },
      },
    },
  });
</script>

<style>
  .detail-header-story {
    inline-size: 100%;
    padding-block: var(--space-section-block-sm);
  }

  .detail-header-story__rail {
    inline-size: 100%;
  }
</style>

<Story name="Default" args={{ title: 'Page Title', excerpt: 'Page excerpt' }}>
  {#snippet template(args)}
    <div class="detail-header-story">
      <div class="rail rail--lg rail--padded detail-header-story__rail">
        <DetailHeader {...args} />
      </div>
    </div>
  {/snippet}
</Story>

<Story
  name="Without Excerpt"
  args={{ title: 'Page Title', excerpt: '' }}
  parameters={{ controls: { include: ['title'] } }}
>
  {#snippet template(args)}
    <div class="detail-header-story">
      <div class="rail rail--lg rail--padded detail-header-story__rail">
        <DetailHeader {...args} />
      </div>
    </div>
  {/snippet}
</Story>
