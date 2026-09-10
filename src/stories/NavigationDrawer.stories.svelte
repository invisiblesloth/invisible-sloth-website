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
      id: { control: 'text', description: 'Stable drawer element id.' },
      open: { control: 'boolean', description: 'Whether the drawer is open.' },
      sections: { control: 'object', description: 'Grouped navigation data.' },
      activeHref: { control: 'text', description: 'Href marked as the current page.' },
      dialogLabel: { control: 'text', description: 'Accessible dialog label.' },
      navigationLabel: { control: 'text', description: 'Accessible navigation label.' },
      closeButtonLabel: { control: 'text', description: 'Accessible close-button label.' },
      onclose: { action: 'closed', description: 'Svelte callback emitted for close requests.' },
      onnavigate: { action: 'navigated', description: 'Svelte callback emitted before navigation close policy.' },
      class: { control: false, description: 'Optional root dialog class hook.' },
      onClose: {
        action: 'closed',
        description: 'Legacy camel-case close callback retained for compatibility.',
      },
      onNavigate: {
        action: 'navigated',
        description: 'Legacy camel-case navigation callback retained for compatibility.',
      },
    },
  });
</script>

<Story name="Standalone Open" />
