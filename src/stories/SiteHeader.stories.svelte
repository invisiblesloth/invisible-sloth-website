<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import SiteHeader from '../components/SiteHeader.svelte';
  import Button from '../components/Button.svelte';
  import Menu from '../icons/Menu.svelte';
  import Close from '../icons/Close.svelte';
  import { DEFAULT_LOGO_LINK_LABEL } from '../lib/logo';

  const { Story } = defineMeta({
    title: 'Organisms/SiteHeader',
    component: SiteHeader,
    tags: ['autodocs'],
    parameters: {
      layout: 'fullscreen',
      controls: {
        include: ['homeHref', 'homeLabel', 'logoAlt'],
      },
      docs: {
        description: {
          component:
            'Responsive brand header. Optional leading and trailing snippets are balanced with layout-only spacer regions so the logo remains centered; navigation behavior belongs to SiteNavigation.',
        },
      },
    },
    args: {
      homeHref: '/',
      homeLabel: DEFAULT_LOGO_LINK_LABEL,
      logoAlt: 'Invisible Sloth',
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
    },
  });
</script>

{#snippet menuIcon()}
  <Menu />
{/snippet}

{#snippet closeIcon()}
  <Close />
{/snippet}

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
  name="Leading Region"
  parameters={{
    docs: {
      description: {
        story:
          'A leading snippet renders with an empty trailing spacer so the logo remains centered.',
      },
    },
  }}
>
  {#snippet template(args)}
    {#snippet leading()}
      <Button
        variant="filled-inverse-primary"
        shape="icon"
        label="Example leading control"
        icon={menuIcon}
      />
    {/snippet}

    <SiteHeader {...args} {leading} />
  {/snippet}
</Story>

<Story
  name="Trailing Region"
  parameters={{
    docs: {
      description: {
        story:
          'A trailing snippet renders with an empty leading spacer so the logo remains centered.',
      },
    },
  }}
>
  {#snippet template(args)}
    {#snippet trailing()}
      <Button
        variant="filled-inverse-primary"
        shape="icon"
        label="Example trailing control"
        icon={closeIcon}
      />
    {/snippet}

    <SiteHeader {...args} {trailing} />
  {/snippet}
</Story>

<Story
  name="Balanced Regions"
  parameters={{
    docs: {
      description: {
        story:
          'Both side snippets render in equal regions, preserving centered brand placement.',
      },
    },
  }}
>
  {#snippet template(args)}
    {#snippet leading()}
      <Button
        variant="filled-inverse-primary"
        shape="icon"
        label="Example leading control"
        icon={menuIcon}
      />
    {/snippet}

    {#snippet trailing()}
      <Button
        variant="filled-inverse-primary"
        shape="icon"
        label="Example trailing control"
        icon={closeIcon}
      />
    {/snippet}

    <SiteHeader {...args} {leading} {trailing} />
  {/snippet}
</Story>
