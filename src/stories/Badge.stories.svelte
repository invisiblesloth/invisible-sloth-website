<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import Badge from '../components/Badge.svelte';
  import { BADGE_VARIANTS, type BadgeVariant } from '../lib/badge';

  const normalizedRuntimeVariant = ' Playdate ' as unknown as BadgeVariant;
  const invalidRuntimeVariant = 'unsupported-platform' as unknown as BadgeVariant;

  const { Story } = defineMeta({
    title: 'Atoms/Badge',
    component: Badge,
    tags: ['autodocs'],
    argTypes: {
      variant: {
        control: 'select',
        options: BADGE_VARIANTS,
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

<Story
  name="Normalized Runtime Variant"
  args={{
    variant: normalizedRuntimeVariant,
    label: 'Playdate',
  }}
  parameters={{
    docs: {
      description: {
        story:
          'Casts padded mixed-case runtime input through the strict public type. Badge should normalize to the Playdate variant without warning.',
      },
    },
  }}
/>

<Story
  name="Invalid Runtime Variant Fallback"
  args={{
    variant: invalidRuntimeVariant,
    label: 'Invalid Variant',
  }}
  parameters={{
    docs: {
      description: {
        story:
          'Casts an unsupported runtime variant through the strict public type. Badge should render as the default variant and emit the deduplicated dev-only warning.',
      },
    },
  }}
/>
