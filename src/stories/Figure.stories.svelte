<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import type { ComponentProps } from 'svelte';
  import Figure from '../components/Figure.svelte';

  const defaultCaptionText = 'Tokyo Tower rising above the skyline of central Tokyo, Japan.';
  const defaultCreditText = 'Photo by note thanun on Unsplash';
  const photographerUrl = 'https://unsplash.com/@notethanun';
  const defaultPhotoUrl =
    'https://unsplash.com/photos/a-view-of-the-eiffel-tower-in-paris-86_8M5BckfA';

  const defaultImageProps: NonNullable<ComponentProps<typeof Figure>['imageProps']> = {
    src: '/assets/note-thanun-86_8M5BckfA-unsplash.jpg',
    srcset:
      '/assets/note-thanun-86_8M5BckfA-unsplash-640.webp 640w, /assets/note-thanun-86_8M5BckfA-unsplash-1024.webp 1024w, /assets/note-thanun-86_8M5BckfA-unsplash-1512.webp 1512w, /assets/note-thanun-86_8M5BckfA-unsplash-3000.webp 3000w',
    sizes:
      '(min-width: 1176px) 1512px, (min-width: 1015px) 1024px, (min-width: 632px) 744px, 100vw',
    alt: 'Aerial view of Tokyo Tower painted in red and white, surrounded by modern skyscrapers in Tokyo, Japan under a clear blue sky.',
    decorative: false,
    fit: 'cover',
    frame: 'ratio',
    ratio: '3:2',
    radius: 'small',
  };

  const { Story } = defineMeta({
    title: 'Molecules/Figure',
    component: Figure,
    tags: ['autodocs'],
    parameters: {
      controls: {
        include: ['captionText', 'creditText'],
      },
      docs: {
        description: {
          component:
            'Semantic figure composition of Image + FigureCaption. Accessibility: when imageProps.decorative is not true, provide meaningful imageProps.alt.',
        },
      },
    },
    args: {
      imageProps: defaultImageProps,
      captionText: defaultCaptionText,
      creditText: defaultCreditText,
    },
    argTypes: {
      captionText: {
        control: 'text',
        description: 'Plain-text caption fallback when no caption snippet is supplied.',
      },
      creditText: {
        control: 'text',
        description: 'Plain-text credit fallback when no credit snippet is supplied.',
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

<Story
  name="Default"
  asChild
  parameters={{ controls: { disable: true } }}
>
  {#snippet children()}
    {#snippet credit()}
      <span>Photo by </span>
      <a class="text-link" href={photographerUrl}>note thanun</a>
      <span> on </span>
      <a class="text-link" href={defaultPhotoUrl}>Unsplash</a>
    {/snippet}
    <Figure imageProps={defaultImageProps} captionText={defaultCaptionText} {credit} />
  {/snippet}
</Story>

<Story
  name="Caption Only"
  args={{
    captionText: defaultCaptionText,
    creditText: '',
  }}
/>

<Story
  name="Credit Only"
  args={{
    captionText: '',
    creditText: defaultCreditText,
  }}
/>

<Story
  name="No Caption"
  args={{
    captionText: '',
    creditText: '',
  }}
/>

<Story
  name="Fallback Image"
  args={{
    imageProps: {
      ...defaultImageProps,
      src: '/assets/does-not-exist.webp',
      srcset: '',
      sizes: '',
      alt: 'Unavailable image fallback',
    },
  }}
/>
