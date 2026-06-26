<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import Button from '../components/Button.svelte';
  import Close from '../icons/Close.svelte';
  import ExternalLink from '../icons/ExternalLink.svelte';
  import {
    BUTTON_SHAPES,
    BUTTON_TYPES,
    BUTTON_VARIANTS,
    type ButtonShape,
    type ButtonType,
    type ButtonVariant,
  } from '../lib/button';

  const invalidRuntimeVariant = 'invalid-runtime-variant' as ButtonVariant;
  const invalidRuntimeShape = 'invalid-runtime-shape' as ButtonShape;
  const invalidRuntimeType = 'invalid-runtime-type' as ButtonType;
  const labelVariantExamples = BUTTON_VARIANTS.map((variant) => ({
    variant,
    label: variant
      .split('-')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' '),
  }));
  const filledVariantExamples = labelVariantExamples.filter((example) =>
    example.variant.startsWith('filled-')
  );

  const { Story } = defineMeta({
    title: 'Atoms/Button',
    component: Button,
    tags: ['autodocs'],
    parameters: {
      docs: {
        description: {
          component:
            'Strict control primitive with label and icon-only shapes. Button forwards only allowlisted safe/native attributes from rest props; `class`, `style`, ARIA naming overrides, and activation-adjacent rest-event handlers are stripped. Activation is exposed through the explicit `onclick` prop, while touch and key activation handlers are component-owned or stripped. Non-activation focus/hover events may be allowlisted. Snippets are decorative glyphs only; do not pass nested interactive controls, focusable SVGs, or activation handlers. Migration note: Svelte `on:click` was removed; pass `onclick`.',
        },
      },
      controls: {
        include: ['variant', 'shape', 'type', 'label', 'disabled', 'href', 'target', 'rel', 'onclick'],
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
      shape: {
        control: 'select',
        options: BUTTON_SHAPES,
        description: 'Button shape. Icon shape requires a fixed snippet supplied by the story/template.',
        table: {
          type: { summary: BUTTON_SHAPES.join(' | ') },
          defaultValue: { summary: 'label' },
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
      icon: {
        control: false,
        description: 'Icon-only Svelte snippet. Demonstrated through fixed icon-button stories.',
        table: {
          type: { summary: 'Snippet' },
          defaultValue: { summary: 'undefined' },
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
      class: {
        control: false,
        description: 'Not forwarded. Use Button variants and design tokens instead.',
      },
      style: {
        control: false,
        description: 'Not forwarded. Use Button variants and design tokens instead.',
      },
    },
  });
</script>

<style>
  .button-story-grid {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-600);
  }

  .button-state-matrix {
    display: grid;
    gap: var(--space-700);
    overflow: visible;
  }

  .button-state-matrix__grid {
    display: grid;
    grid-template-columns: max-content repeat(3, minmax(9rem, max-content));
    gap: var(--space-400) var(--space-600);
    align-items: center;
    overflow: visible;
  }

  .button-state-matrix__heading,
  .button-state-matrix__variant {
    color: var(--color-on-surface-dim);
  }

  .button-state-matrix__heading {
    align-self: end;
  }

  .button-state-matrix__variant {
    overflow-wrap: anywhere;
  }

  .button-state-matrix__cell {
    display: flex;
    align-items: center;
    min-block-size: 72px;
    padding: var(--space-300);
    overflow: visible;
  }

  .button-state-matrix__disabled {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-600);
    overflow: visible;
  }

  .button-state-matrix :global(.button[data-story-state='hover']:not(:disabled):not(.is-disabled) .button__shadow) {
    box-shadow: var(--button-cast-shadow-hover) !important;
    opacity: var(--button-cast-shadow-opacity) !important;
  }

  .button-state-matrix :global(.button[data-story-state='hover']:not(:disabled):not(.is-disabled) .button__surface) {
    box-shadow:
      inset 0 0 0 var(--button-border-width) var(--button-border-color),
      var(--button-surface-shadow-hover) !important;
    transform: var(--button-surface-transform-hover) !important;
  }

  .button-state-matrix :global(.button[data-story-state='hover']:not(:disabled):not(.is-disabled) .button__state-layer) {
    background-color: var(--button-state-hover) !important;
    opacity: 1 !important;
  }

  .button-state-matrix :global(.button[data-story-state='pressed']:not(:disabled):not(.is-disabled) .button__shadow) {
    box-shadow: var(--button-cast-shadow-pressed) !important;
    opacity: 0 !important;
  }

  .button-state-matrix :global(.button[data-story-state='pressed']:not(:disabled):not(.is-disabled) .button__surface) {
    box-shadow:
      inset 0 0 0 var(--button-border-width) var(--button-border-color),
      var(--button-surface-shadow-pressed) !important;
    transform: var(--button-surface-transform-pressed) !important;
  }

  .button-state-matrix :global(.button[data-story-state='pressed']:not(:disabled):not(.is-disabled) .button__state-layer) {
    background-color: var(--button-state-pressed) !important;
    opacity: 1 !important;
  }

  @media (max-width: 700px) {
    .button-state-matrix__grid {
      grid-template-columns: 1fr;
      gap: var(--space-300);
    }

    .button-state-matrix__heading {
      display: none;
    }

    .button-state-matrix__variant {
      margin-block-start: var(--space-400);
    }

    .button-state-matrix__cell {
      min-block-size: 64px;
      padding-inline: 0;
    }
  }
</style>

{#snippet closeIcon()}
  <Close />
{/snippet}

{#snippet externalLinkIcon()}
  <ExternalLink />
{/snippet}

<Story name="Filled Primary" args={{ label: 'Primary Button', variant: 'filled-primary' }} />

<Story name="Filled Secondary" args={{ label: 'Secondary Button', variant: 'filled-secondary' }} />

<Story name="Filled Tertiary" args={{ label: 'Tertiary Button', variant: 'filled-tertiary' }} />

<Story name="Label Variant Matrix">
  {#snippet template()}
    <div class="button-story-grid">
      {#each labelVariantExamples as example}
        <Button label={example.label} variant={example.variant} />
      {/each}
    </div>
  {/snippet}
</Story>

<Story name="Disabled Label Variant Matrix">
  {#snippet template()}
    <div class="button-story-grid">
      {#each labelVariantExamples as example}
        <Button label={example.label} variant={example.variant} disabled />
      {/each}
    </div>
  {/snippet}
</Story>

<Story
  name="Interaction States"
  parameters={{
    docs: {
      description: {
        story:
          'Standard Button interaction states across rest, hover-simulated, pressed-simulated, disabled, and icon-only paths. Switch the global Storybook theme toolbar between Light and Dark for theme checks.',
      },
    },
  }}
>
  {#snippet template()}
    <div class="button-state-matrix">
      <div class="button-state-matrix__grid">
        <span></span>
        <span class="button-state-matrix__heading text-label-large">Rest</span>
        <span class="button-state-matrix__heading text-label-large">Hover</span>
        <span class="button-state-matrix__heading text-label-large">Pressed</span>

        {#each filledVariantExamples as example}
          <span class="button-state-matrix__variant text-label-large">{example.variant}</span>

          <div class="button-state-matrix__cell">
            <Button label="Button" variant={example.variant} data-story-state="rest" />
          </div>

          <div class="button-state-matrix__cell">
            <Button label="Button" variant={example.variant} data-story-state="hover" />
          </div>

          <div class="button-state-matrix__cell">
            <Button label="Button" variant={example.variant} data-story-state="pressed" />
          </div>
        {/each}

        <span class="button-state-matrix__variant text-label-large">icon filled-inverse-primary</span>

        <div class="button-state-matrix__cell">
          <Button
            label="Close navigation"
            variant="filled-inverse-primary"
            shape="icon"
            icon={closeIcon}
            data-story-state="rest"
          />
        </div>

        <div class="button-state-matrix__cell">
          <Button
            label="Close navigation"
            variant="filled-inverse-primary"
            shape="icon"
            icon={closeIcon}
            data-story-state="hover"
          />
        </div>

        <div class="button-state-matrix__cell">
          <Button
            label="Close navigation"
            variant="filled-inverse-primary"
            shape="icon"
            icon={closeIcon}
            data-story-state="pressed"
          />
        </div>
      </div>

      <div class="button-state-matrix__disabled">
        <span class="button-state-matrix__variant text-label-large">disabled filled-primary</span>
        <Button label="Disabled Filled" variant="filled-primary" disabled />
      </div>
    </div>
  {/snippet}
</Story>

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
  name="Invalid Shape Fallback"
  parameters={{
    docs: {
      description: {
        story:
          'Intentionally passes an invalid runtime shape. Button falls back to `label` and emits a dev-only warning.',
      },
    },
  }}
>
  {#snippet template()}
    <Button label="Invalid Shape Fallback" shape={invalidRuntimeShape} />
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
  name="Blank Label Fallback"
  parameters={{
    docs: {
      description: {
        story:
          'Blank labels fall back to "Button" so empty accessible controls are not rendered.',
      },
    },
  }}
>
  {#snippet template()}
    <Button label="   " variant="text" />
  {/snippet}
</Story>

<Story
  name="Forwarded Attributes"
  parameters={{
    docs: {
      description: {
        story:
          '`id`, safe ARIA/data attributes, non-activation focus/hover events, and mode-specific native attributes are forwarded. `class`, `style`, ARIA naming overrides, and activation-adjacent rest-event handlers are stripped; activation is exposed through the explicit `onclick` prop.',
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
