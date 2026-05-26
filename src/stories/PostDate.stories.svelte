<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import PostDate from '../components/PostDate.svelte';

  const { Story } = defineMeta({
    title: 'Atoms/PostDate',
    component: PostDate,
    tags: ['autodocs'],
    parameters: {
      layout: 'fullscreen',
      controls: {
        include: ['date', 'dateTime'],
      },
      docs: {
        description: {
          component:
            'Content-only publication-date atom that renders trimmed human-readable text inside a semantic time element with responsive title styling. `date` is required and fails fast when blank; blanking the required control may break the story canvas. Story wrappers provide page padding; parent compositions own vertical rhythm.',
        },
      },
    },
    args: {
      date: '5 March 2026',
      dateTime: '2026-03-05',
    },
    argTypes: {
      date: {
        control: 'text',
        description: 'Required human-readable date text, trimmed at the boundary.',
      },
      dateTime: {
        control: 'text',
        description:
          'Optional machine-readable value mapped to the rendered datetime attribute; provide a valid HTML datetime string.',
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
  .post-date-story {
    inline-size: 100%;
    padding-block: var(--space-section-block-sm);
  }

  .post-date-story__rail {
    inline-size: 100%;
  }
</style>

<Story name="Default" args={{ date: '5 March 2026', dateTime: '2026-03-05' }}>
  {#snippet template(args)}
    <div class="post-date-story">
      <div class="rail rail--lg rail--padded post-date-story__rail">
        <PostDate {...args} />
      </div>
    </div>
  {/snippet}
</Story>

<Story
  name="With Datetime Attribute"
  args={{
    date: '5 March 2026',
    dateTime: '2026-03-05',
  }}
>
  {#snippet template(args)}
    <div class="post-date-story">
      <div class="rail rail--lg rail--padded post-date-story__rail">
        <PostDate {...args} />
      </div>
    </div>
  {/snippet}
</Story>
