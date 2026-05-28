<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import TagLinkGroup from '../components/TagLinkGroup.svelte';
  import type { TagLink } from '../lib/tagLinks';

  const defaultTags: TagLink[] = [
    { label: 'Roxy', href: '/tags/roxy' },
    { label: 'Playdate', href: '/tags/playdate' },
    { label: 'Game Dev', href: '/tags/game-dev' },
  ];

  const mixedInvalidTags = [
    { label: 'Only Valid Tag', href: '/tags/valid' },
    { label: '   ', href: '/tags/blank-label' },
    { label: 'Missing Href' },
  ] as unknown as TagLink[];

  const invalidOnlyTags = [
    { label: '   ', href: '/tags/blank-label' },
    { label: 'Missing Href' },
  ] as unknown as TagLink[];

  const nonArrayRuntimeTags = 'Roxy' as unknown as TagLink[];

  const externalTags: TagLink[] = [
    {
      label: 'External Tag',
      href: 'https://invisiblesloth.com/',
      target: ' _BLANK ',
      rel: 'NoFoLlOw NOOPENER noopener',
    },
  ];

  const { Story } = defineMeta({
    title: 'Molecules/TagLinkGroup',
    component: TagLinkGroup,
    tags: ['autodocs'],
    parameters: {
      docs: {
        description: {
          component:
            'Data-owning linked tag group. TagLinkGroup validates linked tag data, renders valid tags through the layout-only TagGroup wrapper, passes class and rest props through to that internal TagGroup, and renders no DOM when there are no valid tags.',
        },
      },
      controls: {
        include: ['tags', 'componentLabel', 'warningNamespace'],
      },
    },
    argTypes: {
      tags: {
        control: 'object',
        description:
          'Linked tag data. Non-array runtime values are guarded against for malformed content/control input, not supported authoring usage.',
      },
      componentLabel: {
        control: 'text',
        description: 'Label used in dev-only runtime warnings.',
      },
      warningNamespace: {
        control: 'text',
        description: 'Namespace used for deduplicating dev-only runtime warnings.',
      },
      class: {
        control: false,
        description:
          'Passed through to the internal TagGroup root div; not exposed as a theming control.',
      },
    },
    args: {
      tags: defaultTags,
    },
  });
</script>

<script lang="ts">
  import type { Snippet } from 'svelte';
</script>

{#snippet storyWrapper(group: Snippet)}
  <div class="tag-link-group-story__wrapper" data-wrapper="rendered">
    {@render group()}
  </div>
{/snippet}

<style>
  .tag-link-group-story {
    inline-size: 100%;
    padding-block: var(--space-section-block-sm);
    padding-inline: var(--space-400);
  }

  .tag-link-group-story__stack {
    display: grid;
    gap: var(--space-500);
  }

  .tag-link-group-story__wrapper {
    padding-block: var(--space-200);
    padding-inline: var(--space-300);
    border-block: 1px solid var(--color-outline);
  }

  .tag-link-group-story__absence-check {
    min-block-size: var(--space-900);
    padding: var(--space-300);
    border: 1px dashed var(--color-outline);
  }

  :global(.tag-link-group-story__forwarded) {
    padding: var(--space-200);
    border: 1px dashed var(--color-outline);
  }
</style>

<Story name="Valid Links" />

<Story
  name="Mixed Invalid Entries"
  args={{
    tags: mixedInvalidTags,
    componentLabel: '[TagLinkGroup]',
    warningNamespace: 'tag-link-group-story-mixed',
  }}
  parameters={{
    docs: {
      description: {
        story: 'Invalid entries are skipped while valid linked tags still render.',
      },
    },
  }}
/>

<Story
  name="Invalid Only (No DOM)"
  args={{
    tags: invalidOnlyTags,
    componentLabel: '[TagLinkGroup]',
    warningNamespace: 'tag-link-group-story-invalid-only',
  }}
  parameters={{
    docs: {
      description: {
        story: 'When every runtime entry is invalid, TagLinkGroup renders no DOM.',
      },
    },
  }}
/>

<Story
  name="Non-array Runtime Guard (No DOM)"
  args={{
    tags: nonArrayRuntimeTags,
    componentLabel: '[TagLinkGroup]',
    warningNamespace: 'tag-link-group-story-non-array',
  }}
  parameters={{
    docs: {
      description: {
        story:
          'Malformed non-array runtime input is guarded against and renders no DOM. This is not a supported TypeScript authoring shape.',
      },
    },
  }}
/>

<Story
  name="Empty (No DOM)"
  args={{
    tags: [],
  }}
  parameters={{
    docs: {
      description: {
        story: 'An empty tag array renders no DOM.',
      },
    },
  }}
/>

<Story
  name="_blank Security"
  args={{
    tags: externalTags,
  }}
  parameters={{
    docs: {
      description: {
        story:
          'Target and rel are passed to Tag, where _blank targets are normalized and rel tokens are hardened.',
      },
    },
  }}
/>

<Story name="Passthrough Attributes">
  {#snippet template()}
    <div class="tag-link-group-story">
      <TagLinkGroup
        tags={defaultTags}
        class="tag-link-group-story__forwarded"
        data-story-kind="forwarded"
        aria-label="Forwarded linked tag group"
      />
    </div>
  {/snippet}
</Story>

<Story
  name="Wrapped Presence And Absence"
  parameters={{
    docs: {
      description: {
        story:
          'The wrapper receives a renderable group snippet and is only rendered when valid tags exist.',
      },
    },
  }}
>
  {#snippet template()}
    <div class="tag-link-group-story tag-link-group-story__stack">
      <div class="tag-link-group-story__absence-check" data-case="valid-wrapper">
        <TagLinkGroup
          tags={defaultTags}
          wrapper={storyWrapper}
        />
      </div>

      <div class="tag-link-group-story__absence-check" data-case="invalid-wrapper">
        <TagLinkGroup
          tags={invalidOnlyTags}
          componentLabel="[TagLinkGroup]"
          warningNamespace="tag-link-group-story-wrapper-invalid"
          wrapper={storyWrapper}
        />
      </div>
    </div>
  {/snippet}
</Story>
