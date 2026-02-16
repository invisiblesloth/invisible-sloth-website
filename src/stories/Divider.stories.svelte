<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import Divider from '../components/Divider.svelte';

  const { Story } = defineMeta({
    title: 'Atoms/Divider',
    component: Divider,
    tags: ['autodocs'],
    argTypes: {
      orientation: {
        control: { type: 'select' },
        options: ['horizontal', 'vertical'],
        description: 'Orientation of the divider',
      },
      layout: {
        control: { type: 'select' },
        options: ['Full-width', 'Middle-inset'],
        description: 'Layout variant: full-width spans the entire container, middle-inset has spacing on sides',
      },
      thickness: {
        control: { type: 'select' },
        options: ['Default', 'Double'],
        description: 'Thickness variant: default is 1px, double is 2px',
      },
    },
  });
</script>

<style>
  /* Story-only demo styles */
  :global(.divider--vertical) {
    height: 160px;
  }
  /* cancel the margins' visual growth */
  :global(.divider--vertical.divider--middle-inset) {
    height: calc(160px - 2 * var(--space-600)) !important;
  }
</style>

<Story
  name="Horizontal Full-width Default"
  args={{
    orientation: 'horizontal',
    layout: 'Full-width',
    thickness: 'Default'
  }}
/>

<Story
  name="Horizontal Full-width Double"
  args={{
    orientation: 'horizontal',
    layout: 'Full-width',
    thickness: 'Double'
  }}
/>

<Story
  name="Horizontal Middle-inset Default"
  args={{
    orientation: 'horizontal',
    layout: 'Middle-inset',
    thickness: 'Default'
  }}
/>

<Story
  name="Horizontal Middle-inset Double"
  args={{
    orientation: 'horizontal',
    layout: 'Middle-inset',
    thickness: 'Double'
  }}
/>

<Story
  name="Vertical Full-width Default"
  args={{
    orientation: 'vertical',
    layout: 'Full-width',
    thickness: 'Default'
  }}
/>

<Story
  name="Vertical Full-width Double"
  args={{
    orientation: 'vertical',
    layout: 'Full-width',
    thickness: 'Double'
  }}
/>

<Story
  name="Vertical Middle-inset Default"
  args={{
    orientation: 'vertical',
    layout: 'Middle-inset',
    thickness: 'Default'
  }}
/>

<Story
  name="Vertical Middle-inset Double"
  args={{
    orientation: 'vertical',
    layout: 'Middle-inset',
    thickness: 'Double'
  }}
/>
