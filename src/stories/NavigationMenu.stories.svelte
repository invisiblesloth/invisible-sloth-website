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

  const { Story } = defineMeta({
    title: 'Organisms/NavigationMenu',
    component: NavigationMenu,
    tags: ['autodocs'],
    parameters: {
      controls: {
        include: ['sections', 'activeHref', 'closeButtonLabel'],
      },
    },
    args: {
      sections: storySections,
      activeHref: '#home',
      closeButtonLabel: 'Close navigation menu',
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
      closeButtonLabel: {
        control: 'text',
        description: 'Accessible name for the close button.',
      },
    },
  });
</script>

<Story name="Standalone" />
