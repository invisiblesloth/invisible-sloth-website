<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import Heading from '../components/Heading.svelte';

  const { Story } = defineMeta({
    title: 'Molecules/Heading',
    component: Heading,
    tags: ['autodocs'],
    parameters: {
      controls: {
        include: ['level', 'visualLevel', 'text'],
      },
      docs: {
        description: {
          component:
            'Native-ish heading primitive. Typed/native root attributes forward to the rendered h1-h6 element; `class` is appended for hooks/layout selectors while typography remains owned by heading utilities.',
        },
      },
    },
    argTypes: {
      level: {
        control: 'select',
        options: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
        description: 'Semantic heading element (h1-h6)',
        table: {
          type: { summary: 'string' },
          defaultValue: { summary: 'h1' },
        },
      },
      visualLevel: {
        control: 'select',
        options: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
        description: 'Visual heading scale. Defaults to the semantic level.',
        table: {
          type: { summary: 'string' },
          defaultValue: { summary: 'level' },
        },
      },
      text: {
        control: 'text',
        description:
          'Heading text content. Use a children snippet for rich content. If text is defined, including an empty string, it takes precedence and children are not rendered.',
        table: {
          type: { summary: 'string' },
          defaultValue: { summary: 'undefined' },
        },
      },
      class: {
        control: false,
        description:
          'Optional rendered-heading class hook for layout hooks, global utilities, and global selectors.',
      },
    },
  });
</script>

<Story
  name="H1"
  args={{
    level: 'h1',
    text: 'H1 - Primary Heading',
  }}
/>

<Story
  name="H2"
  args={{
    level: 'h2',
    text: 'H2 - Secondary Heading',
  }}
/>

<Story
  name="H3"
  args={{
    level: 'h3',
    text: 'H3 - Tertiary Heading',
  }}
/>

<Story
  name="H4"
  args={{
    level: 'h4',
    text: 'H4 - Section Heading',
  }}
/>

<Story
  name="H5"
  args={{
    level: 'h5',
    text: 'H5 - Subsection Heading',
  }}
/>

<Story
  name="H6"
  args={{
    level: 'h6',
    text: 'H6 - Minor Heading',
  }}
/>

<Story name="All Levels">
  {#snippet template()}
    <div style="display: flex; flex-direction: column; gap: 0;">
      <Heading level="h1" text="H1 - Primary Heading" />
      <Heading level="h2" text="H2 - Secondary Heading" />
      <Heading level="h3" text="H3 - Tertiary Heading" />
      <Heading level="h4" text="H4 - Section Heading" />
      <Heading level="h5" text="H5 - Subsection Heading" />
      <Heading level="h6" text="H6 - Minor Heading" />
    </div>
  {/snippet}
</Story>

<Story
  name="Semantic Visual Split"
  args={{
    level: 'h2',
    visualLevel: 'h3',
    text: 'Semantic H2 with H3 visual scale',
  }}
/>

<Story
  name="Children Snippet"
  args={{ level: 'h2' }}
  parameters={{ controls: { include: ['level', 'visualLevel'] } }}
>
  {#snippet template(args)}
    <Heading {...args}>
      Rich <em>children snippet</em> content
    </Heading>
  {/snippet}
</Story>

<Story name="Text Precedence" args={{ level: 'h2' }}>
  {#snippet template(args)}
    <Heading {...args} text="Text prop wins over children">
      This children snippet is intentionally not rendered.
    </Heading>
  {/snippet}
</Story>

<Story
  name="Long Word Wrapping"
  args={{
    level: 'h2',
    text: 'SupercalifragilisticexpialidociousHeadingWrapCheck',
  }}
/>

<Story
  name="Forwarded Attributes"
  args={{
    level: 'h2',
    text: 'Heading with forwarded attributes',
    id: 'heading-forwarded-attributes',
    class: 'heading-story-custom-class',
  }}
  parameters={{
    docs: {
      description: {
        story:
          'The custom class is intentionally only a marker so this story verifies forwarding without adding visual styling.',
      },
    },
  }}
/>
