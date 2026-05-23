<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import SiteNavigation from '../components/SiteNavigation.svelte';
  import {
    resolveNavigationSections,
    type NavigationSection,
    type ResolvedNavigationSection,
  } from '../lib/navigation';

  const rawStorySections: NavigationSection[] = [
    {
      items: [
        { label: 'Home', href: '#home' },
        { label: 'Blog', href: '#blog' },
        { label: 'About', href: '#about' },
        { label: 'Roxy', href: '#roxy' },
      ],
    },
    {
      heading: 'Legal',
      items: [
        { label: 'Privacy Policy', href: '#privacy-policy' },
        { label: 'Terms', href: '#terms' },
      ],
    },
    {
      heading: 'Social',
      items: [
        {
          label: 'GitHub',
          href: 'https://github.com/invisiblesloth',
          target: '_blank',
        },
        {
          label: 'itch.io',
          href: 'https://invisiblesloth.itch.io',
          target: '_blank',
        },
      ],
    },
  ];
  const storySections: ResolvedNavigationSection[] =
    resolveNavigationSections(rawStorySections);

  const pageAnchors = ['home', 'blog', 'about', 'roxy', 'privacy-policy', 'terms'];

  const { Story } = defineMeta({
    title: 'Organisms/SiteNavigation',
    component: SiteNavigation,
    tags: ['autodocs'],
    parameters: {
      layout: 'fullscreen',
      controls: {
        include: [
          'sections',
          'activeHref',
          'drawerId',
          'homeHref',
          'homeLabel',
          'logoAlt',
          'menuButtonLabel',
          'closeButtonLabel',
          'dialogLabel',
          'navigationLabel',
        ],
      },
      docs: {
        description: {
          component:
            'Production navigation composition for SiteHeader and NavigationDrawer. It owns drawer state, stable aria-controls, and background content inerting inside the interactive shell.',
        },
      },
    },
    args: {
      sections: storySections,
      activeHref: '#home',
      drawerId: 'storybook-site-navigation-drawer',
      homeHref: '/',
      menuButtonLabel: 'Open navigation menu',
      closeButtonLabel: 'Close navigation menu',
      dialogLabel: 'Navigation menu',
      navigationLabel: 'Site navigation',
    },
    argTypes: {
      sections: {
        control: 'object',
        description: 'Navigation data rendered inside the drawer.',
      },
      activeHref: {
        control: 'text',
        description: 'Href for the active drawer item.',
      },
      drawerId: {
        control: 'text',
        description: 'Stable id shared by the header trigger aria-controls and NavigationDrawer.',
      },
      onClose: {
        action: 'closed',
        description: 'Semantic close callback receiving button, escape, backdrop, or navigation.',
      },
      onNavigate: {
        action: 'navigated',
        description: 'Navigation callback forwarded before drawer close policy runs.',
      },
    },
  });
</script>

<style>
  .site-navigation-story {
    min-block-size: 100dvh;
    background: var(--color-background);
  }

  .site-navigation-story__page {
    position: relative;
    min-block-size: max(100dvh, 1366px);
  }

  .site-navigation-story__anchors {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }

  .site-navigation-story__anchor {
    position: absolute;
    inset-inline-start: 0;
    display: block;
    inline-size: 1px;
    block-size: 1px;
    scroll-margin-block-start: var(--space-section-block);
  }

  .site-navigation-story__anchor:nth-child(1) {
    inset-block-start: 0;
  }

  .site-navigation-story__anchor:nth-child(2) {
    inset-block-start: 20%;
  }

  .site-navigation-story__anchor:nth-child(3) {
    inset-block-start: 40%;
  }

  .site-navigation-story__anchor:nth-child(4) {
    inset-block-start: 60%;
  }

  .site-navigation-story__anchor:nth-child(5) {
    inset-block-start: 80%;
  }

  .site-navigation-story__anchor:nth-child(6) {
    inset-block-start: 90%;
  }
</style>

<Story name="Default">
  {#snippet template(args)}
    <div class="site-navigation-story">
      <SiteNavigation {...args}>
        <main class="site-navigation-story__page">
          <div class="site-navigation-story__anchors" aria-hidden="true">
            {#each pageAnchors as anchor}
              <span id={anchor} class="site-navigation-story__anchor"></span>
            {/each}
          </div>
        </main>
      </SiteNavigation>
    </div>
  {/snippet}
</Story>

<Story
  name="Empty"
  args={{
    sections: [],
    activeHref: undefined,
  }}
  parameters={{
    docs: {
      description: {
        story:
          'With no resolved sections, SiteNavigation renders a plain SiteHeader without a leading menu trigger or drawer.',
      },
    },
  }}
>
  {#snippet template(args)}
    <div class="site-navigation-story">
      <SiteNavigation {...args}>
        <main class="site-navigation-story__page"></main>
      </SiteNavigation>
    </div>
  {/snippet}
</Story>
