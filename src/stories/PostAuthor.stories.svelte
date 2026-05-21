<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import type { ComponentProps } from 'svelte';
  import PostAuthor from '../components/PostAuthor.svelte';

  type PostAuthorProps = ComponentProps<typeof PostAuthor>;

  const DEFAULT_IMAGE_SRC = '/assets/note-thanun-86_8M5BckfA-unsplash-640.webp';
  const DEFAULT_AUTHOR: NonNullable<PostAuthorProps['authors']> = [
    { name: 'Author' },
  ];
  const LINKED_AUTHOR: NonNullable<PostAuthorProps['authors']> = [
    { name: 'Author', href: '/authors/author' },
  ];
  const BLANK_HREF_AUTHOR: NonNullable<PostAuthorProps['authors']> = [
    { name: 'Author', href: '   ', target: '_blank', rel: 'author' },
  ];
  const BLANK_TARGET_AUTHOR: NonNullable<PostAuthorProps['authors']> = [
    { name: 'Author', href: '/authors/author', target: '_blank', rel: 'author' },
  ];
  const CUSTOM_TARGET_AUTHOR: NonNullable<PostAuthorProps['authors']> = [
    { name: 'Author', href: '/authors/author', target: 'profile', rel: 'author' },
  ];
  const TWO_AUTHORS: NonNullable<PostAuthorProps['authors']> = [
    { name: 'Jason', href: '/authors/jason' },
    { name: 'Karen', href: '/authors/karen' },
  ];
  const MULTIPLE_AUTHORS: NonNullable<PostAuthorProps['authors']> = [
    { name: 'Jason', href: '/authors/jason' },
    { name: 'Fred', href: '/authors/fred' },
    { name: 'Karen', href: '/authors/karen' },
  ];
  const INVALID_AUTHORS: NonNullable<PostAuthorProps['authors']> = [
    { name: 'Only Valid Author', href: '/authors/valid' },
    { name: '   ', href: '/authors/blank-name' },
  ];
  const ALL_INVALID_AUTHORS: NonNullable<PostAuthorProps['authors']> = [
    { name: '   ', href: '/authors/blank-name' },
  ];
  const MALFORMED_AUTHORS = 'Author' as unknown as PostAuthorProps['authors'];

  const { Story } = defineMeta({
    title: 'Molecules/PostAuthor',
    component: PostAuthor,
    tags: ['autodocs'],
    parameters: {
      layout: 'fullscreen',
      controls: {
        include: ['authors', 'imageSrc', 'imageAlt'],
      },
      docs: {
        description: {
          component:
            'Content-only author byline block with an optional single-author circular avatar, linked author-name segments, and responsive label typography. Author identity and links are provided through authors only; avatar props are presentation-only. Omitted, malformed, empty, or all-invalid authors render no DOM; present malformed authors, blank names, and blank hrefs warn in development. Story wrappers provide page padding; parent compositions own vertical rhythm.',
        },
      },
    },
    args: {
      authors: DEFAULT_AUTHOR,
      imageSrc: DEFAULT_IMAGE_SRC,
      imageAlt: '',
    },
    argTypes: {
      authors: {
        control: 'object',
        description:
          'Optional author list. Each item needs a non-empty name; blank names are skipped, blank hrefs render as text, and _blank targets are rel-hardened.',
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
    min-block-size: var(--space-1600);
    padding-block: var(--space-section-block-sm);
  }

  .post-author-story__rail {
    inline-size: 100%;
  }
</style>

<Story name="Default">
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
    authors: DEFAULT_AUTHOR,
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
    authors: LINKED_AUTHOR,
    imageSrc: DEFAULT_IMAGE_SRC,
    imageAlt: '',
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
    authors: LINKED_AUTHOR,
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
  name="Blank Target Hardened"
  args={{
    authors: BLANK_TARGET_AUTHOR,
    imageSrc: DEFAULT_IMAGE_SRC,
    imageAlt: '',
  }}
  parameters={{
    docs: {
      description: {
        story:
          '_blank author links preserve caller rel tokens and add noopener/noreferrer through the shared link normalization helper.',
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
  name="Linked Custom Target"
  args={{
    authors: CUSTOM_TARGET_AUTHOR,
    imageSrc: DEFAULT_IMAGE_SRC,
    imageAlt: '',
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
    authors: BLANK_HREF_AUTHOR,
    imageSrc: DEFAULT_IMAGE_SRC,
    imageAlt: '',
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
    authors: TWO_AUTHORS,
    imageSrc: '   ',
    imageAlt: '',
  }}
  parameters={{
    docs: {
      description: {
        story:
          'Two author names render as separate links with the conjunction left as plain text. Multi-author bylines are text-only while avatar props remain single-author presentation data.',
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
    authors: MULTIPLE_AUTHORS,
    imageSrc: '   ',
    imageAlt: '',
  }}
  parameters={{
    docs: {
      description: {
        story:
          'Three or more author names render as separate links with comma and conjunction separators left as plain text. Multi-author bylines are text-only while avatar props remain single-author presentation data.',
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
  name="Invalid Author Guard"
  args={{
    authors: INVALID_AUTHORS,
    imageSrc: DEFAULT_IMAGE_SRC,
    imageAlt: '',
  }}
  parameters={{
    docs: {
      description: {
        story:
          'Blank author names are skipped and warn in development. The byline still renders when at least one valid author remains.',
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
  name="Malformed Authors No Output"
  args={{
    authors: MALFORMED_AUTHORS,
  }}
  parameters={{
    docs: {
      description: {
        story:
          'Present non-array authors values warn in development and render no DOM output.',
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
  name="All Invalid Authors No Output"
  args={{
    authors: ALL_INVALID_AUTHORS,
  }}
  parameters={{
    docs: {
      description: {
        story:
          'All-invalid author lists warn for skipped entries and render no DOM output instead of throwing.',
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
  name="Omitted Authors No Output"
  args={{
    authors: undefined,
  }}
  parameters={{
    docs: {
      description: {
        story:
          'Omitted authors are a legitimate no-output state and do not warn.',
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
    authors: [
      {
        name: 'Professor Octavia Pennington-Smythe of the Invisible Sloth Research Cooperative',
      },
    ],
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
