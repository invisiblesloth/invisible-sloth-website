<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import SiteFooter from '../components/SiteFooter.svelte';

  const { Story } = defineMeta({
    title: 'Organisms/SiteFooter',
    component: SiteFooter,
    tags: ['autodocs'],
    parameters: {
      layout: 'fullscreen',
      controls: {
        include: ['homeHref', 'logoAlt', 'ariaLabel', 'tagline', 'copyrightText'],
      },
    },
    args: {
      homeHref: '/',
      logoAlt: 'Invisible Sloth',
      ariaLabel: 'Invisible Sloth home',
      tagline: "We may be slow, but we're not slowing down!",
      copyrightText: 'Invisible Sloth, LLC © 2024-2025',
    },
    argTypes: {
      homeHref: {
        control: 'text',
        description: 'Destination for the logo link. Set to empty string to disable link.',
      },
      logoAlt: {
        control: 'text',
        description: 'Alt text for the logo image.',
      },
      ariaLabel: {
        control: 'text',
        description: 'Aria label for the logo link (describes both brand and action).',
      },
      tagline: {
        control: 'text',
        description: 'Footer tagline text.',
      },
      copyrightText: {
        control: 'text',
        description: 'Copyright notice text.',
      },
    },
  });
</script>

<Story name="Default" />
