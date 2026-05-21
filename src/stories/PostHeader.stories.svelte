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
  const defaultAuthors: NonNullable<PostHeaderProps['authors']> = [
    { name: 'Jason Kisner' },
  ];
  const linkedAuthors: NonNullable<PostHeaderProps['authors']> = [
    { name: 'Jason Kisner', href: '/authors/jason-kisner' },
  ];
  const blankTargetAuthors: NonNullable<PostHeaderProps['authors']> = [
    { name: 'Jason Kisner', href: '/authors/jason-kisner', target: '_blank', rel: 'author' },
  ];
  const blankHrefAuthors: NonNullable<PostHeaderProps['authors']> = [
    { name: 'Jason Kisner', href: '   ', target: '_blank', rel: 'author' },
  ];
  const multipleAuthors: NonNullable<PostHeaderProps['authors']> = [
    { name: 'Jason', href: '/authors/jason-kisner' },
    { name: 'Fred', href: '/authors/fred' },
    { name: 'Karen', href: '/authors/karen' },
  ];
  const invalidAuthors: NonNullable<PostHeaderProps['authors']> = [
    { name: 'Only Valid Author', href: '/authors/valid' },
    { name: '   ', href: '/authors/blank-name' },
  ];
  const allInvalidAuthors: NonNullable<PostHeaderProps['authors']> = [
    { name: '   ', href: '/authors/blank-name' },
  ];
  const malformedAuthors = 'Jason Kisner' as unknown as PostHeaderProps['authors'];
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
          'authorImageSrc',
          'authorImageAlt',
          'authors',
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
            'Responsive blog post header composition for Storybook only. Author identity and links are provided through authors only, while avatar props are single-author presentation data. Featured media defaults to the Figure featured-art treatment so designed or transparent assets are preserved without cropping while keeping standard Image rounded corners; use featured-cover for intentionally cropped photo covers. imageProps.class is unsupported; use the root class prop for styling hooks. It is not wired to site routes, and future publishing requirements belong in blog content schema work.',
        },
      },
    },
    args: {
      title: 'The Logo Ghost Sloth is Named Sloth-Luc',
      excerpt:
        'Learning to code was no easy feat for Sloth-Luc. The lines of code seemed to blur together, and sometimes he felt like giving up.',
      date: '20 December 2025',
      dateTime: '2025-12-20',
      authorImageSrc: defaultAuthorImageSrc,
      authorImageAlt: '',
      authors: defaultAuthors,
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
      authorImageSrc: {
        control: 'text',
        description:
          'Optional single-author image source. Ignored when no author section renders, multiple valid authors render, or imageSrc is blank.',
      },
      authorImageAlt: {
        control: 'text',
        description:
          'Optional author image alt text for unlinked single-author avatars. Ignored for linked duplicate avatars, which render decorative images.',
      },
      authors: {
        control: 'object',
        description:
          'Optional author list. Each item needs a non-empty name; blank names are skipped, blank hrefs render as text, and _blank targets are rel-hardened.',
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
          'Designed or transparent featured media uses featured-art so the source asset owns its own composition without cropping while keeping the standard Image corner radius.',
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
    authorImageSrc: defaultAuthorImageSrc,
    authors: undefined,
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
    authors: defaultAuthors,
    authorImageSrc: '   ',
    authorImageAlt: '',
  }}
/>

<Story
  name="Linked Author"
  args={{
    authors: linkedAuthors,
  }}
  parameters={{
    docs: {
      description: {
        story:
          'The author name text links when the author href resolves to non-empty text after trimming. The avatar duplicates the same destination for pointer users while staying out of the tab order and accessibility tree.',
      },
    },
  }}
/>

<Story
  name="Blank Target Hardened Author"
  args={{
    authors: blankTargetAuthors,
  }}
  parameters={{
    docs: {
      description: {
        story:
          '_blank author links preserve caller rel tokens and add noopener/noreferrer through the shared link normalization helper.',
      },
    },
  }}
/>

<Story
  name="Multiple Linked Authors"
  args={{
    authors: multipleAuthors,
    authorImageSrc: defaultAuthorImageSrc,
  }}
  parameters={{
    docs: {
      description: {
        story:
          'Multiple authors render as separate author-name links with comma and conjunction separators left as plain text. The scalar author image is ignored for multi-author bylines.',
      },
    },
  }}
/>

<Story
  name="Invalid Author Guard"
  args={{
    title: 'Invalid Author Guard',
    excerpt: 'Only the valid author should render.',
    authors: invalidAuthors,
  }}
  parameters={{
    docs: {
      description: {
        story:
          'Blank author names are skipped so PostHeader never passes invalid authors to PostAuthor. The byline still renders when at least one valid author remains.',
      },
    },
  }}
/>

<Story
  name="Blank Author Href Guard"
  args={{
    title: 'Blank Author Href Guard',
    excerpt: 'The author should render as text instead of a link.',
    authors: blankHrefAuthors,
  }}
  parameters={{
    docs: {
      description: {
        story:
          'Blank author href values warn in development and render the author name as text.',
      },
    },
  }}
/>

<Story
  name="Malformed Authors Guard"
  args={{
    title: 'Malformed Authors Guard',
    excerpt: 'The author section should be skipped when authors is present but not an array.',
    authors: malformedAuthors,
  }}
  parameters={{
    docs: {
      description: {
        story:
          'Present non-array authors values warn in development and render no author section.',
      },
    },
  }}
/>

<Story
  name="All Invalid Authors"
  args={{
    title: 'All Invalid Authors',
    excerpt: 'The author section should be skipped when every author is invalid.',
    authors: allInvalidAuthors,
  }}
  parameters={{
    docs: {
      description: {
        story:
          'All-invalid author lists warn for skipped entries and render no author section instead of throwing.',
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
