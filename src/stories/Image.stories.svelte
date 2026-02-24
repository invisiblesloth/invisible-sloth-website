<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import Image from '../components/Image.svelte';

  const { Story } = defineMeta({
    title: 'Atoms/Image',
    component: Image,
    tags: ['autodocs'],
    parameters: {
      controls: {
        exclude: [
          'srcset',
          'sizes',
          'loading',
          'decoding',
          'fetchPriority',
          'fallbackSrc',
          'fallbackSrcset',
          'fallbackSizes',
          'fallbackAlt',
          'class',
        ],
      },
    },
    args: {
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
      minHeight: '220px',
      preferredHeight: '45svh',
      maxHeight: '560px',
      objectPosition: 'center',
      radius: 'small',
      loading: 'lazy',
      decoding: 'async',
      fetchPriority: 'auto',
      fallbackSrc: '/assets/image-fallback-default-1024.webp',
      fallbackSrcset:
        '/assets/image-fallback-default-640.webp 640w, /assets/image-fallback-default-1024.webp 1024w, /assets/image-fallback-default-1512.webp 1512w, /assets/image-fallback-default.webp 3000w',
      fallbackSizes:
        '(min-width: 1176px) 1512px, (min-width: 1015px) 1024px, (min-width: 632px) 744px, 100vw',
      fallbackAlt: 'Fallback image showing Sloth-Luc, the Invisible Sloth logo character.',
    },
    argTypes: {
      src: {
        control: 'text',
        description: 'Image source URL or site-relative asset path.',
      },
      srcset: {
        control: 'text',
        description: 'Optional responsive source set for the primary image.',
      },
      sizes: {
        control: 'text',
        description: 'Optional sizes string used with the primary srcset.',
      },
      alt: {
        control: 'text',
        description: 'Alternative text when image is not decorative.',
      },
      decorative: {
        control: 'boolean',
        description: 'When true, image renders with empty alt and aria-hidden on container.',
      },
      fit: {
        control: 'select',
        options: ['cover', 'contain'],
        description: 'Object fit behavior inside the frame.',
      },
      frame: {
        control: 'select',
        options: ['ratio', 'auto', 'clamped'],
        description: 'Frame sizing mode: fixed ratio, intrinsic height, or viewport-clamped.',
      },
      ratio: {
        control: 'select',
        options: ['3:2', '2:3', '1:1', '16:9'],
        description: 'Aspect ratio applied when frame is ratio or clamped.',
      },
      minHeight: {
        control: 'text',
        description: 'Lower bound of clamped height.',
      },
      preferredHeight: {
        control: 'text',
        description: 'Preferred viewport-driven height value.',
      },
      maxHeight: {
        control: 'text',
        description: 'Upper bound of clamped height.',
      },
      objectPosition: {
        control: 'text',
        description: 'Focal point for object positioning.',
      },
      radius: {
        control: 'select',
        options: ['none', 'small', 'medium', 'large'],
        description: 'Corner radius token mapping.',
      },
      loading: {
        control: 'select',
        options: ['lazy', 'eager'],
        description: 'Native loading strategy.',
      },
      decoding: {
        control: 'select',
        options: ['auto', 'sync', 'async'],
        description: 'Native image decoding hint.',
      },
      fetchPriority: {
        control: 'select',
        options: ['auto', 'high', 'low'],
        description: 'Native fetch priority hint.',
      },
      fallbackSrc: {
        control: 'text',
        description: 'Fallback source used when src is missing or fails.',
      },
      fallbackSrcset: {
        control: 'text',
        description: 'Optional responsive fallback source set.',
      },
      fallbackSizes: {
        control: 'text',
        description: 'Sizes string used with fallback srcset.',
      },
      fallbackAlt: {
        control: 'text',
        description: 'Alternative text for fallback imagery.',
      },
    },
  });
</script>

<Story name="Default Cover" />

<Story
  name="Contain In Ratio Frame"
  args={{
    fit: 'contain',
    ratio: '3:2',
  }}
/>

<Story
  name="Portrait Cover"
  args={{
    ratio: '2:3',
    fit: 'cover',
    objectPosition: '50% 35%',
  }}
/>

<Story
  name="Auto Height"
  args={{
    frame: 'auto',
    fit: 'contain',
  }}
/>

<Story
  name="Clamped Height"
  args={{
    frame: 'clamped',
    ratio: '16:9',
    minHeight: '220px',
    preferredHeight: '45svh',
    maxHeight: '560px',
  }}
/>

<Story
  name="Decorative"
  args={{
    decorative: true,
    alt: '',
  }}
/>

<Story
  name="Missing Source Uses Fallback"
  args={{
    src: '',
    alt: '',
  }}
/>

<Story
  name="Broken Source Uses Fallback"
  args={{
    src: '/assets/does-not-exist.webp',
    srcset: '',
    sizes: '',
    alt: 'Unavailable image',
  }}
/>
