<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import TextBlock from '../components/TextBlock.svelte';

  const tracerIntroParagraphs = [
    'Tracer is a small time tracker for iPhone. No sign-up, no account, no cloud service. Create the activities you want to track, run one at a time, and edit entries any time - add time you forgot, fix mistakes, or look back at how your time was spent.',
    'Tracer is built for people who want a straightforward record of their time without joining another service or sharing their data.',
  ];
  const plainBody =
    'Body copy uses responsive typography: Body Medium below the Extended breakpoint and Body Large at 1015px and wider.';
  const longUnbrokenBody =
    'A long URL-like token should wrap instead of overflowing: https://invisiblesloth.com/support/articles/SuperLongUnbrokenSupportReferenceThatShouldWrapInsideTheTextBlockAtCompactWidthsWithoutEscapingTheCanvas';
  const fallbackBody = 'This fallback body should not render while slotted content is present.';
  const blankRuntimeBody = '   ';
  const malformedRuntimeBody = {
    body: 'Tracer is currently in private beta.',
  } as unknown as string;
  const nullRuntimeBody = null as unknown as string;

  const { Story } = defineMeta({
    title: 'Molecules/TextBlock',
    component: TextBlock,
    tags: ['autodocs'],
    parameters: {
      controls: {
        include: ['body'],
      },
      docs: {
        description: {
          component:
            'Headingless responsive body-copy block. TextBlock uses direct child paragraphs for local rhythm, forwards attributes to the root div, and renders no DOM when no children and no usable body are provided.',
        },
      },
    },
    args: {
      body: plainBody,
    },
    argTypes: {
      body: {
        control: 'text',
        description:
          'Plain-text fallback rendered only when no children snippet is provided. Blank or non-string runtime values render no DOM.',
      },
    },
  });
</script>

<style>
  .text-block-story {
    inline-size: 100%;
    padding-block: var(--space-section-block-sm);
  }

  .text-block-story__rail {
    inline-size: 100%;
  }

  .text-block-story__absence-check {
    min-block-size: var(--space-1200);
    padding: var(--space-300);
    border: 1px dashed var(--color-outline);
  }

  .text-block-story__absence-label {
    margin: 0 0 var(--space-300);
    color: var(--color-on-surface-variant);
  }

  :global(.text-block-story__forwarded) {
    outline: 1px dashed var(--color-outline);
    outline-offset: var(--space-100);
  }
</style>

<Story
  name="Default"
  args={{ body: '' }}
  parameters={{
    docs: {
      description: {
        story:
          'Default usage provides paragraph children. The body control is intentionally ignored while slotted content is present.',
      },
    },
  }}
>
  {#snippet template(args)}
    <div class="text-block-story">
      <div class="rail rail--md rail--padded text-block-story__rail">
        <TextBlock {...args}>
          <p>{tracerIntroParagraphs[0]}</p>
          <p>{tracerIntroParagraphs[1]}</p>
        </TextBlock>
      </div>
    </div>
  {/snippet}
</Story>

<Story name="Plain Body">
  {#snippet template(args)}
    <div class="text-block-story">
      <div class="rail rail--md rail--padded text-block-story__rail">
        <TextBlock {...args} />
      </div>
    </div>
  {/snippet}
</Story>

<Story
  name="Slot Overrides Body"
  args={{
    body: fallbackBody,
  }}
>
  {#snippet template(args)}
    <div class="text-block-story">
      <div class="rail rail--md rail--padded text-block-story__rail">
        <TextBlock {...args}>
          <p>
            This paragraph comes from the default slot and intentionally replaces the plain
            body fallback.
          </p>
        </TextBlock>
      </div>
    </div>
  {/snippet}
</Story>

<Story
  name="Long Unbroken Text"
  args={{
    body: longUnbrokenBody,
  }}
>
  {#snippet template(args)}
    <div class="text-block-story">
      <div class="rail rail--md rail--padded text-block-story__rail">
        <TextBlock {...args} />
      </div>
    </div>
  {/snippet}
</Story>

<Story
  name="With Inline Link"
  args={{ body: '' }}
  parameters={{
    docs: {
      description: {
        story:
          'Inline links remain caller-authored with the shared text-link class. The body control is intentionally ignored while slotted content is present.',
      },
    },
  }}
>
  {#snippet template(args)}
    <div class="text-block-story">
      <div class="rail rail--md rail--padded text-block-story__rail">
        <TextBlock {...args}>
          <p>
            Send Tracer feedback by email at
            <a class="text-link" href="mailto:tracer@invisiblesloth.com">
              tracer@invisiblesloth.com
            </a>.
          </p>
        </TextBlock>
      </div>
    </div>
  {/snippet}
</Story>

<Story
  name="Malformed Body (No DOM)"
  args={{
    body: malformedRuntimeBody,
  }}
  parameters={{
    docs: {
      description: {
        story:
          'Malformed non-string runtime body is guarded against and renders no TextBlock DOM. This is not a supported TypeScript authoring shape.',
      },
    },
  }}
>
  {#snippet template(args)}
    <div class="text-block-story__absence-check" data-case="malformed-body">
      <p class="text-block-story__absence-label text-label-large">
        Absence check: no TextBlock DOM should render below.
      </p>
      <TextBlock {...args} />
    </div>
  {/snippet}
</Story>

<Story
  name="Null Body (No DOM)"
  args={{
    body: nullRuntimeBody,
  }}
  parameters={{
    docs: {
      description: {
        story:
          'Null runtime body is treated as malformed input and renders no TextBlock DOM. This is not a supported TypeScript authoring shape.',
      },
    },
  }}
>
  {#snippet template(args)}
    <div class="text-block-story__absence-check" data-case="null-body">
      <p class="text-block-story__absence-label text-label-large">
        Absence check: no TextBlock DOM should render below.
      </p>
      <TextBlock {...args} />
    </div>
  {/snippet}
</Story>

<Story
  name="Empty Body (No DOM)"
  args={{
    body: blankRuntimeBody,
  }}
  parameters={{
    docs: {
      description: {
        story:
          'Blank runtime body is guarded against and renders no TextBlock DOM when no children snippet is provided.',
      },
    },
  }}
>
  {#snippet template(args)}
    <div class="text-block-story__absence-check" data-case="blank-body">
      <p class="text-block-story__absence-label text-label-large">
        Absence check: no TextBlock DOM should render below.
      </p>
      <TextBlock {...args} />
    </div>
  {/snippet}
</Story>

<Story
  name="Empty Slot Wrapper"
  args={{ body: '' }}
  parameters={{
    docs: {
      description: {
        story:
          'When a children snippet is provided, TextBlock renders the root wrapper even if that snippet produces no visible DOM.',
      },
    },
  }}
>
  {#snippet template(args)}
    <div class="text-block-story">
      <div class="rail rail--md rail--padded text-block-story__rail">
        <TextBlock {...args}>
          {#if false}
            <p>This paragraph should not render.</p>
          {/if}
        </TextBlock>
      </div>
    </div>
  {/snippet}
</Story>

<Story
  name="Forwarded Attributes"
  args={{
    body: tracerIntroParagraphs[0],
  }}
>
  {#snippet template(args)}
    <div class="text-block-story">
      <div class="rail rail--md rail--padded text-block-story__rail">
        <TextBlock
          {...args}
          id="text-block-forwarded-root"
          role="group"
          aria-label="Forwarded attributes root text block"
          data-story-root="text-block"
          title="Native div title"
          class="text-block-story__forwarded"
        />
      </div>
    </div>
  {/snippet}
</Story>
