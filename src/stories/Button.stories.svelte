<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import Button from '../components/Button.svelte';
  import Close from '../icons/Close.svelte';
  import ExternalLink from '../icons/ExternalLink.svelte';
  import { BUTTON_TYPES, BUTTON_VARIANTS, type ButtonType, type ButtonVariant } from '../lib/button';

  const invalidRuntimeVariant = 'invalid-runtime-variant' as ButtonVariant;
  const invalidRuntimeType = 'invalid-runtime-type' as ButtonType;

  const { Story } = defineMeta({
    title: 'Atoms/Button',
    component: Button,
    tags: ['autodocs'],
    parameters: {
      docs: {
        description: {
          component:
            'Label-driven button primitive. Icon snippets are decorative glyphs only; do not pass nested interactive controls, focusable SVGs, or activation handlers. Migration note: `on:click` removed, use `onclick`.',
        },
      },
      controls: {
        include: ['variant', 'type', 'label', 'disabled', 'href', 'target', 'rel', 'onclick'],
      },
    },
    argTypes: {
      onclick: { action: 'onclick called' },
      variant: {
        control: 'select',
        options: BUTTON_VARIANTS,
        description: 'Button style variant',
        table: {
          type: { summary: BUTTON_VARIANTS.join(' | ') },
          defaultValue: { summary: 'filled-primary' },
        },
      },
      type: {
        control: 'select',
        options: BUTTON_TYPES,
        description: 'HTML button type',
        table: {
          type: { summary: BUTTON_TYPES.join(' | ') },
          defaultValue: { summary: 'button' },
        },
      },
      label: {
        control: 'text',
        description: 'Button text label and default accessible name',
        table: {
          type: { summary: 'string' },
          defaultValue: { summary: 'Button' },
        },
      },
      disabled: {
        control: 'boolean',
        description:
          'Whether the button is disabled. In link mode, disabled links are non-interactive and rendered with aria-disabled semantics.',
        table: {
          type: { summary: 'boolean' },
          defaultValue: { summary: 'false' },
        },
      },
      href: {
        control: 'text',
        description: 'Optional URL to render as anchor instead of button',
        table: {
          type: { summary: 'string' },
          defaultValue: { summary: 'undefined' },
        },
      },
      target: {
        control: 'text',
        description: 'Optional link target (same-tab default). Values resolving to "_blank" are normalized.',
        table: {
          type: { summary: 'string' },
          defaultValue: { summary: 'undefined' },
        },
      },
      rel: {
        control: 'text',
        description:
          'Optional link rel. Non-"_blank" targets pass rel through unchanged. For "_blank" targets, missing security tokens are appended and tokens are deduped case-insensitively while preserving first-token casing.',
        table: {
          type: { summary: 'string' },
          defaultValue: { summary: 'undefined' },
        },
      },
    },
  });
</script>

{#snippet closeIcon()}
  <Close />
{/snippet}

{#snippet externalLinkIcon()}
  <ExternalLink />
{/snippet}

<Story name="Filled Primary" args={{ label: 'Primary Button', variant: 'filled-primary' }} />

<Story name="Filled Secondary" args={{ label: 'Secondary Button', variant: 'filled-secondary' }} />

<Story name="Filled Tertiary" args={{ label: 'Tertiary Button', variant: 'filled-tertiary' }} />

<Story name="Action Button" args={{ label: 'Save Changes', variant: 'filled-primary' }} />

<Story
  name="Leading Icon Snippet"
  args={{
    label: 'Dismiss',
    variant: 'filled-tertiary',
  }}
>
  {#snippet template(args)}
    <Button {...args} leadingIcon={closeIcon} />
  {/snippet}
</Story>

<Story
  name="Link Same Tab (Default)"
  args={{
    label: 'Internal Link',
    variant: 'filled-secondary',
    href: '/projects/roxy',
  }}
/>

<Story
  name="External Link With Icon"
  args={{
    label: 'External Link',
    variant: 'filled-secondary',
    href: 'https://github.com/invisiblesloth/roxy-engine',
    target: '_blank',
  }}
>
  {#snippet template(args)}
    <Button {...args} trailingIcon={externalLinkIcon} />
  {/snippet}
</Story>

<Story
  name="Disabled Link (Strict)"
  args={{
    label: 'Disabled Link',
    variant: 'filled-secondary',
    href: 'https://github.com/invisiblesloth/roxy-engine',
    disabled: true,
  }}
  parameters={{
    docs: {
      description: {
        story: 'Disabled links do not navigate and do not invoke `onclick`.',
      },
    },
  }}
/>

<Story
  name="Invalid Href Fallback"
  args={{
    label: 'Whitespace Href Fallback',
    variant: 'filled-secondary',
    href: '   ',
    name: 'fallback-button-name',
    download: 'not-forwarded.txt',
  }}
  parameters={{
    docs: {
      description: {
        story:
          'Whitespace-only `href` values fall back to button mode, forward only button-safe attributes, and emit a deduplicated client-dev-only warning.',
      },
    },
  }}
/>

<Story
  name="_blank Security (Dedupe + Case)"
  args={{
    label: 'External Link (Normalized rel)',
    variant: 'filled-secondary',
    href: 'https://github.com/invisiblesloth/roxy-engine',
    target: ' _BLANK ',
    rel: 'NoFoLlOw NOOPENER noopener',
  }}
>
  {#snippet template(args)}
    <Button {...args} trailingIcon={externalLinkIcon} />
  {/snippet}
</Story>

<Story
  name="Invalid Variant Fallback"
  parameters={{
    docs: {
      description: {
        story:
          'Intentionally passes an invalid runtime variant. Button falls back to `filled-primary` and emits a dev-only warning.',
      },
    },
  }}
>
  {#snippet template()}
    <Button label="Invalid Variant Fallback" variant={invalidRuntimeVariant} />
  {/snippet}
</Story>

<Story
  name="Invalid Type Fallback"
  parameters={{
    docs: {
      description: {
        story:
          'Intentionally passes an invalid runtime button type. Button falls back to `button` and emits a dev-only warning.',
      },
    },
  }}
>
  {#snippet template()}
    <Button label="Invalid Type Fallback" type={invalidRuntimeType} />
  {/snippet}
</Story>

<Story
  name="Forwarded Attributes"
  parameters={{
    docs: {
      description: {
        story:
          '`id`, safe ARIA/data attributes, non-activation focus/hover events, and mode-specific native attributes are forwarded. `class`, `style`, ARIA naming overrides, and activation-adjacent events are stripped.',
      },
    },
  }}
>
  {#snippet template()}
    <Button
      id="button-forwarding-story"
      label="Forwarded Attributes"
      variant="filled-primary"
      title="Forwarded title"
      data-tracking-id="button-forwarding-story"
      aria-describedby="button-forwarding-note"
      aria-label="Stripped label override"
      class="stripped-class"
      style="color: red;"
      onmouseenter={() => undefined}
      onkeydown={() => undefined}
    />
    <p id="button-forwarding-note" style="margin-block-end: 0;">
      The button keeps its visible label as its accessible name.
    </p>
  {/snippet}
</Story>
