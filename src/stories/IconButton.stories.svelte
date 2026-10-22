<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import Button from '../components/Button.svelte';
  import Close from '../icons/Close.svelte';
  import Menu from '../icons/Menu.svelte';
  import { BUTTON_VARIANTS } from '../lib/button';

  const iconVariantExamples = BUTTON_VARIANTS.map((variant) => ({
    variant,
    label: variant
      .split('-')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' '),
  }));

  const { Story } = defineMeta({
    title: 'Atoms/Icon Button',
    component: Button,
    tags: ['autodocs'],
    parameters: {
      controls: {
        include: ['variant', 'label', 'disabled', 'type', 'href', 'target', 'rel', 'onclick'],
      },
      docs: {
        description: {
          component:
            'Icon-only shape of the shared Button primitive. The icon snippet is hidden from assistive technology; label provides the accessible name.',
        },
      },
    },
    args: {
      shape: 'icon',
      label: 'Open navigation menu',
      variant: 'filled-primary',
    },
    argTypes: {
      onclick: { action: 'onclick called', description: 'Activation callback for button and link modes.' },
      icon: {
        control: false,
        description: 'Decorative Svelte snippet for the requested icon shape. If omitted, Button warns in development and renders a label-shaped fallback.',
        table: {
          type: { summary: 'Snippet' },
          defaultValue: { summary: 'undefined' },
        },
      },
      shape: {
        control: false,
        description: 'Fixed to the icon-only Button shape for this family.',
        table: {
          type: { summary: 'label | icon' },
          defaultValue: { summary: 'icon' },
        },
      },
      variant: {
        control: 'select',
        options: BUTTON_VARIANTS,
        description: 'Button style variant',
        table: {
          type: { summary: BUTTON_VARIANTS.join(' | ') },
          defaultValue: { summary: 'filled-primary' },
        },
      },
      type: { control: 'select', options: ['button', 'submit', 'reset'], description: 'HTML button type.' },
      label: { control: 'text', description: 'Accessible name for the icon-only control. Omitted or blank labels fall back to Button; blank labels warn in development.' },
      disabled: { control: 'boolean', description: 'Disables button or link activation.' },
      href: { control: 'text', description: 'Optional URL that selects link rendering.' },
      target: { control: 'text', description: 'Optional link target.' },
      rel: { control: 'text', description: 'Optional link relationship tokens.' },
    },
  });
</script>

<style>
  .icon-button-story-grid {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-600);
  }
</style>

{#snippet menuIcon()}
  <Menu />
{/snippet}

{#snippet closeIcon()}
  <Close />
{/snippet}

<Story name="Filled Primary">
  {#snippet template(args)}
    <Button {...args} icon={menuIcon} />
  {/snippet}
</Story>

<Story
  name="Navigation Inverse Primary"
  args={{
    label: 'Open navigation menu',
    variant: 'filled-inverse-primary',
  }}
>
  {#snippet template(args)}
    <Button
      {...args}
      icon={menuIcon}
      aria-expanded={false}
      aria-controls="storybook-navigation-drawer"
    />
    <div id="storybook-navigation-drawer" hidden></div>
  {/snippet}
</Story>

<Story
  name="Variant Matrix"
  parameters={{
    controls: { disable: true },
    docs: {
      description: {
        story: 'This fixed example does not consume Storybook args; controls are disabled.',
      },
    },
  }}
>
  {#snippet template()}
    <div class="icon-button-story-grid">
      {#each iconVariantExamples as example}
        <Button shape="icon" label={example.label} variant={example.variant} icon={menuIcon} />
      {/each}
    </div>
  {/snippet}
</Story>

<Story
  name="Disabled Variant Matrix"
  parameters={{
    controls: { disable: true },
    docs: {
      description: {
        story: 'This fixed example does not consume Storybook args; controls are disabled.',
      },
    },
  }}
>
  {#snippet template()}
    <div class="icon-button-story-grid">
      {#each iconVariantExamples as example}
        <Button shape="icon" label={example.label} variant={example.variant} icon={menuIcon} disabled />
      {/each}
    </div>
  {/snippet}
</Story>

<Story
  name="Missing Icon Fallback"
  args={{
    label: 'Missing Icon Fallback',
    variant: 'text',
  }}
  parameters={{
    docs: {
      description: {
        story:
          '`shape="icon"` without an icon snippet warns and renders a label-shaped fallback with visible label text.',
      },
    },
  }}
/>

<Story
  name="Blank Icon Label Fallback"
  args={{
    label: '   ',
    variant: 'text',
  }}
  parameters={{
    docs: {
      description: {
        story:
          'Blank icon-button labels fall back to "Button" for the root accessible name while keeping the icon decorative.',
      },
    },
  }}
>
  {#snippet template(args)}
    <Button {...args} icon={menuIcon} />
  {/snippet}
</Story>

<Story
  name="Ignored Label Adornments"
  args={{
    label: 'Close navigation menu',
    variant: 'text',
  }}
  parameters={{
    docs: {
      description: {
        story:
          '`leadingIcon` and `trailingIcon` are ignored when `shape="icon"`; the icon snippet remains the only rendered glyph.',
      },
    },
  }}
>
  {#snippet template(args)}
    <Button {...args} icon={closeIcon} leadingIcon={menuIcon} trailingIcon={menuIcon} />
  {/snippet}
</Story>
