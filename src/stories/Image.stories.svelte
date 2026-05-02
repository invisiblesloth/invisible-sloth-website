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
      width: 4080,
      height: 3072,
      fallbackSrc: '/assets/image-fallback-default-1024.webp',
      fallbackSrcset:
        '/assets/image-fallback-default-640.webp 640w, /assets/image-fallback-default-1024.webp 1024w, /assets/image-fallback-default-1512.webp 1512w, /assets/image-fallback-default.webp 3000w',
      fallbackSizes:
        '(min-width: 1176px) 1512px, (min-width: 1015px) 1024px, (min-width: 632px) 744px, 100vw',
      fallbackAlt: 'Fallback image showing Sloth-Luc, the Invisible Sloth logo character.',
      fallbackWidth: 1024,
      fallbackHeight: 683,
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
        description:
          'Native loading strategy. Use eager for first-viewport or likely LCP images.',
      },
      decoding: {
        control: 'select',
        options: ['auto', 'sync', 'async'],
        description: 'Native image decoding hint.',
      },
      fetchPriority: {
        control: 'select',
        options: ['auto', 'high', 'low'],
        description:
          'Native fetch priority hint. Reserve high for the most important first-viewport image.',
      },
      width: {
        control: 'number',
        description: 'Optional native image width attribute in positive integer pixels.',
      },
      height: {
        control: 'number',
        description: 'Optional native image height attribute in positive integer pixels.',
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
      fallbackWidth: {
        control: 'number',
        description: 'Native fallback width attribute in positive integer pixels.',
      },
      fallbackHeight: {
        control: 'number',
        description: 'Native fallback height attribute in positive integer pixels.',
      },
    },
  });
</script>

