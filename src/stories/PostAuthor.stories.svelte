<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import PostAuthor from '../components/PostAuthor.svelte';

  const DEFAULT_IMAGE_SRC = '/assets/note-thanun-86_8M5BckfA-unsplash-640.webp';
  const TWO_AUTHORS = [
    { name: 'Jason', href: '/authors/jason' },
    { name: 'Karen', href: '/authors/karen' },
  ];
  const MULTIPLE_AUTHORS = [
    { name: 'Jason', href: '/authors/jason' },
    { name: 'Fred', href: '/authors/fred' },
    { name: 'Karen', href: '/authors/karen' },
  ];

  const { Story } = defineMeta({
    title: 'Molecules/PostAuthor',
    component: PostAuthor,
    tags: ['autodocs'],
    parameters: {
      layout: 'fullscreen',
      controls: {
        include: ['name', 'authors', 'imageSrc', 'imageAlt', 'href', 'target', 'rel'],
      },
      docs: {
        description: {
          component:
            'Content-only author byline block with an optional single-author circular avatar, optional linked author-name segments, and responsive label typography. A linked single-author avatar duplicates the name link for pointer users while staying out of the tab order and accessibility tree. Story wrappers provide page padding; parent compositions own vertical rhythm.',
        },
      },
    },
    args: {
      name: 'Author',
      authors: undefined,
      imageSrc: DEFAULT_IMAGE_SRC,
      imageAlt: '',
      href: undefined,
      target: undefined,
      rel: undefined,
    },
    argTypes: {
      name: {
        control: 'text',
        description: 'Required visible author name text when authors is empty.',
      },
      authors: {
        control: 'object',
        description:
          'Optional author list. Each item needs a non-empty name and renders as a separate linked or unlinked name; separators remain plain text.',
      },
      imageSrc: {
        control: 'text',
        description:
          'Optional single-author avatar image source. Whitespace-only values are treated as missing and multi-author bylines render text-only.',
      },
      imageAlt: {
        control: 'text',
        description:
          'Optional avatar alt text for unlinked single-author avatars. Ignored for linked duplicate avatars, which render decorative images.',
      },
      href: {
        control: 'text',
        description:
          'Optional single-author name link. Values are considered valid when non-empty after trimming.',
      },
      target: {
        control: 'text',
        description: 'Optional single-author link target. Applied only when href renders an anchor.',
      },
      rel: {
        control: 'text',
        description:
          'Optional single-author link rel. _blank targets are hardened; non-blank targets preserve caller rel.',
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

<style>
  .post-author-story {
    inline-size: 100%;
    padding-block: var(--space-section-block-sm);
  }

  .post-author-story__rail {
    inline-size: 100%;
  }
</style>

<Story
  name="Default"
  args={{
    name: 'Author',
    imageSrc: DEFAULT_IMAGE_SRC,
    imageAlt: '',
  }}
>
  {#snippet template(args)}
    <div class="post-author-story">
      <div class="rail rail--lg rail--padded post-author-story__rail">
        <PostAuthor {...args} />
      </div>
    </div>
  {/snippet}
</Story>

<Story
  name="Text Only"
  args={{
    name: 'Author',
    imageSrc: '   ',
    imageAlt: '',
  }}
>
  {#snippet template(args)}
    <div class="post-author-story">
      <div class="rail rail--lg rail--padded post-author-story__rail">
        <PostAuthor {...args} />
      </div>
    </div>
  {/snippet}
</Story>

<Story
  name="Linked"
  args={{
    name: 'Author',
    imageSrc: DEFAULT_IMAGE_SRC,
    imageAlt: '',
    href: '/authors/author',
    target: undefined,
    rel: undefined,
  }}
  parameters={{
    docs: {
      description: {
        story:
          'The avatar and visible author name share the same destination. The avatar is pointer-clickable but hidden from keyboard navigation and assistive tech, so the text link remains the only announced author link.',
      },
    },
  }}
>
  {#snippet template(args)}
    <div class="post-author-story">
      <div class="rail rail--lg rail--padded post-author-story__rail">
        <PostAuthor {...args} />
      </div>
    </div>
  {/snippet}
</Story>

<Story
  name="Linked Text Only"
  args={{
    name: 'Author',
    imageSrc: '   ',
    imageAlt: '',
    href: '/authors/author',
    target: undefined,
    rel: undefined,
  }}
>
  {#snippet template(args)}
    <div class="post-author-story">
      <div class="rail rail--lg rail--padded post-author-story__rail">
        <PostAuthor {...args} />
      </div>
    </div>
  {/snippet}
</Story>

<Story
  name="Linked Custom Target"
  args={{
    name: 'Author',
    imageSrc: DEFAULT_IMAGE_SRC,
    imageAlt: '',
    href: '/authors/author',
    target: 'profile',
    rel: 'author',
  }}
  parameters={{
    docs: {
      description: {
        story:
          'Non-blank custom targets preserve the caller-provided rel value, matching the shared link behavior used by Button and Tag.',
      },
    },
  }}
>
  {#snippet template(args)}
    <div class="post-author-story">
      <div class="rail rail--lg rail--padded post-author-story__rail">
        <PostAuthor {...args} />
      </div>
    </div>
  {/snippet}
</Story>

<Story
  name="Blank Href Guard"
  args={{
    name: 'Author',
    imageSrc: DEFAULT_IMAGE_SRC,
    imageAlt: '',
    href: '   ',
    target: '_blank',
    rel: 'author',
  }}
  parameters={{
    docs: {
      description: {
        story:
          'Blank href values render the author name as text and warn in development; target and rel are not forwarded without an anchor.',
      },
    },
  }}
>
  {#snippet template(args)}
    <div class="post-author-story">
      <div class="rail rail--lg rail--padded post-author-story__rail">
        <PostAuthor {...args} />
      </div>
    </div>
  {/snippet}
</Story>

<Story
  name="Two Linked Authors"
  args={{
    name: '',
    authors: TWO_AUTHORS,
    imageSrc: '   ',
    imageAlt: '',
  }}
  parameters={{
    docs: {
      description: {
        story:
          'Two author names render as separate links with the conjunction left as plain text. Multi-author bylines are text-only while PostAuthor has scalar avatar props.',
      },
    },
  }}
>
  {#snippet template(args)}
    <div class="post-author-story">
      <div class="rail rail--lg rail--padded post-author-story__rail">
        <PostAuthor {...args} />
      </div>
    </div>
  {/snippet}
</Story>

<Story
  name="Multiple Linked Authors"
  args={{
    name: '',
    authors: MULTIPLE_AUTHORS,
    imageSrc: '   ',
    imageAlt: '',
  }}
  parameters={{
    docs: {
      description: {
        story:
          'Three or more author names render as separate links with comma and conjunction separators left as plain text. Multi-author bylines are text-only while PostAuthor has scalar avatar props.',
      },
    },
  }}
>
  {#snippet template(args)}
    <div class="post-author-story">
      <div class="rail rail--lg rail--padded post-author-story__rail">
        <PostAuthor {...args} />
      </div>
    </div>
  {/snippet}
</Story>

<Story
  name="Long Name"
  args={{
    name: 'Professor Octavia Pennington-Smythe of the Invisible Sloth Research Cooperative',
    imageSrc: DEFAULT_IMAGE_SRC,
    imageAlt: '',
  }}
>
  {#snippet template(args)}
    <div class="post-author-story">
      <div class="rail rail--lg rail--padded post-author-story__rail">
        <PostAuthor {...args} />
      </div>
    </div>
  {/snippet}
</Story>
