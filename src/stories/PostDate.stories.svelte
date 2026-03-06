<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import PostDate from '../components/PostDate.svelte';

  const { Story } = defineMeta({
    title: 'Atoms/PostDate',
    component: PostDate,
    tags: ['autodocs'],
    parameters: {
      controls: {
        include: ['date', 'dateTime'],
      },
      docs: {
        description: {
          component:
            'Content-only publication-date atom that renders preformatted human-readable text inside a semantic time element with responsive title styling.',
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
        description: 'Required preformatted human-readable date text rendered as provided.',
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
</style>

<Story name="Default" args={{ date: '5 March 2026', dateTime: '2026-03-05' }} />

<Story
  name="With Datetime Attribute"
  args={{
    date: '5 March 2026',
    dateTime: '2026-03-05',
  }}
/>
