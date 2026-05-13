<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import SiteHeader from '../components/SiteHeader.svelte';

  const { Story } = defineMeta({
    title: 'Organisms/SiteHeader',
    component: SiteHeader,
    tags: ['autodocs'],
    parameters: {
      layout: 'fullscreen',
      controls: {
        include: [
          'homeHref',
          'logoAlt',
          'ariaLabel',
          'showMenuButton',
          'menuExpanded',
          'menuControlsId',
          'menuButtonLabel',
          'onMenuClick',
        ],
      },
    },
    args: {
      homeHref: '/',
      logoAlt: 'Invisible Sloth',
      ariaLabel: 'Invisible Sloth home',
      showMenuButton: false,
      menuExpanded: false,
      menuButtonLabel: 'Open navigation menu',
    },
    argTypes: {
      onMenuClick: { action: 'menu clicked' },
      homeHref: {
        control: 'text',
        description: 'Destination for the logo link.',
      },
      logoAlt: {
        control: 'text',
        description:
          'Alt text for the standalone logo when homeHref is empty. Linked logos use ariaLabel on the link.',
      },
      ariaLabel: {
        control: 'text',
        description: 'Aria label for the logo link (describes both brand and action for screen readers).',
      },
      showMenuButton: {
        control: 'boolean',
        description: 'Default-off Storybook menu-button layout.',
      },
      menuExpanded: {
        control: 'boolean',
        description: 'Current drawer state for aria-expanded on the menu button.',
      },
      menuControlsId: {
        control: 'text',
        description:
          'Optional controlled drawer id. When omitted, aria-controls is not rendered.',
      },
      menuButtonLabel: {
        control: 'text',
        description: 'Accessible name for the menu button.',
      },
    },
  });
</script>

<Story name="Default" />

<Story
  name="Menu Button"
  args={{
    showMenuButton: true,
    menuExpanded: false,
    menuControlsId: undefined,
  }}
  parameters={{
    docs: {
      description: {
        story:
          'Header-only Storybook state. This omits aria-controls because no matching drawer is rendered in this story.',
      },
    },
  }}
/>
