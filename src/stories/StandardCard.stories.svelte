<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import type { ComponentProps } from 'svelte';
  import StandardCard from '../components/StandardCard.svelte';

  type StandardCardArgs = ComponentProps<typeof StandardCard>;

  const imageSrc = '/assets/note-thanun-86_8M5BckfA-unsplash-1024.webp';
  const imageAlt =
    'Aerial view of Tokyo Tower painted in red and white, surrounded by modern skyscrapers.';

  const noRenderableSourceArgs = {
    kicker: 'Kicker',
    title: 'Card Title',
    description: 'Card excerpt.',
    date: 'Card Date',
    author: 'Author',
    image: '',
    imageAlt: '',
  } satisfies StandardCardArgs;

  const defaultArgs = {
    ...noRenderableSourceArgs,
    kicker: 'Field Notes',
    title: 'Designing a better project archive',
    description: 'A compact card pattern for future article and project-summary surfaces.',
    date: '3 May 2026',
    author: 'Invisible Sloth',
    image: imageSrc,
    imageAlt,
  } satisfies StandardCardArgs;

  const longContentArgs = {
    ...noRenderableSourceArgs,
    kicker: 'Component Stress Test',
    title: 'A much longer card title that wraps across multiple lines without breaking layout',
    description:
      'Longer supporting copy should keep the card readable while preserving the surface, footer, and image spacing across narrow and wide containers.',
    date: '3 May 2026',
    author: 'Invisible Sloth Editorial',
    image: imageSrc,
    imageAlt,
  } satisfies StandardCardArgs;

  const { Story } = defineMeta({
    title: 'Organisms/StandardCard',
    component: StandardCard,
    tags: ['autodocs'],
    parameters: {
      controls: {
        include: ['href', 'kicker', 'title', 'description', 'date', 'author', 'image', 'imageAlt'],
      },
      docs: {
        description: {
          component:
            'Provisional future-facing blog/article card. Phase 7 restores Storybook coverage without changing component behavior. Before live production use, review the `href` default, raw image path, placeholder behavior, and accessible-name behavior documented in the Phase 7 inventory. Use the Storybook viewport toolbar or browser resizing to inspect the card container-query typography.',
        },
      },
    },
    args: defaultArgs,
    argTypes: {
      href: {
        control: 'text',
        description: 'Card link URL. Current component default is "#".',
      },
      kicker: {
        control: 'text',
        description: 'Small text above title.',
      },
      title: {
        control: 'text',
        description: 'Card title/headline.',
      },
      description: {
        control: 'text',
        description: 'Card excerpt/description.',
      },
      date: {
        control: 'text',
        description: 'Publication date rendered as provided.',
      },
      author: {
        control: 'text',
        description: 'Author name rendered as provided.',
      },
      image: {
        control: 'text',
        description: 'Optional image URL rendered with the component raw img path.',
      },
      imageAlt: {
        control: 'text',
        description: 'Alt text for the optional image.',
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
</style>

<Story
  name="Default"
  args={defaultArgs}
  parameters={{
    docs: {
      description: {
        story:
          'Default image-backed coverage using an existing public asset; no new coverage-only asset is added.',
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
  name="No Renderable Source"
  args={noRenderableSourceArgs}
  parameters={{
    docs: {
      description: {
        story:
          'Placeholder coverage. This intentionally omits `image` to exercise the current no-renderable-source/default `href` behavior.',
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
