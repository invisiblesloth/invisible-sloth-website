<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import StandardCard from '../components/StandardCard.svelte';
  import type { StandardCardImage, StandardCardProps } from '../components/StandardCard.svelte';

  type StandardCardArgs = StandardCardProps;

  const imageSrc = '/assets/note-thanun-86_8M5BckfA-unsplash-1024.webp';
  const defaultImageAlt =
    'Aerial view of Tokyo Tower painted in red and white, surrounded by modern skyscrapers in Tokyo, Japan under a clear blue sky.';
  const headingLevelOptions = [1, 2, 3, 4, 5, 6] as const;
  // Exercises StandardCard's runtime guard for non-typed callers.
  const invalidRuntimeHeadingLevel = 0 as unknown as (typeof headingLevelOptions)[number];

  const defaultImage = {
    src: imageSrc,
    alt: defaultImageAlt,
    width: 1024,
    height: 683,
  } satisfies StandardCardImage;

  const defaultArgs = {
    href: '/notes/designing-a-better-project-archive',
    kicker: 'Field Notes',
    title: 'Designing a better project archive',
    description: 'A compact card pattern for future article and project-summary surfaces.',
    date: '3 May 2026',
    dateTime: '2026-05-03',
    author: 'Invisible Sloth',
    image: defaultImage,
  } satisfies StandardCardArgs;

  const noImageArgs = {
    ...defaultArgs,
    href: '/notes/text-first-card-patterns',
    kicker: 'No Image',
    title: 'A text-first card can still feel intentional',
    description:
      'When no valid image source is available, the card removes the media block instead of reserving a placeholder.',
    image: undefined,
  } satisfies StandardCardArgs;

  const minimalArgs = {
    href: '/notes/minimal-summary-card',
    title: 'Minimal summary card',
    kicker: '   ',
    description: '   ',
    date: '   ',
    dateTime: '   ',
    author: '   ',
    image: {
      src: '   ',
      alt: defaultImageAlt,
    },
  } satisfies StandardCardArgs;

  const longContentArgs = {
    ...defaultArgs,
    href: '/notes/component-stress-test',
    kicker: 'Component Stress Test',
    title: 'A much longer card title that wraps across multiple lines without breaking layout',
    description:
      'Longer supporting copy should keep the card readable while preserving the surface, footer, and image spacing across narrow and wide containers.',
    author: 'Invisible Sloth Editorial',
  } satisfies StandardCardArgs;

  const dateWithoutDateTimeArgs = {
    ...defaultArgs,
    href: '/notes/human-readable-date-only',
    title: 'Human-readable date without machine metadata',
    date: 'Early May 2026',
    dateTime: '',
  } satisfies StandardCardArgs;

  const externalTargetArgs = {
    ...defaultArgs,
    href: 'https://example.com/standard-card-contract',
    target: '_blank',
    title: 'External article summary target',
    linkLabel: 'Read the external StandardCard contract note',
    description:
      'External blank-target links are normalized through the shared link helpers and receive hardened rel output.',
  } satisfies StandardCardArgs;

  const { Story } = defineMeta({
    title: 'Organisms/StandardCard',
    component: StandardCard,
    tags: ['autodocs'],
    parameters: {
      controls: {
        include: [
          'href',
          'target',
          'rel',
          'linkLabel',
          'headingLevel',
          'kicker',
          'title',
          'description',
          'date',
          'dateTime',
          'author',
          'image',
        ],
      },
      docs: {
        description: {
          component:
            'Whole-card article/summary link. `href` and `title` are required and fail fast when blank; blanking required controls may break the story canvas. Parent layouts own outer width, StandardCard owns internal text treatment, shared link helpers normalize navigation, and Image owns media rendering after StandardCard confirms a non-empty image source. The root `class` hook lands on the root article for layout/global selectors only.',
        },
      },
    },
    args: defaultArgs,
    argTypes: {
      href: {
        control: 'text',
        description: 'Required non-empty card link URL normalized through shared link helpers.',
      },
      target: {
        control: 'text',
        description: 'Optional link target. `_blank` links receive hardened rel output.',
      },
      rel: {
        control: 'text',
        description: 'Optional link rel value; security tokens are appended for `_blank` links.',
      },
      linkLabel: {
        control: 'text',
        description:
          'Optional explicit accessible name. When omitted, the visible card contents name the link.',
      },
      headingLevel: {
        control: { type: 'select' },
        options: headingLevelOptions,
        description: 'Semantic title heading level. Typography remains card-scoped.',
      },
      kicker: {
        control: 'text',
        description: 'Optional small text above title.',
      },
      title: {
        control: 'text',
        description: 'Required non-empty card title/headline, trimmed at the boundary.',
      },
      description: {
        control: 'text',
        description: 'Optional card excerpt/description.',
      },
      date: {
        control: 'text',
        description:
          'Optional human-readable publication date. Renders as `<time>` when dateTime is provided.',
      },
      dateTime: {
        control: 'text',
        description: 'Optional machine-readable datetime attribute for date.',
      },
      author: {
        control: 'text',
        description: 'Optional author name rendered as plain text.',
      },
      image: {
        control: 'object',
        description:
          'Optional narrow image input. Layout treatment is card-owned; blank src removes the media block.',
      },
      class: {
        control: false,
        description:
          'Optional root article class hook for layout hooks, global utilities, and global selectors.',
      },
    },
  });
