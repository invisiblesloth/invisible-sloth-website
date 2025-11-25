<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import Badge from '../components/Badge.svelte';

  const { Story } = defineMeta({
    title: 'Atoms/Badge',
    component: Badge,
    tags: ['autodocs'],
    argTypes: {
      variant: {
        control: 'select',
        options: ['default', 'boardgame', 'playdate', 'apple', 'web', 'error'],
        description: 'Badge color variant',
      },
      label: {
        control: 'text',
        description: 'Badge text label',
      },
    },
  });
</script>

<Story
  name="Default"
  args={{
    variant: 'default',
    label: 'Label',
  }}
/>

<Story
  name="Boardgame"
  args={{
    variant: 'boardgame',
    label: 'Boardgame',
  }}
/>

<Story
  name="Playdate"
  args={{
    variant: 'playdate',
    label: 'Playdate',
  }}
/>

<Story
  name="Apple Platforms"
  args={{
    variant: 'apple',
    label: 'Apple Platforms',
  }}
/>

<Story
  name="Web"
  args={{
    variant: 'web',
    label: 'Web',
  }}
/>

<Story
  name="Error"
  args={{
    variant: 'error',
    label: 'Error',
  }}
/>
