<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import type { ComponentProps } from 'svelte';
  import PageHeader from '../components/PageHeader.svelte';

  type PageHeaderProps = ComponentProps<typeof PageHeader>;

  const defaultMedia: NonNullable<PageHeaderProps['media']> = {
    image: {
      src: '/assets/note-thanun-86_8M5BckfA-unsplash.jpg',
      srcset:
        '/assets/note-thanun-86_8M5BckfA-unsplash-640.webp 640w, /assets/note-thanun-86_8M5BckfA-unsplash-1024.webp 1024w, /assets/note-thanun-86_8M5BckfA-unsplash-1512.webp 1512w, /assets/note-thanun-86_8M5BckfA-unsplash-3000.webp 3000w',
      sizes:
        '(min-width: 1176px) 1128px, (min-width: 1015px) calc(100vw - 96px), (min-width: 632px) calc(100vw - 64px), calc(100vw - 32px)',
      alt: 'Aerial view of Tokyo Tower painted in red and white, surrounded by modern skyscrapers in Tokyo, Japan under a clear blue sky.',
      width: 4080,
      height: 3072,
    },
  };

  const defaultTags: NonNullable<PageHeaderProps['tags']> = [
    { label: 'Roxy', href: '/tags/roxy' },
    { label: 'Playdate', href: '/tags/playdate' },
    { label: 'Game', href: '/tags/game' },
  ];
  const malformedTags = [
    { label: 'Only Valid Tag', href: '/tags/valid', target: 123, rel: false },
    null,
    'Roxy',
    { label: 'Missing Href' },
    { href: '/tags/missing-label' },
  ] as unknown as PageHeaderProps['tags'];
  const nonArrayTags = 'Roxy' as unknown as PageHeaderProps['tags'];
  const malformedMedia = 'Tokyo Tower' as unknown as PageHeaderProps['media'];
  const missingImageMedia = { captionText: 'Missing image object.' } as unknown as PageHeaderProps['media'];

  const { Story } = defineMeta({
    title: 'Organisms/PageHeader',
    component: PageHeader,
    tags: ['autodocs'],
    parameters: {
      layout: 'fullscreen',
      controls: {
        include: ['title', 'excerpt', 'tags', 'media'],
      },
      docs: {
        description: {
          component:
            'Responsive page header composition with optional grouped media, clickable tag links, and DetailHeader content. PageHeader owns page-level section order and media semantics, while internal header pieces own rail layout, linked tag validation, and Figure composition. When media is present, PageHeader uses the wide non-cropping treatment and needs meaningful image alt text. Use the root class prop for styling hooks. The default tag hrefs are future-route placeholders for planned tag landing pages; they are not current site routes.',
        },
      },
    },
    args: {
      title: 'Roxy',
      excerpt: 'A Game Engine for Playdate',
      tags: defaultTags,
      media: defaultMedia,
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
      media: {
        control: 'object',
        description:
          'Optional grouped header media. Renders only when media.image.src is non-empty; layout fields such as class, decorative, frame, fit, ratio, radius, and containSizing are header-owned and ignored.',
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
  name="Title Only"
  args={{
    excerpt: '',
    tags: [],
    media: undefined,
  }}
/>

<Story
  name="Title And Excerpt"
  args={{
    tags: [],
    media: undefined,
  }}
/>

<Story
  name="With Tags"
  args={{
    excerpt: '',
    media: undefined,
  }}
/>

<Story
  name="With Image"
  args={{
    excerpt: '',
    tags: [],
  }}
/>

<Story
  name="With Caption And Credit"
  args={{
    media: {
      ...defaultMedia,
      captionText: 'Tokyo Tower rising above the skyline of central Tokyo, Japan.',
      creditText: 'Photo by note thanun on Unsplash',
    },
  }}
/>

<Story
  name="Empty Media Source"
  args={{
    title: 'Empty Media Source',
    excerpt: 'Empty draft media should render no media section.',
    media: {
      image: {
        src: '',
        alt: '',
      },
      captionText: 'This caption is ignored because no media renders.',
      creditText: 'This credit is ignored because no media renders.',
    },
  }}
  parameters={{
    docs: {
      description: {
        story:
          'Empty media sources are treated as absent media and do not render an empty rail or warn.',
      },
    },
  }}
/>

<Story
  name="Malformed Media Guard"
  args={{
    title: 'Malformed Media Guard',
    excerpt: 'Malformed media should render no media section.',
    media: malformedMedia,
  }}
  parameters={{
    docs: {
      description: {
        story:
          'Unexpected non-object media values warn in development and render no media section.',
      },
    },
  }}
/>

<Story
  name="Missing Media Image Guard"
  args={{
    title: 'Missing Media Image Guard',
    excerpt: 'Media without an image object should render no media section.',
    media: missingImageMedia,
  }}
  parameters={{
    docs: {
      description: {
        story:
          'Media objects need a nested image object; missing image data warns in development and renders no media section.',
      },
    },
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

<Story
  name="Non Array Tags Guard"
  args={{
    title: 'Non Array Tags Guard',
    excerpt: 'The tag group should be skipped when tags is not an array.',
    tags: nonArrayTags,
  }}
  parameters={{
    docs: {
      description: {
        story:
          'Unexpected non-array tags values are ignored so PageHeader does not render malformed tag data.',
      },
    },
  }}
/>

<Story
  name="Malformed Tag Entries Guard"
  args={{
    title: 'Malformed Tag Entries Guard',
    excerpt: 'Only the valid tag should render without malformed target or rel values.',
    tags: malformedTags,
  }}
  parameters={{
    docs: {
      description: {
        story:
          'Malformed array entries are skipped, and non-string target/rel values are omitted before Tag receives valid links.',
      },
    },
  }}
/>