</script>

<style>
  .standard-card-story {
    box-sizing: border-box;
    inline-size: 100%;
    padding: var(--space-600);
  }

  .standard-card-story__frame {
    inline-size: min(100%, 430px);
  }

  :global(.standard-card-story__root-hook) {
    outline: 1px dashed var(--color-outline);
    outline-offset: var(--space-100);
  }
</style>

<Story
  name="Default"
  args={defaultArgs}
  parameters={{
    docs: {
      description: {
        story:
          'Default image-backed coverage using an existing public asset and the strict whole-card link contract.',
      },
    },
  }}
>
  {#snippet template(args)}
    <div class="standard-card-story">
      <div class="standard-card-story__frame">
        <StandardCard {...args} />
      </div>
    </div>
  {/snippet}
</Story>

<Story
  name="No Image"
  args={noImageArgs}
  parameters={{
    docs: {
      description: {
        story:
          'No-image coverage. The media block is removed entirely, with no reserved top placeholder.',
      },
    },
  }}
>
  {#snippet template(args)}
    <div class="standard-card-story">
      <div class="standard-card-story__frame">
        <StandardCard {...args} />
      </div>
    </div>
  {/snippet}
</Story>

<Story
  name="Minimal"
  args={minimalArgs}
  parameters={{
    docs: {
      description: {
        story:
          'Minimal valid card coverage. Blank optional metadata and blank image sources omit their nodes.',
      },
    },
  }}
>
  {#snippet template(args)}
    <div class="standard-card-story">
      <div class="standard-card-story__frame">
        <StandardCard {...args} />
      </div>
    </div>
  {/snippet}
</Story>

<Story
  name="Long Content"
  args={longContentArgs}
  parameters={{
    docs: {
      description: {
        story:
          'Stress coverage for longer title, description, date, and author content while keeping the representative image surface.',
      },
    },
  }}
>
  {#snippet template(args)}
    <div class="standard-card-story">
      <div class="standard-card-story__frame">
        <StandardCard {...args} />
      </div>
    </div>
  {/snippet}
</Story>

<Story
  name="Date Without DateTime"
  args={dateWithoutDateTimeArgs}
  parameters={{
    docs: {
      description: {
        story:
          'Human-readable date coverage without machine-readable metadata; the date remains plain text instead of an invalid time element.',
      },
    },
  }}
>
  {#snippet template(args)}
    <div class="standard-card-story">
      <div class="standard-card-story__frame">
        <StandardCard {...args} />
      </div>
    </div>
  {/snippet}
</Story>

<Story name="Semantic Heading Level" args={{ ...defaultArgs, headingLevel: 2 }}>
  {#snippet template(args)}
    <div class="standard-card-story">
      <div class="standard-card-story__frame">
        <StandardCard {...args} />
      </div>
    </div>
  {/snippet}
</Story>

<Story
  name="Invalid Heading Level Fallback"
  args={{ ...defaultArgs, headingLevel: invalidRuntimeHeadingLevel }}
>
  {#snippet template(args)}
    <div class="standard-card-story">
      <div class="standard-card-story__frame">
        <StandardCard {...args} />
      </div>
    </div>
  {/snippet}
</Story>

<Story
  name="External Target"
  args={externalTargetArgs}
  parameters={{
    docs: {
      description: {
        story:
          'External `_blank` coverage with `linkLabel`. The rendered anchor should include hardened rel output.',
      },
    },
  }}
>
  {#snippet template(args)}
    <div class="standard-card-story">
      <div class="standard-card-story__frame">
        <StandardCard {...args} />
      </div>
    </div>
  {/snippet}
</Story>

<Story
  name="Root Class Hook"
  args={defaultArgs}
  parameters={{
    docs: {
      description: {
        story:
          'Marker-only coverage: the class lands on the root article for layout/global selectors and is not a theming API.',
      },
    },
  }}
>
  {#snippet template(args)}
    <div class="standard-card-story">
      <div class="standard-card-story__frame">
        <StandardCard {...args} class="standard-card-story__root-hook" />
      </div>
    </div>
  {/snippet}
</Story>
