<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import Button from '../components/Button.svelte';

  const { Story } = defineMeta({
    title: 'Atoms/Button',
    component: Button,
    tags: ['autodocs'],
    argTypes: {
      click: { action: 'clicked' }, // Dispatched event (on:click pattern)
      onclick: { action: 'onclick called' }, // Callback prop (new pattern)
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
        description: 'Whether the button is disabled',
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
        description: 'Link target (default: "_blank" when href is present)',
        table: {
          type: { summary: 'string' },
          defaultValue: { summary: '_blank' },
        },
      },
      rel: {
        control: 'text',
        description: 'Link rel attribute (default: "noopener noreferrer" when href is present)',
        table: {
          type: { summary: 'string' },
          defaultValue: { summary: 'noopener noreferrer' },
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
