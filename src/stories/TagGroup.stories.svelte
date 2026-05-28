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
            'Layout-only wrapper for consistent internal tag row and column gaps. Parent compositions own data mapping, validation, outer vertical spacing, and padding. Existing broader root forwarding is public: class and rest props land on the root div.',
        },
      },
      controls: {
        include: [],
      },
    },
    argTypes: {
      class: {
        control: false,
        description:
          'Optional root div class hook; existing rest props also forward to the root.',
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

<Story name="Wrapping And Gaps">
  <div class="tag-group-story">
    <TagGroup>
      <Tag label="Primary Tag" />
      <Tag label="Secondary Tag" />
      <Tag label="Longer Tag Label" />
      <Tag label="Compact" />
      <Tag label="Another Tag" />
    </TagGroup>
  </div>
</Story>
