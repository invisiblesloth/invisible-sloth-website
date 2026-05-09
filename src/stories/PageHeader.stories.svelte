<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import type { ComponentProps } from 'svelte';
  import PageHeader from '../components/PageHeader.svelte';

  type PageHeaderProps = ComponentProps<typeof PageHeader>;

  const defaultImageProps: PageHeaderProps['imageProps'] = {
    src: '/assets/note-thanun-86_8M5BckfA-unsplash.jpg',
    srcset:
      '/assets/note-thanun-86_8M5BckfA-unsplash-640.webp 640w, /assets/note-thanun-86_8M5BckfA-unsplash-1024.webp 1024w, /assets/note-thanun-86_8M5BckfA-unsplash-1512.webp 1512w, /assets/note-thanun-86_8M5BckfA-unsplash-3000.webp 3000w',
    sizes:
      '(min-width: 1176px) 1128px, (min-width: 1015px) calc(100vw - 96px), (min-width: 632px) calc(100vw - 64px), calc(100vw - 32px)',
    alt: 'Aerial view of Tokyo Tower painted in red and white, surrounded by modern skyscrapers in Tokyo, Japan under a clear blue sky.',
    decorative: false,
    radius: 'small',
    width: 4080,
    height: 3072,
  };

  const defaultTags: NonNullable<PageHeaderProps['tags']> = [
    { label: 'Roxy', href: '/tags/roxy' },
    { label: 'Playdate', href: '/tags/playdate' },
    { label: 'Game', href: '/tags/game' },
  ];

  const { Story } = defineMeta({
    title: 'Organisms/PageHeader',
    component: PageHeader,
    tags: ['autodocs'],
    parameters: {
      layout: 'fullscreen',
      controls: {
        include: ['title', 'excerpt', 'tags', 'captionText', 'creditText'],
      },
      docs: {
        description: {
          component:
            'Responsive page header composition with wide media, clickable tag links, and DetailHeader content. The default tag hrefs are future-route placeholders for planned tag landing pages; they are not current site routes.',
        },
      },
    },
    args: {
      title: 'Roxy',
      excerpt: 'A Game Engine for Playdate',
      tags: defaultTags,
      imageProps: defaultImageProps,
      captionText: '',
      creditText: '',
    },
    argTypes: {
      title: {
        control: 'text',
        description: 'Required visible page title text.',
      },
      excerpt: {
        control: 'text',
        description: 'Optional supporting excerpt text.',
      },
      tags: {
        control: 'object',
        description:
          'Clickable tag links. Blank hrefs are skipped so tags do not render as inert buttons.',
      },
      captionText: {
        control: 'text',
        description: 'Plain-text caption fallback for the header media.',
      },
      creditText: {
        control: 'text',
        description: 'Plain-text credit fallback for the header media.',
      },
      imageProps: {
        control: false,
        table: {
          disable: true,
        },
      },
      caption: {
        control: false,
        table: {
          disable: true,
        },
      },
      credit: {
        control: false,
        table: {
          disable: true,
        },
      },
      class: {
        control: false,
        table: {
          disable: true,
        },
      },
    },
  });
</script>

<Story name="Default" />

<Story
  name="With Caption And Credit"
  args={{
    captionText: 'Tokyo Tower rising above the skyline of central Tokyo, Japan.',
    creditText: 'Photo by note thanun on Unsplash',
  }}
/>

<Story
  name="Invalid Tag Guard"
  args={{
    title: 'Invalid Tag Guard',
    excerpt: 'Only the valid tag should render.',
    tags: [
      { label: 'Only Valid Tag', href: '/tags/valid' },
      { label: 'Blank Future Route', href: '   ' },
      { label: '   ', href: '/tags/blank-label' },
    ],
  }}
  parameters={{
    docs: {
      description: {
        story:
          'Blank tag hrefs are intentionally skipped so PageHeader never passes label-only tags to Tag as button fallbacks.',
      },
    },
  }}
/>
