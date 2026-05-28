<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import NavigationDrawer from '../components/NavigationDrawer.svelte';
  import type { NavigationDrawerProps } from '../components/NavigationDrawer.svelte';

  const storySections: NonNullable<NavigationDrawerProps['sections']> = [
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
  ];

  const { Story } = defineMeta({
    title: 'Organisms/NavigationDrawer',
    component: NavigationDrawer,
    tags: ['autodocs'],
    parameters: {
      layout: 'fullscreen',
      controls: {
        include: [
          'id',
          'open',
          'sections',
          'activeHref',
          'dialogLabel',
          'navigationLabel',
          'closeButtonLabel',
        ],
      },
      docs: {
        description: {
          component:
            'Standalone drawer shell with component-local geometry fallbacks. SiteNavigation supplies shared shell variables and host-owned navigation close policy when the drawer is used in the full navigation composition.',
        },
      },
    },
    args: {
      id: 'storybook-standalone-navigation-drawer',
      open: true,
      sections: storySections,
      activeHref: '#home',
      dialogLabel: 'Navigation menu',
      navigationLabel: 'Site navigation',
      closeButtonLabel: 'Close navigation menu',
    },
    argTypes: {
      onClose: {
        action: 'closed',
      },
      onNavigate: {
        action: 'navigated',
      },
    },
  });
</script>

<Story name="Standalone Open" />
