<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import NavigationMenu from '../components/NavigationMenu.svelte';
  import type { NavigationSection } from '../lib/navigation';

  const storySections: NavigationSection[] = [
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

  const emptySections = [
    {
      heading: 'Empty',
      items: [
        { label: '   ', href: '#invalid-label' },
        { label: 'Missing href', href: '   ' },
      ],
    },
    {
      heading: 'Missing items',
    },
    null,
  ] as unknown as NavigationSection[];

  const { Story } = defineMeta({
    title: 'Organisms/NavigationMenu',
    component: NavigationMenu,
    tags: ['autodocs'],
    parameters: {
      controls: {
        include: ['sections', 'activeHref', 'ariaLabel'],
      },
      docs: {
        description: {
          component:
            'List-only site navigation. Drawer chrome, close controls, and panel framing belong to NavigationDrawer or the calling composition. When no valid items remain after normalization, this component renders no DOM and the class prop has no target element.',
        },
      },
    },
    args: {
      sections: storySections,
      activeHref: '#home',
      ariaLabel: 'Site navigation',
    },
    argTypes: {
      sections: {
        control: 'object',
        description: 'Grouped navigation data. Empty or invalid sections are not rendered.',
      },
      activeHref: {
        control: 'text',
        description: 'Href for the current page. Matching items render aria-current="page".',
      },
      ariaLabel: {
        control: 'text',
        description: 'Accessible label for the rendered nav element.',
      },
    },
  });
</script>

<style>
  .navigation-menu-story {
    inline-size: min(100%, 360px);
    padding: var(--space-300);
    border-radius: var(--radius-xl);
    background: var(--color-surface-container);
    color: var(--color-on-surface);
    box-shadow: var(--effect-elevation-4);
  }
</style>

<Story name="Standalone">
  {#snippet template(args)}
    <div class="navigation-menu-story">
      <NavigationMenu {...args} />
    </div>
  {/snippet}
</Story>

<Story
  name="Empty"
  args={{
    sections: emptySections,
    activeHref: '#home',
  }}
  parameters={{
    docs: {
      description: {
        story:
          'All items are filtered out, so NavigationMenu renders no DOM inside the story-owned surface.',
      },
    },
  }}
>
  {#snippet template(args)}
    <div class="navigation-menu-story">
      <NavigationMenu {...args} />
    </div>
  {/snippet}
</Story>
