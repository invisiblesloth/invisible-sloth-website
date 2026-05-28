<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import BadgeGroup from '../components/BadgeGroup.svelte';
  import Badge from '../components/Badge.svelte';

  const { Story } = defineMeta({
    title: 'Molecules/BadgeGroup',
    component: BadgeGroup,
    tags: ['autodocs'],
    parameters: {
      controls: {
        include: [],
      },
      docs: {
        description: {
          component:
            'Layout-only badge wrapper. The root `class` hook lands on the root div for layout/global selectors only.',
        },
      },
    },
    argTypes: {
      class: {
        control: false,
        description:
          'Optional root div class hook for layout hooks, global utilities, and global selectors.',
      },
    },
  });
</script>

<style>
  :global(.badge-group-story__root-hook) {
    outline: 1px dashed var(--color-outline);
    outline-offset: var(--space-100);
  }
</style>

<Story name="Default">
  <BadgeGroup>
    <Badge variant="playdate" label="Playdate" />
    <Badge variant="default" label="In Progress" />
  </BadgeGroup>
</Story>

<Story
  name="Root Class Hook"
  parameters={{
    docs: {
      description: {
        story:
          'Marker-only coverage: the class lands on the root div for layout/global selectors and is not a theming API.',
      },
    },
  }}
>
  <BadgeGroup class="badge-group-story__root-hook">
    <Badge variant="playdate" label="Playdate" />
    <Badge variant="default" label="In Progress" />
  </BadgeGroup>
</Story>
