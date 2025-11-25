<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import BadgeGroup from '../components/BadgeGroup.svelte';
  import Badge from '../components/Badge.svelte';

  const { Story } = defineMeta({
    title: 'Molecules/BadgeGroup',
    component: BadgeGroup,
    tags: ['autodocs'],
  });
</script>

<Story name="Default">
  <BadgeGroup>
    <Badge variant="playdate" label="Playdate" />
    <Badge variant="default" label="In Progress" />
  </BadgeGroup>
</Story>
