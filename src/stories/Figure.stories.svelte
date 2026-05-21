<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import Figure from '../components/Figure.svelte';
  import type { FigureImageProps, FigureMediaTreatment } from '../components/Figure.svelte';

  const defaultCaptionText = 'Tokyo Tower rising above the skyline of central Tokyo, Japan.';
  const defaultCreditText = 'Photo by note thanun on Unsplash';
  const photographerUrl = 'https://unsplash.com/@notethanun';
  const defaultPhotoUrl =
    'https://unsplash.com/photos/a-view-of-the-eiffel-tower-in-paris-86_8M5BckfA';

  const defaultImageProps: FigureImageProps = {
    src: '/assets/note-thanun-86_8M5BckfA-unsplash.jpg',
    srcset:
      '/assets/note-thanun-86_8M5BckfA-unsplash-640.webp 640w, /assets/note-thanun-86_8M5BckfA-unsplash-1024.webp 1024w, /assets/note-thanun-86_8M5BckfA-unsplash-1512.webp 1512w, /assets/note-thanun-86_8M5BckfA-unsplash-3000.webp 3000w',
    sizes:
      '(min-width: 1176px) 1512px, (min-width: 1015px) 1024px, (min-width: 632px) 744px, 100vw',
    alt: 'Aerial view of Tokyo Tower painted in red and white, surrounded by modern skyscrapers in Tokyo, Japan under a clear blue sky.',
    decorative: false,
    radius: 'small',
    width: 4080,
    height: 3072,
  };

  const imagePropsWithUnsupportedClass = {
    ...defaultImageProps,
    class: 'figure-story__unsupported-image-class',
    // Deliberately escapes FigureImageProps to verify untyped callers cannot style
    // the internal Image through the removed imageProps.class contract.
  } as unknown as FigureImageProps;

  const designedImageProps: FigureImageProps = {
    src: '/social-card.png',
    alt: 'Invisible Sloth social card artwork.',
    decorative: false,
    width: 1200,
    height: 630,
  };

  const invalidMediaTreatment = 'poster-cover' as unknown as FigureMediaTreatment;

  const { Story } = defineMeta({
    title: 'Molecules/Figure',
    component: Figure,
    tags: ['autodocs'],
    parameters: {
      controls: {
        include: ['captionText', 'creditText', 'mediaTreatment'],
      },
      docs: {
        description: {
          component:
            'Semantic figure composition of Image + FigureCaption. The default treatment preserves the full image with auto-height contain behavior; use featured-art for non-cropped designed media and featured-cover only for intentional photo cropping. Featured media keeps the standard Image corner radius. A Figure requires a non-empty primary imageProps.src; Image owns broken-source fallback behavior. imageProps.class is unsupported; use the root class prop for styling hooks.',
        },
      },
    },
    args: {
      imageProps: defaultImageProps,
      captionText: defaultCaptionText,
      creditText: defaultCreditText,
      mediaTreatment: 'default',
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
        description:
          'Required media props with a non-empty primary src. Figure owns treatment sizing and imageProps.class is unsupported.',
        table: {
          disable: true,
        },
      },
      mediaTreatment: {
        control: 'select',
        options: ['default', 'wide-contain', 'featured-art', 'featured-cover'],
        description:
          'Named Figure media contract. default shows the full image, wide-contain fills the inline space without cropping, featured-art preserves designed/transparent media with standard rounded corners, and featured-cover intentionally crops photo covers.',
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

<Story
  name="Image Props Class Ignored"
  args={{
    imageProps: imagePropsWithUnsupportedClass,
  }}
  parameters={{
    docs: {
      description: {
        story:
          'Untyped callers may still pass imageProps.class, but Figure strips it before rendering Image.',
      },
    },
  }}
/>

<Story
  name="Missing Primary Source"
  args={{
    imageProps: {
      ...defaultImageProps,
      src: '   ',
      srcset: '',
      sizes: '',
      fallbackSrc: '/assets/image-fallback-default-1024.webp',
      fallbackSrcset:
        '/assets/image-fallback-default-640.webp 640w, /assets/image-fallback-default-1024.webp 1024w, /assets/image-fallback-default-1512.webp 1512w, /assets/image-fallback-default.webp 3000w',
      fallbackSizes:
        '(min-width: 1176px) 1512px, (min-width: 1015px) 1024px, (min-width: 632px) 744px, 100vw',
    },
  }}
  parameters={{
    docs: {
      description: {
        story:
          'A semantic Figure suppresses all DOM when the primary src is empty, even if fallback media is available. Direct Image owns missing-source fallback behavior.',
      },
    },
  }}
/>

<Story
  name="Wide Contain"
  args={{
    mediaTreatment: 'wide-contain',
  }}
/>

<Story
  name="Wide Contain Overrides Cover"
  args={{
    imageProps: {
      ...defaultImageProps,
      fit: 'cover',
      frame: 'ratio',
      containSizing: 'intrinsic',
    },
    mediaTreatment: 'wide-contain',
  }}
  parameters={{
    docs: {
      description: {
        story:
          'The wide-contain treatment forces contain sizing even when caller imageProps request cover.',
      },
    },
  }}
/>

<Story
  name="Default Preserves Full Image"
  args={{
    imageProps: {
      ...defaultImageProps,
      fit: 'cover',
      frame: 'ratio',
      ratio: '16:9',
    },
  }}
  parameters={{
    docs: {
      description: {
        story:
          'The default Figure treatment preserves the full image even when caller imageProps request a cropped ratio frame.',
      },
    },
  }}
/>

<Story
  name="Invalid Media Treatment Guard"
  args={{
    imageProps: {
      ...defaultImageProps,
      fit: 'cover',
      frame: 'ratio',
      ratio: '16:9',
    },
    mediaTreatment: invalidMediaTreatment,
  }}
  parameters={{
    docs: {
      description: {
        story:
          'Unexpected mediaTreatment values fall back to the default full-image treatment.',
      },
    },
  }}
/>

<Story
  name="Featured Art"
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
              'The featured-art treatment preserves art-directed or transparent media without cropping while keeping the standard Image corner radius.',
          },
    },
  }}
/>

<Story
  name="Featured Cover"
  args={{
    mediaTreatment: 'featured-cover',
  }}
/>

<style>
  :global(.figure-story__unsupported-image-class) {
    outline: 8px solid rgb(220 38 38);
  }
</style>
