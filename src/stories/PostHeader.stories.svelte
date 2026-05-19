<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import type { ComponentProps } from 'svelte';
  import PostHeader from '../components/PostHeader.svelte';

  type PostHeaderProps = ComponentProps<typeof PostHeader>;

  const defaultImageProps: PostHeaderProps['imageProps'] = {
    src: '/assets/note-thanun-86_8M5BckfA-unsplash.jpg',
    srcset:
      '/assets/note-thanun-86_8M5BckfA-unsplash-640.webp 640w, /assets/note-thanun-86_8M5BckfA-unsplash-1024.webp 1024w, /assets/note-thanun-86_8M5BckfA-unsplash-1512.webp 1512w, /assets/note-thanun-86_8M5BckfA-unsplash-3000.webp 3000w',
    sizes:
      '(min-width: 1176px) 1128px, (min-width: 1015px) calc(100vw - 96px), (min-width: 632px) calc(100vw - 64px), calc(100vw - 32px)',
    alt: 'Aerial view of Tokyo Tower painted in red and white, surrounded by modern skyscrapers in Tokyo, Japan under a clear blue sky.',
    decorative: false,
    width: 4080,
    height: 3072,
  };

  const designedImageProps: PostHeaderProps['imageProps'] = {
    src: '/social-card.png',
    alt: 'Invisible Sloth social card artwork.',
    decorative: false,
    width: 1200,
    height: 630,
  };

  const defaultTags: NonNullable<PostHeaderProps['tags']> = [
    { label: 'Story', href: '/tags/story' },
  ];

  const multipleTags: NonNullable<PostHeaderProps['tags']> = [
    { label: 'Story', href: '/tags/story' },
    { label: 'Playdate', href: '/tags/playdate' },
    { label: 'Roxy', href: '/tags/roxy' },
    { label: 'Game Dev', href: '/tags/game-dev' },
  ];
  const nonArrayTags = 'Story' as unknown as PostHeaderProps['tags'];
  const invalidMediaTreatment = 'wide-contain' as unknown as PostHeaderProps['mediaTreatment'];

  const defaultAuthorImageSrc = '/assets/image-fallback-default-640.webp';

  const { Story } = defineMeta({
    title: 'Organisms/PostHeader',
    component: PostHeader,
    tags: ['autodocs'],
    parameters: {
      layout: 'fullscreen',
      controls: {
        include: [
          'title',
          'excerpt',
          'date',
          'dateTime',
          'authorName',
          'authorImageSrc',
          'authorImageAlt',
          'tags',
          'captionText',
          'creditText',
          'mediaTreatment',
        ],
      },
      docs: {
        canvas: {
          // Allow the Docs page to scroll past this tall preview.
          className: 'docs-preview--page-scroll',
        },
        description: {
          component:
            'Responsive blog post header composition for Storybook only. Featured media defaults to the Figure featured-art treatment so designed or transparent assets are preserved; use featured-cover for intentionally cropped photo covers. imageProps.class is unsupported; use the root class prop for styling hooks. It is not wired to site routes, and future publishing requirements belong in blog content schema work.',
        },
      },
    },
    args: {
      title: 'The Logo Ghost Sloth is Named Sloth-Luc',
      excerpt:
        'Learning to code was no easy feat for Sloth-Luc. The lines of code seemed to blur together, and sometimes he felt like giving up.',
      date: '20 December 2025',
      dateTime: '2025-12-20',
      authorName: 'Jason Kisner',
      authorImageSrc: defaultAuthorImageSrc,
      authorImageAlt: '',
      tags: defaultTags,
      imageProps: defaultImageProps,
      captionText: '',
      creditText: '',
      mediaTreatment: 'featured-art',
    },
    argTypes: {
      title: {
        control: 'text',
        description: 'Required visible post title text.',
      },
      excerpt: {
        control: 'text',
        description: 'Optional supporting excerpt text.',
      },
      date: {
        control: 'text',
        description: 'Optional visible publication date text.',
      },
      dateTime: {
        control: 'text',
        description:
          'Optional machine-readable datetime. It has no visual effect and is ignored unless date is also set.',
      },
      authorName: {
        control: 'text',
        description: 'Optional visible author name. The author block is skipped when blank.',
      },
      authorImageSrc: {
        control: 'text',
        description:
          'Optional author image source. Ignored when authorName is blank or imageSrc is blank.',
      },
      authorImageAlt: {
        control: 'text',
        description:
          'Optional author image alt text. Leave empty when the visible author name is sufficient.',
      },
      tags: {
        control: 'object',
        description:
          'Optional clickable tag links. Non-array values render no tags; blank labels or hrefs are skipped.',
      },
      captionText: {
        control: 'text',
        description:
          'Plain-text caption fallback for featured media. Ignored when no featured media renders.',
      },
      creditText: {
        control: 'text',
        description:
          'Plain-text credit fallback for featured media. Ignored when no featured media renders.',
      },
      imageProps: {
        control: false,
        description:
          'Optional Figure media props. Renders only when primary src is non-empty. imageProps.class is unsupported.',
        table: {
          disable: true,
        },
      },
      mediaTreatment: {
        control: 'select',
        options: ['featured-art', 'featured-cover'],
        description:
          'Featured media treatment. featured-art preserves designed or transparent media; featured-cover crops photos into a fixed 3:2 frame.',
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
  name="Photo Cover"
  args={{
    mediaTreatment: 'featured-cover',
  }}
  parameters={{
    docs: {
      description: {
        story:
          'Photo covers opt into the cropped featured-cover treatment for a consistent 3:2 post-header frame.',
      },
    },
  }}
/>

<Story
  name="Designed Featured Media"
  args={{
    imageProps: designedImageProps,
    mediaTreatment: 'featured-art',
    captionText: 'Designed media preserved without a crop frame.',
    creditText: '',
  }}
  parameters={{
    docs: {
      description: {
        story:
          'Designed or transparent featured media uses featured-art so the source asset owns its own composition and edge.',
      },
    },
  }}
/>

<Story
  name="Invalid Media Treatment Guard"
  args={{
    mediaTreatment: invalidMediaTreatment,
    captionText: 'Invalid media treatment falls back to the non-cropping art treatment.',
    creditText: '',
  }}
  parameters={{
    docs: {
      description: {
        story:
          'Unexpected mediaTreatment values are ignored so PostHeader only exposes featured-art and featured-cover semantics at runtime.',
      },
    },
  }}
/>

<Story
  name="No Featured Image"
  args={{
    imageProps: undefined,
  }}
/>

<Story
  name="Title Only"
  args={{
    excerpt: '',
    date: '',
    dateTime: '2025-12-20',
    authorName: '',
    authorImageSrc: defaultAuthorImageSrc,
    tags: [],
    imageProps: undefined,
    captionText: 'This caption is ignored because no featured media renders.',
    creditText: 'This credit is ignored because no featured media renders.',
  }}
  parameters={{
    docs: {
      description: {
        story:
          'Only title is required. dateTime, author image, captions, and credits are ignored when their visible parent sections are absent.',
      },
    },
  }}
/>

<Story
  name="With Caption And Credit"
  args={{
    captionText: 'Tokyo Tower rising above the skyline of central Tokyo, Japan.',
    creditText: 'Photo by note thanun on Unsplash',
  }}
/>

<Story
  name="Multiple Tags"
  args={{
    tags: multipleTags,
  }}
/>

<Story
  name="Text Only Author"
  args={{
    authorImageSrc: '   ',
    authorImageAlt: '',
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
          'Blank tag hrefs and labels are intentionally skipped so PostHeader never passes invalid tags to Tag.',
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
          'Unexpected non-array tags values are ignored so PostHeader does not render malformed tag data.',
      },
    },
  }}
/>
