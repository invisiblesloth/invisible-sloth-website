<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import SiteHeader from '../components/SiteHeader.svelte';
  import { DEFAULT_LOGO_LINK_LABEL } from '../lib/logo';

  const { Story } = defineMeta({
    title: 'Organisms/SiteHeader',
    component: SiteHeader,
    tags: ['autodocs'],
    parameters: {
      layout: 'fullscreen',
      controls: {
        include: [
          'homeHref',
          'homeLabel',
          'logoAlt',
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
      homeLabel: DEFAULT_LOGO_LINK_LABEL,
      logoAlt: 'Invisible Sloth',
      showMenuButton: false,
      menuExpanded: false,
      menuButtonLabel: 'Open navigation menu',
    },
    argTypes: {
      onMenuClick: { action: 'menu clicked' },
      homeHref: {
        control: 'text',
        description: 'Destination for the logo link. Set to empty string to disable link.',
      },
      homeLabel: {
        control: 'text',
        description: 'Accessible name for the logo link.',
      },
      logoAlt: {
        control: 'text',
        description:
          'Alt text used only for the standalone logo when homeHref is empty. Linked logos use homeLabel on the link.',
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
  name="Unlinked Logo"
  args={{
    homeHref: '',
  }}
  parameters={{
    docs: {
      description: {
        story:
          'An empty homeHref preserves the documented structural logo mode at the SiteHeader layer.',
      },
    },
  }}
/>

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
