<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import ContentSection from '../components/ContentSection.svelte';
  import FeatureList from '../components/FeatureList.svelte';
  import type { FeatureListItem } from '../components/FeatureList.svelte';

  const tracerFeatures: FeatureListItem[] = [
    {
      title: 'Stored on your iPhone.',
      description:
        'Your activities, entries, and notes stay on your device. Exporting or sharing is your call.',
    },
    {
      title: 'Run one timer at a time.',
      description:
        'Starting a new activity automatically stops and saves the previous one.',
    },
    {
      title: 'Edit any time.',
      description:
        'Add notes, change start or end times, change the activity for an entry, or record time you forgot to track.',
    },
    {
      title: 'Summarize time by activity.',
      description:
        'Review the week or day chart, browse the log of recorded entries, and see totals for each activity over time.',
    },
  ];

  const longFeatureItems: FeatureListItem[] = [
    {
      title:
        'A feature title that keeps wrapping calmly even when it runs longer than normal product copy',
      description:
        'This description includes a pathological unbroken token: SuperLongUnbrokenFeatureListDescriptionTokenThatShouldStillWrapInsideCompactStorybookViewportsWithoutEscapingTheCanvasOrChangingTheListRhythm.',
    },
    {
      title: 'Duplicate title',
      description:
        'Duplicate titles are allowed because rendered items are keyed by source index rather than visible copy.',
    },
    {
      title: 'Duplicate title',
      description:
        'The second duplicate title proves repeated content remains stable while the original source index is preserved internally.',
    },
  ];

  const singleFeatureItem: FeatureListItem[] = [tracerFeatures[0]];

  const manyFeatureItems: FeatureListItem[] = [
    ...tracerFeatures,
    {
      title: 'Review your totals.',
      description:
        'Use activity totals to compare how recorded time changes across days and weeks.',
    },
    {
      title: 'Keep notes nearby.',
      description:
        'Entries can carry lightweight notes so the context for each activity stays attached to the time record.',
    },
  ];

  const mixedInvalidItems = [
    tracerFeatures[0],
    { title: '   ', description: 'Missing a usable title.' },
    { title: 'Missing description' },
    null,
    { title: 42, description: 'Number-like titles are coerced during runtime normalization.' },
    tracerFeatures[1],
  ] as unknown as FeatureListItem[];

  const invalidOnlyItems = [
    { title: '   ', description: 'Missing a usable title.' },
    { title: 'Missing description' },
    null,
  ] as unknown as FeatureListItem[];

  const nonArrayRuntimeItems = 'Stored on your iPhone.' as unknown as FeatureListItem[];

  const { Story } = defineMeta({
    title: 'Molecules/FeatureList',
    component: FeatureList,
    tags: ['autodocs'],
    parameters: {
      controls: {
        include: ['items'],
      },
      docs: {
        description: {
          component:
            'Structured feature copy list. FeatureList validates item data, renders valid title/description pairs as semantic list items, and owns quiet list styling for use inside ContentSection.',
        },
      },
    },
    args: {
      items: tracerFeatures,
    },
    argTypes: {
      items: {
        control: 'object',
        description:
          'Feature entries. Runtime values are guarded so malformed Storybook controls or untyped callers render harmlessly.',
      },
    },
  });
</script>

<style>
  .feature-list-story {
    inline-size: 100%;
    padding-block: var(--space-section-block-sm);
    padding-inline: var(--space-400);
  }

  .feature-list-story__rail {
    inline-size: 100%;
  }

  .feature-list-story__absence-check {
    min-block-size: var(--space-1200);
    padding: var(--space-300);
    border: 1px dashed var(--color-outline);
  }

  .feature-list-story__absence-label {
    margin: 0 0 var(--space-300);
    color: var(--color-on-surface-variant);
  }

  :global(.feature-list-story__forwarded) {
    outline: 1px dashed var(--color-outline);
    outline-offset: var(--space-100);
  }
</style>

<Story name="Default" />

<Story
  name="Long Content"
  args={{
    items: longFeatureItems,
  }}
/>

<Story
  name="Single Item"
  args={{
    items: singleFeatureItem,
  }}
/>

<Story
  name="Many Items"
  args={{
    items: manyFeatureItems,
  }}
/>

<Story
  name="Mixed Invalid Entries"
  args={{
    items: mixedInvalidItems,
  }}
  parameters={{
    docs: {
      description: {
        story: 'Invalid entries are skipped while valid feature items still render.',
      },
    },
  }}
/>

<Story
  name="Invalid Only (No DOM)"
  args={{
    items: invalidOnlyItems,
  }}
  parameters={{
    docs: {
      description: {
        story: 'When every runtime entry is invalid, FeatureList renders no DOM.',
      },
    },
  }}
>
  {#snippet template(args)}
    <div class="feature-list-story__absence-check" data-case="invalid-only">
      <p class="feature-list-story__absence-label text-label-large">
        Absence check: no FeatureList DOM should render below.
      </p>
      <FeatureList {...args} />
    </div>
  {/snippet}
</Story>

<Story
  name="Non-array Runtime Guard (No DOM)"
  args={{
    items: nonArrayRuntimeItems,
  }}
  parameters={{
    docs: {
      description: {
        story:
          'Malformed non-array runtime input is guarded against and renders no DOM. This is not a supported TypeScript authoring shape.',
      },
    },
  }}
>
  {#snippet template(args)}
    <div class="feature-list-story__absence-check" data-case="non-array">
      <p class="feature-list-story__absence-label text-label-large">
        Absence check: no FeatureList DOM should render below.
      </p>
      <FeatureList {...args} />
    </div>
  {/snippet}
</Story>

<Story
  name="Empty (No DOM)"
  args={{
    items: [],
  }}
  parameters={{
    docs: {
      description: {
        story: 'An empty feature array renders no DOM.',
      },
    },
  }}
>
  {#snippet template(args)}
    <div class="feature-list-story__absence-check" data-case="empty">
      <p class="feature-list-story__absence-label text-label-large">
        Absence check: no FeatureList DOM should render below.
      </p>
      <FeatureList {...args} />
    </div>
  {/snippet}
</Story>

<Story
  name="Inside ContentSection"
  args={{
    items: tracerFeatures,
  }}
>
  {#snippet template(args)}
    <div class="feature-list-story">
      <div class="rail rail--md rail--padded feature-list-story__rail">
        <ContentSection heading="What You Might Like">
          <FeatureList {...args} />
        </ContentSection>
      </div>
    </div>
  {/snippet}
</Story>

<Story name="Passthrough Attributes">
  {#snippet template()}
    <div class="feature-list-story">
      <FeatureList
        items={tracerFeatures}
        class="feature-list-story__forwarded"
        aria-label="Tracer feature highlights"
        data-story-kind="forwarded"
      />
    </div>
  {/snippet}
</Story>
