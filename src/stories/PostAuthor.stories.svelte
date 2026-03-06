<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import PostAuthor from '../components/PostAuthor.svelte';

  const DEFAULT_IMAGE_SRC = '/assets/note-thanun-86_8M5BckfA-unsplash-640.webp';

  const { Story } = defineMeta({
    title: 'Molecules/PostAuthor',
    component: PostAuthor,
    tags: ['autodocs'],
    parameters: {
      layout: 'fullscreen',
      controls: {
        include: ['name', 'imageSrc', 'imageAlt'],
      },
      docs: {
        description: {
          component:
            'Content-only author byline block with an optional circular avatar and responsive label typography.',
        },
      },
    },
    args: {
      name: 'Author',
      imageSrc: DEFAULT_IMAGE_SRC,
      imageAlt: '',
    },
    argTypes: {
      name: {
        control: 'text',
        description: 'Required visible author name text.',
      },
      imageSrc: {
        control: 'text',
        description:
          'Optional avatar image source. Whitespace-only values are treated as missing and render the text-only layout.',
      },
      imageAlt: {
        control: 'text',
        description:
          'Optional avatar alt text. Leave empty for the default decorative treatment when the visible name is present.',
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
