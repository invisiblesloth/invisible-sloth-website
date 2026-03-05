<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import Tag from '../components/Tag.svelte';

  const LONG_LABEL_TEXT = 'This Is A Very Long Tag Label That Must Truncate Inside A Narrow Parent';

  const { Story } = defineMeta({
    title: 'Atoms/Tag',
    component: Tag,
    tags: ['autodocs'],
    parameters: {
      controls: {
        include: ['label', 'href', 'target', 'rel', 'type', 'onclick'],
      },
    },
    argTypes: {
      onclick: { action: 'onclick called' },
      label: {
        control: 'text',
        description: 'Tag label text',
      },
      href: {
        control: 'text',
        description: 'Optional URL; when present the tag renders as a link',
      },
      target: {
        control: 'text',
        description: 'Optional link target; no default is applied',
      },
      rel: {
        control: 'text',
        description: 'Optional link rel; if target is _blank, missing security tokens are appended',
      },
      type: {
        control: 'select',
        options: ['button', 'submit', 'reset'],
        description: 'Button type used when href is not provided',
      },
    },
    args: {
      label: 'Label',
      type: 'button',
    },
  });
</script>

<Story name="Button" args={{ label: 'Primary Tag' }} />

<Story
  name="Link"
  args={{
    label: 'Visit Invisible Sloth',
    href: 'https://invisiblesloth.com/',
    target: '_blank',
  }}
/>

<Story
  name="Long Label (No Constraint)"
  args={{
    label: LONG_LABEL_TEXT,
  }}
  parameters={{
    docs: {
      description: {
        story: 'Renders the long label with natural width. The full label should remain visible.',
      },
    },
  }}
/>

<Story
  name="Long Label (Forced Ellipsis 160px)"
  args={{
    label: LONG_LABEL_TEXT,
    style: 'max-inline-size: 160px;',
  }}
  parameters={{
    docs: {
      description: {
        story: 'Renders the same long label constrained to 160px. The label should truncate with an ellipsis.',
      },
    },
  }}
/>

<Story
  name="Invalid Props Guard"
  parameters={{
    docs: {
      description: {
        story: 'Intentionally passes unsupported `disabled` and `aria-disabled`. Tag strips them and emits deduplicated dev-only warnings.',
      },
    },
  }}
>
  <Tag href="https://invisiblesloth.com/" label="Invalid Disabled Link Usage" disabled aria-disabled="true" />
</Story>
