<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import SiteFooter from '../components/SiteFooter.svelte';
  import ContactUs from '../components/ContactUs.svelte';
  import { DEFAULT_LOGO_LINK_LABEL } from '../lib/logo';

  const contactText = 'For questions, support, or just to say hi, email us at';
  const contactEmail = 'hello@invisiblesloth.com';

  const { Story } = defineMeta({
    title: 'Organisms/SiteFooter',
    component: SiteFooter,
    tags: ['autodocs'],
    parameters: {
      layout: 'fullscreen',
      controls: {
        include: ['homeHref', 'homeLabel', 'logoAlt', 'tagline', 'copyrightText'],
      },
    },
    args: {
      homeHref: '/',
      homeLabel: DEFAULT_LOGO_LINK_LABEL,
      logoAlt: 'Invisible Sloth',
      tagline: "We may be slow, but we're not slowing down!",
      copyrightText: 'Invisible Sloth, LLC © 2024-2025',
    },
    argTypes: {
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

<Story
  name="Unlinked Logo"
  args={{
    homeHref: '',
  }}
  parameters={{
    docs: {
      description: {
        story:
          'An empty homeHref preserves the documented structural logo mode at the SiteFooter layer.',
      },
    },
  }}
/>

<Story
  name="With Contact"
  parameters={{
    docs: {
      description: {
        story:
          'Page composition can place ContactUs in the footer slot between the tagline and copyright.',
      },
    },
  }}
>
  {#snippet template()}
    <SiteFooter
      homeHref="/"
      tagline="We may be slow, but we're not slowing down!"
      copyrightText="Invisible Sloth, LLC © 2024-2025"
    >
      <ContactUs text={contactText} email={contactEmail} />
    </SiteFooter>
  {/snippet}
</Story>
