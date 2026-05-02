<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import Button from '../components/Button.svelte';

  const { Story } = defineMeta({
    title: 'Atoms/Button',
    component: Button,
    tags: ['autodocs'],
    parameters: {
      docs: {
        description: {
          component: 'Migration note: `on:click` removed, use `onclick`.',
        },
      },
      controls: {
        include: [
          'variant',
          'type',
          'label',
          'disabled',
          'hasLeadingIcon',
          'hasTrailingIcon',
          'href',
          'target',
          'rel',
          'onclick',
        ],
      },
    },
    argTypes: {
      onclick: { action: 'onclick called' },
      variant: {
        control: 'select',
        options: ['filled-primary', 'filled-secondary', 'filled-tertiary'],
        description: 'Button style variant',
        table: {
          type: { summary: 'string' },
          defaultValue: { summary: 'filled-primary' },
        },
      },
      type: {
        control: 'select',
        options: ['button', 'submit', 'reset'],
        description: 'HTML button type',
        table: {
          type: { summary: 'string' },
          defaultValue: { summary: 'button' },
        },
      },
      label: {
        control: 'text',
        description: 'Button text label',
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
      hasLeadingIcon: {
        control: 'boolean',
        description: 'Toggle leading icon',
        table: {
          type: { summary: 'boolean' },
          defaultValue: { summary: 'false' },
        },
      },
      hasTrailingIcon: {
        control: 'boolean',
        description: 'Toggle trailing icon',
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
    args: {
      hasLeadingIcon: false,
      hasTrailingIcon: false,
    },
  });
</script>

<Story name="Filled Primary" args={{ label: 'Primary Button', variant: 'filled-primary' }} />

<Story name="Filled Secondary" args={{ label: 'Secondary Button', variant: 'filled-secondary' }} />

<Story name="Filled Tertiary" args={{ label: 'Tertiary Button', variant: 'filled-tertiary' }} />

<Story
  name="Link Same Tab (Default)"
  args={{
    label: 'Internal Link',
    variant: 'filled-secondary',
    href: '/projects/roxy',
  }}
/>

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
  }}
  parameters={{
    docs: {
      description: {
        story:
          'Whitespace-only `href` values fall back to button mode and emit a deduplicated client-dev-only warning.',
      },
    },
  }}
/>

<Story
  name="_blank Security (No rel)"
  args={{
    label: 'External Link',
    variant: 'filled-secondary',
    href: 'https://github.com/invisiblesloth/roxy-engine',
    target: '_blank',
    hasTrailingIcon: true,
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
    hasTrailingIcon: true,
  }}
/>
