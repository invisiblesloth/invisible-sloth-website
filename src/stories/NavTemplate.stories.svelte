<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import NavTemplate from './NavigationDrawerDemo.svelte';
  import type { NavigationSection } from '../lib/navigation';

  const templateSections: NavigationSection[] = [
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
    title: 'Templates/Nav',
    component: NavTemplate,
    tags: ['autodocs'],
    parameters: {
      layout: 'fullscreen',
      controls: {
        include: ['sections', 'activeHref'],
      },
      docs: {
        description: {
          component:
            'Storybook-only page template for validating the header menu button and modal navigation drawer together. This is not wired into any Astro page or layout.',
        },
      },
    },
    args: {
      sections: templateSections,
      activeHref: '#home',
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
    },
  });
</script>

<Story name="Default" />
