<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import Tag from '../components/Tag.svelte';
  import TagGroup from '../components/TagGroup.svelte';

  const { Story } = defineMeta({
    title: 'Molecules/TagGroup',
    component: TagGroup,
    tags: ['autodocs'],
    parameters: {
      docs: {
        description: {
          component:
            'Wraps tags with consistent internal row and column gaps. Parent compositions own outer vertical spacing and padding.',
        },
      },
    },
  });
</script>

<style>
  .tag-group-story {
    inline-size: 100%;
    padding-block: var(--space-section-block-sm);
    padding-inline: var(--space-400);
  }
</style>

<Story name="Mixed Actions">
  <div class="tag-group-story">
    <TagGroup>
      <Tag label="Primary Tag" />
      <Tag label="Secondary Tag" href="https://invisiblesloth.com/" />
      <Tag label="Secondary Tag" />
      <Tag label="Secondary Tag" href="https://invisiblesloth.com/" target="_blank" />
      <Tag label="Secondary Tag" />
    </TagGroup>
  </div>
</Story>
