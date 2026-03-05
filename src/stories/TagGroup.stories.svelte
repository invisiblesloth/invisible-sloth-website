<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import Tag from '../components/Tag.svelte';
  import TagGroup from '../components/TagGroup.svelte';

  const { Story } = defineMeta({
    title: 'Molecules/TagGroup',
    component: TagGroup,
    tags: ['autodocs'],
  });
</script>

<Story name="Mixed Actions">
  <TagGroup>
    <Tag label="Primary Tag" />
    <Tag label="Secondary Tag" href="https://invisiblesloth.com/" />
    <Tag label="Secondary Tag" />
    <Tag label="Secondary Tag" href="https://invisiblesloth.com/" target="_blank" />
    <Tag label="Secondary Tag" />
  </TagGroup>
</Story>
