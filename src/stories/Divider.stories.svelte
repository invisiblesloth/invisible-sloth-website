<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import Divider from '../components/Divider.svelte';

  const { Story } = defineMeta({
    title: 'Atoms/Divider',
    component: Divider,
    tags: ['autodocs'],
    parameters: {
      controls: {
        include: ['orientation', 'thickness', 'ariaHidden'],
      },
    },
    args: {
      orientation: 'horizontal',
      thickness: 'Default',
      ariaHidden: false,
    },
    argTypes: {
      orientation: {
        control: 'select',
        options: ['horizontal', 'vertical'],
        description: 'Orientation of the divider',
      },
      thickness: {
        control: 'select',
        options: ['Default', 'Double'],
        description: 'Thickness variant: default is 1px, double is 2px',
      },
      ariaHidden: {
        control: 'boolean',
        description: 'Hide divider from assistive technologies when purely decorative',
      },
    },
  });
</script>

<style>
  .divider-story-inset {
    padding-inline: var(--space-600);
  }

  .divider-story-vertical-frame {
    display: flex;
    align-items: stretch;
    gap: var(--space-600);
    block-size: 160px;
    inline-size: 100%;
  }

  .divider-story-vertical-label {
    display: flex;
    align-items: center;
    color: var(--color-on-background-dim);
  }

  .divider-story-vertical-inset-slot {
    display: flex;
    align-items: stretch;
    box-sizing: border-box;
    block-size: 100%;
    padding-block: var(--space-600);
  }

  :global(.divider-story-outline-line.divider-story-outline-line) {
    border-block-start-color: var(--color-outline);
  }
</style>

<Story
  name="Horizontal Default"
  args={{
    orientation: 'horizontal',
    thickness: 'Default',
    ariaHidden: false,
  }}
/>

<Story
  name="Horizontal Double"
  args={{
    orientation: 'horizontal',
    thickness: 'Double',
    ariaHidden: false,
  }}
/>

<Story
  name="Horizontal Inset Wrapper"
  args={{
    orientation: 'horizontal',
    thickness: 'Default',
    ariaHidden: true,
  }}
  parameters={{
    docs: {
      description: {
        story: 'Inset spacing is owned by the parent wrapper, not the Divider primitive.',
      },
    },
  }}
>
  {#snippet template(args)}
    <div class="divider-story-inset">
      <Divider {...args} />
    </div>
  {/snippet}
</Story>

<Story
  name="Global Class Hook"
  args={{
    orientation: 'horizontal',
    thickness: 'Default',
    ariaHidden: true,
  }}
  parameters={{
    docs: {
      description: {
        story:
          'Forwarded classes support global utilities and hooks. This example uses the outline token; parent-scoped layout should still use wrappers.',
      },
    },
  }}
>
  {#snippet template(args)}
    <Divider {...args} class="divider-story-outline-line" />
  {/snippet}
</Story>

<Story
  name="Vertical Default"
  args={{
    orientation: 'vertical',
    thickness: 'Default',
    ariaHidden: false,
  }}
>
  {#snippet template(args)}
    <div class="divider-story-vertical-frame">
      <span class="divider-story-vertical-label">Start</span>
      <Divider {...args} />
      <span class="divider-story-vertical-label">End</span>
    </div>
  {/snippet}
</Story>

<Story
  name="Vertical Double"
  args={{
    orientation: 'vertical',
    thickness: 'Double',
    ariaHidden: false,
  }}
>
  {#snippet template(args)}
    <div class="divider-story-vertical-frame">
      <span class="divider-story-vertical-label">Start</span>
      <Divider {...args} />
      <span class="divider-story-vertical-label">End</span>
    </div>
  {/snippet}
</Story>

<Story
  name="Vertical Inset Wrapper"
  args={{
    orientation: 'vertical',
    thickness: 'Default',
    ariaHidden: true,
  }}
  parameters={{
    docs: {
      description: {
        story:
          'Vertical inset sizing is owned by a definite-height flex wrapper around the Divider.',
      },
    },
  }}
>
  {#snippet template(args)}
    <div class="divider-story-vertical-frame">
      <span class="divider-story-vertical-label">Start</span>
      <div class="divider-story-vertical-inset-slot">
        <Divider {...args} />
      </div>
      <span class="divider-story-vertical-label">End</span>
    </div>
  {/snippet}
</Story>