<script>
  import { onMount } from 'svelte';

  const primaryImage = {
    src: '/assets/note-thanun-86_8M5BckfA-unsplash.jpg',
    srcset:
      '/assets/note-thanun-86_8M5BckfA-unsplash-640.webp 640w, /assets/note-thanun-86_8M5BckfA-unsplash-1024.webp 1024w, /assets/note-thanun-86_8M5BckfA-unsplash-1512.webp 1512w, /assets/note-thanun-86_8M5BckfA-unsplash-3000.webp 3000w',
    sizes:
      '(min-width: 1176px) 1512px, (min-width: 1015px) 1024px, (min-width: 632px) 744px, 100vw',
    alt: 'Aerial view of Tokyo Tower painted in red and white, surrounded by modern skyscrapers in Tokyo, Japan under a clear blue sky.',
    width: 4080,
    height: 3072,
  };

  const alternatePrimaryImage = {
    src: '/assets/note-thanun-86_8M5BckfA-unsplash-640.webp',
    srcset:
      '/assets/note-thanun-86_8M5BckfA-unsplash-640.webp 640w, /assets/note-thanun-86_8M5BckfA-unsplash-1024.webp 1024w',
    sizes: '(min-width: 744px) 50vw, 100vw',
    alt: 'Alternate responsive source for the Tokyo Tower image.',
    width: 640,
    height: 482,
  };

  const fallbackImage = {
    fallbackSrc: '/assets/image-fallback-default-1024.webp',
    fallbackSrcset:
      '/assets/image-fallback-default-640.webp 640w, /assets/image-fallback-default-1024.webp 1024w, /assets/image-fallback-default-1512.webp 1512w, /assets/image-fallback-default.webp 3000w',
    fallbackSizes:
      '(min-width: 1176px) 1512px, (min-width: 1015px) 1024px, (min-width: 632px) 744px, 100vw',
    fallbackAlt: 'Fallback image showing Sloth-Luc, the Invisible Sloth logo character.',
    fallbackWidth: 1024,
    fallbackHeight: 683,
  };

  const brokenPrimary = {
    src: '/assets/debug-primary-does-not-exist.webp',
    srcset: '',
    sizes: '',
    alt: 'Primary image that is intentionally unavailable.',
    width: 1200,
    height: 800,
  };

  const brokenFallback = {
    fallbackSrc: '/assets/debug-fallback-does-not-exist.webp',
    fallbackSrcset: '',
    fallbackSizes: '',
    fallbackAlt: 'Fallback image that is intentionally unavailable.',
    fallbackWidth: 1024,
    fallbackHeight: 683,
  };

  let debugRoot = $state();
  let debugScenario = $state('Loaded primary');
  let debugImageProps = $state({
    ...primaryImage,
    ...fallbackImage,
    decorative: false,
    fit: 'cover',
    frame: 'ratio',
    ratio: '3:2',
    minHeight: '220px',
    preferredHeight: '45svh',
    maxHeight: '560px',
    objectPosition: 'center',
    radius: 'small',
    loading: 'eager',
    decoding: 'async',
    fetchPriority: 'auto',
  });
  let debugDiagnostics = $state([]);

  const readDebugDiagnostics = () => {
    const image = debugRoot?.querySelector('img.image__media');

    if (!image) {
      debugDiagnostics = [{ label: 'Rendered image', value: 'none' }];
      return;
    }

    debugDiagnostics = [
      { label: 'Private enhancer state', value: image.dataset.enhancerState ?? 'uninitialized' },
      {
        label: 'Private enhancer candidate',
        value: image.dataset.enhancerCandidate ?? 'uninitialized',
      },
      {
        label: 'Private enhancer fallback mode',
        value: image.dataset.enhancerFallbackMode ?? 'uninitialized',
      },
      { label: 'DOM load state', value: image.dataset.loadState ?? 'missing' },
      { label: 'Loaded resource token', value: image.dataset.loadedResourceToken ?? 'none' },
      { label: 'Declarative mode', value: image.dataset.imageMode ?? 'missing' },
      { label: 'src', value: image.getAttribute('src') ?? '' },
      { label: 'currentSrc', value: image.currentSrc || 'unresolved' },
      { label: 'srcset', value: image.getAttribute('srcset') ?? '' },
      { label: 'sizes', value: image.getAttribute('sizes') ?? '' },
      { label: 'width', value: image.getAttribute('width') ?? '' },
      { label: 'height', value: image.getAttribute('height') ?? '' },
      { label: 'alt', value: image.getAttribute('alt') ?? '' },
    ];
  };

  const setDebugScenario = (scenario, props) => {
    debugScenario = scenario;
    debugImageProps = {
      ...debugImageProps,
      ...props,
    };

    queueMicrotask(readDebugDiagnostics);
  };

  onMount(() => {
    readDebugDiagnostics();

    const interval = window.setInterval(readDebugDiagnostics, 200);
    return () => window.clearInterval(interval);
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
  name="No Renderable Source"
  args={{
    src: '',
    alt: '',
    fallbackSrc: '',
    fallbackSrcset: '',
    fallbackSizes: '',
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

<Story
  name="Broken Source And Fallback"
  args={{
    src: '/assets/does-not-exist.webp',
    srcset: '',
    sizes: '',
    alt: 'Unavailable image with unavailable fallback',
    fallbackSrc: '/assets/fallback-does-not-exist.webp',
    fallbackSrcset: '',
    fallbackSizes: '',
  }}
/>

<Story
  name="Dynamic Loading Debug"
  asChild
  parameters={{
    controls: {
      disable: true,
    },
  }}
>
  {#snippet children()}
    <section class="image-debug-story" bind:this={debugRoot}>
      <div class="image-debug-story__preview">
        <Image {...debugImageProps} />
      </div>

      <div class="image-debug-story__panel">
        <p class="image-debug-story__scenario">Scenario: {debugScenario}</p>

        <div class="image-debug-story__controls" aria-label="Image loading debug scenarios">
          <button
            type="button"
            onclick={() => setDebugScenario('Loaded primary', { ...primaryImage, ...fallbackImage })}
          >
            Loaded primary
          </button>
          <button
            type="button"
            onclick={() =>
              setDebugScenario('Loaded primary -> changed src/srcset/sizes', {
                ...alternatePrimaryImage,
              })}
          >
            Change primary resource
          </button>
          <button
            type="button"
            onclick={() =>
              setDebugScenario('Broken primary -> fallback success', {
                ...brokenPrimary,
                ...fallbackImage,
              })}
          >
            Broken primary
          </button>
          <button
            type="button"
            onclick={() =>
              setDebugScenario('Broken primary -> broken fallback -> failed', {
                ...brokenPrimary,
                ...brokenFallback,
              })}
          >
            Broken fallback
          </button>
          <button
            type="button"
            onclick={() =>
              setDebugScenario('Failed fallback -> valid fallback retry', {
                ...fallbackImage,
              })}
          >
            Repair fallback
          </button>
          <button
            type="button"
            onclick={() =>
              setDebugScenario('Active fallback -> src becomes empty', {
                src: '',
                srcset: '',
                sizes: '',
                alt: '',
                width: undefined,
                height: undefined,
                ...fallbackImage,
              })}
          >
            Empty primary
          </button>
          <button
            type="button"
            onclick={() =>
              setDebugScenario('Active fallback -> primary bundle changes', {
                ...alternatePrimaryImage,
              })}
          >
            New primary bundle
          </button>
          <button
            type="button"
            onclick={() =>
              setDebugScenario('Active fallback -> primary wins same update', {
                ...primaryImage,
                fallbackSrc: '/assets/debug-next-fallback-does-not-exist.webp',
                fallbackSrcset: '',
                fallbackSizes: '',
                fallbackAlt: 'Changed fallback config that should not override a new primary.',
                fallbackWidth: 1024,
                fallbackHeight: 683,
              })}
          >
            Primary and fallback update
          </button>
          <button
            type="button"
            onclick={() =>
              setDebugScenario('Active fallback -> alt meaningful to meaningful', {
                alt: 'Updated meaningful text for the intended primary image.',
              })}
          >
            Alt to meaningful
          </button>
          <button
            type="button"
            onclick={() =>
              setDebugScenario('Active fallback -> alt meaningful to empty', {
                alt: '',
              })}
          >
            Alt to empty
          </button>
          <button
            type="button"
            onclick={() =>
              setDebugScenario('Active fallback -> alt empty to meaningful', {
                alt: 'Meaningful text restored for the intended primary image.',
              })}
          >
            Alt restored
          </button>
        </div>

        <dl class="image-debug-story__diagnostics">
          <dt>Prop primary src</dt>
          <dd>{debugImageProps.src || '(empty)'}</dd>
          <dt>Prop fallback src</dt>
          <dd>{debugImageProps.fallbackSrc || '(empty)'}</dd>
          <dt>Prop alt</dt>
          <dd>{debugImageProps.alt || '(empty)'}</dd>

          {#each debugDiagnostics as item}
            <dt>{item.label}</dt>
            <dd>{item.value || '(empty)'}</dd>
          {/each}
        </dl>
      </div>
    </section>
  {/snippet}
</Story>

<style>
  .image-debug-story {
    display: grid;
    grid-template-columns: minmax(280px, 1fr) minmax(320px, 0.9fr);
    gap: 24px;
    align-items: start;
  }

  .image-debug-story__preview {
    min-inline-size: 0;
  }

  .image-debug-story__panel {
    display: grid;
    gap: 16px;
  }

  .image-debug-story__scenario {
    margin: 0;
    font: 600 16px/1.4 system-ui, sans-serif;
  }

  .image-debug-story__controls {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .image-debug-story__controls button {
    border: 1px solid rgb(36 49 42 / 0.28);
    border-radius: 6px;
    padding: 8px 10px;
    background: rgb(255 255 255);
    color: rgb(24 31 28);
    font: 600 12px/1.2 system-ui, sans-serif;
    cursor: pointer;
  }

  .image-debug-story__controls button:hover,
  .image-debug-story__controls button:focus-visible {
    border-color: rgb(12 91 75);
    outline: 2px solid rgb(12 91 75 / 0.24);
    outline-offset: 2px;
  }

  .image-debug-story__diagnostics {
    display: grid;
    grid-template-columns: max-content minmax(0, 1fr);
    gap: 6px 12px;
    margin: 0;
    font: 12px/1.4 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  }

  .image-debug-story__diagnostics dt {
    color: rgb(59 76 68);
    font-weight: 700;
  }

  .image-debug-story__diagnostics dd {
    min-inline-size: 0;
    margin: 0;
    overflow-wrap: anywhere;
    color: rgb(21 27 25);
  }

  @media (max-width: 900px) {
    .image-debug-story {
      grid-template-columns: 1fr;
    }
  }
</style>
