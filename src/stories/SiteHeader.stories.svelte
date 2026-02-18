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
        include: ['homeHref', 'logoAlt', 'ariaLabel'],
      },
    },
    args: {
      homeHref: '/',
      logoAlt: 'Invisible Sloth',
      ariaLabel: 'Invisible Sloth home',
    },
    argTypes: {
      homeHref: {
        control: 'text',
        description: 'Destination for the logo link.',
      },
      logoAlt: {
        control: 'text',
        description: 'Alt text for the logo image (describes what it is).',
      },
      ariaLabel: {
        control: 'text',
        description: 'Aria label for the logo link (describes both brand and action for screen readers).',
      },
    },
  });
</script>

<Story name="Default" />
