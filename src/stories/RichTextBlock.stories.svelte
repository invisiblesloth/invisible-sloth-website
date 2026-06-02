<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import RichTextBlock from '../components/RichTextBlock.svelte';

  const plainBody =
    'Body copy uses responsive typography: Body Medium below the Extended breakpoint and Body Large at 1015px and wider.';
  const longBareUrl =
    'https://invisiblesloth.com/support/articles/SuperLongUnbrokenSupportReferenceThatShouldWrapInsideTheRichTextBlockAtCompactWidthsWithoutEscapingTheCanvas';
  const blankRuntimeBody = '   ';
  const malformedRuntimeBody = {
    body: 'This object should be ignored as malformed runtime input.',
  } as unknown as string;

  const { Story } = defineMeta({
    title: 'Molecules/RichTextBlock',
    component: RichTextBlock,
    tags: ['autodocs'],
    parameters: {
      controls: {
        include: ['body'],
      },
      docs: {
        description: {
          component:
            'Responsive prose primitive for already-rendered prose-shaped child markup. Children win over the plain escaped body fallback, and body text does not parse Markdown or HTML. Prose internals target unclassed paragraph and list markup without crossing into classed child component boundaries.',
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
          'Plain escaped fallback text rendered only when no children snippet is provided. Blank values silently render no DOM.',
      },
      class: {
        control: false,
        description:
          'Optional root div class hook; existing broader div attributes also forward to the root.',
      },
    },
  });
</script>

<style>
  .rich-text-block-story {
    inline-size: 100%;
    padding-block: var(--space-section-block-sm);
  }

  .rich-text-block-story__rail {
    inline-size: 100%;
  }

  .rich-text-block-story__absence-check {
    min-block-size: var(--space-1200);
    padding: var(--space-300);
    border: 1px dashed var(--color-outline);
  }

  .rich-text-block-story__absence-label {
    margin: 0 0 var(--space-300);
    color: var(--color-on-surface-variant);
  }

  :global(.rich-text-block-story__custom-child) {
    display: grid;
    gap: var(--space-200);
    inline-size: 100%;
    max-inline-size: 32rem;
    padding: var(--space-400);
    border: 1px solid var(--color-outline-variant);
    border-radius: var(--radius-sm);
    background: var(--color-surface-container-low);
  }

  :global(.rich-text-block-story__custom-child p),
  :global(.rich-text-block-story__custom-child ul) {
    margin: 0;
  }

  :global(.rich-text-block-story__custom-child ul) {
    padding-inline-start: var(--space-600);
  }

  :global(.rich-text-block-story__custom-child a) {
    color: var(--color-on-surface);
    text-decoration: underline;
  }

  :global(.rich-text-block-story__custom-list-item) {
    display: grid;
    gap: var(--space-200);
    inline-size: 100%;
    max-inline-size: 32rem;
    padding: var(--space-400);
    border: 1px solid var(--color-outline-variant);
    border-radius: var(--radius-sm);
    background: var(--color-surface-container-low);
    list-style: none;
  }

  :global(.rich-text-block-story__custom-list-item p),
  :global(.rich-text-block-story__custom-list-item ul) {
    margin: 0;
  }

  :global(.rich-text-block-story__custom-list-item ul) {
    padding-inline-start: var(--space-600);
  }

  :global(.rich-text-block-story__custom-list-item a) {
    color: var(--color-on-surface);
    text-decoration: underline;
  }

  :global(.rich-text-block-story__empty-wrapper),
  :global(.rich-text-block-story__forwarded) {
    outline: 1px dashed var(--color-outline);
    outline-offset: var(--space-100);
  }

  :global(.rich-text-block-story__empty-wrapper) {
    min-block-size: var(--space-800);
  }
</style>

<Story name="Plain Body">
  {#snippet template(args)}
    <div class="rich-text-block-story">
      <div class="rail rail--md rail--padded rich-text-block-story__rail">
        <RichTextBlock {...args} />
      </div>
    </div>
  {/snippet}
</Story>

<Story name="Rich Paragraphs" args={{ body: '' }}>
  {#snippet template(args)}
    <div class="rich-text-block-story">
      <div class="rail rail--md rail--padded rich-text-block-story__rail">
        <RichTextBlock {...args}>
          <p>
            Already-rendered prose can include paragraphs with
            <a href="https://invisiblesloth.com/">bare inline links</a>.
          </p>
          <p>
            The component supplies responsive type, local rhythm, and wrapping behavior.
          </p>
        </RichTextBlock>
      </div>
    </div>
  {/snippet}
</Story>

<Story name="Unclassed Lists" args={{ body: '' }}>
  {#snippet template(args)}
    <div class="rich-text-block-story">
      <div class="rail rail--md rail--padded rich-text-block-story__rail">
        <RichTextBlock {...args}>
          <ul>
            <li>Unordered list item one</li>
            <li>Item two demonstrates wrapping inside the prose rail.</li>
            <li>List item three</li>
          </ul>
          <ol>
            <li>Ordered list item one</li>
            <li>Ordered list item two</li>
            <li>Ordered list item three</li>
          </ol>
        </RichTextBlock>
      </div>
    </div>
  {/snippet}
</Story>

<Story name="Nested Unclassed Lists" args={{ body: '' }}>
  {#snippet template(args)}
    <div class="rich-text-block-story">
      <div class="rail rail--md rail--padded rich-text-block-story__rail">
        <RichTextBlock {...args}>
          <ul>
            <li>
              <p>Top-level list items can arrive wrapped in paragraphs.</p>
              <ul>
                <li>Nested list items use tighter prose rhythm.</li>
                <li>
                  <p>Nested paragraph wrappers avoid double spacing.</p>
                  <ol>
                    <li>Third-level ordered lists keep a distinct marker.</li>
                  </ol>
                </li>
              </ul>
            </li>
            <li>
              <p>Multiple paragraphs inside a list item keep local rhythm.</p>
              <p>The next paragraph stays tighter than top-level body rhythm.</p>
            </li>
          </ul>
        </RichTextBlock>
      </div>
    </div>
  {/snippet}
</Story>

<Story name="List Item Links" args={{ body: '' }}>
  {#snippet template(args)}
    <div class="rich-text-block-story">
      <div class="rail rail--md rail--padded rich-text-block-story__rail">
        <RichTextBlock {...args}>
          <ul>
            <li>
              Direct list item links such as
              <a href="https://invisiblesloth.com/support">support resources</a>
              receive the prose link treatment.
            </li>
            <li>
              <p>
                Paragraph-wrapped list item links such as
                <a href="https://invisiblesloth.com/tracer">product details</a>
                are covered too.
              </p>
              <ul>
                <li>
                  Nested direct links such as
                  <a href="https://invisiblesloth.com/tracer/privacy">privacy details</a>
                  stay in scope.
                </li>
                <li>
                  <p>
                    Nested paragraph links such as
                    <a href="https://invisiblesloth.com/tracer/terms">terms details</a>
                    stay in scope.
                  </p>
                </li>
              </ul>
            </li>
          </ul>
        </RichTextBlock>
      </div>
    </div>
  {/snippet}
</Story>

<Story name="Long Bare Url Anchor" args={{ body: '' }}>
  {#snippet template(args)}
    <div class="rich-text-block-story">
      <div class="rail rail--md rail--padded rich-text-block-story__rail">
        <RichTextBlock {...args}>
          <p>
            A bare anchor with a long URL should wrap without overflowing:
            <a href={longBareUrl}>{longBareUrl}</a>
          </p>
        </RichTextBlock>
      </div>
    </div>
  {/snippet}
</Story>

<Story name="Classed Custom Child Boundary" args={{ body: '' }}>
  {#snippet template(args)}
    <div class="rich-text-block-story">
      <div class="rail rail--md rail--padded rich-text-block-story__rail">
        <RichTextBlock {...args}>
          <p>Top-level unclassed prose still receives prose styling.</p>
          <div class="rich-text-block-story__custom-child">
            <p>
              This classed child owns its own unclassed
              <a href="https://invisiblesloth.com/">internal link</a>.
            </p>
            <ul>
              <li>Its internal unclassed list should not receive rich-text list styling.</li>
              <li>Its boundary keeps child component content independent.</li>
            </ul>
          </div>
          <p>The next top-level paragraph resumes the prose rhythm.</p>
        </RichTextBlock>
      </div>
    </div>
  {/snippet}
</Story>

<Story name="Nested Custom Child Boundary" args={{ body: '' }}>
  {#snippet template(args)}
    <div class="rich-text-block-story">
      <div class="rail rail--md rail--padded rich-text-block-story__rail">
        <RichTextBlock {...args}>
          <ul>
            <li>
              <p>Unclassed list prose keeps its marker, rhythm, and link treatment.</p>
              <div class="rich-text-block-story__custom-child">
                <p>
                  This nested classed child owns an unclassed
                  <a href="https://invisiblesloth.com/">internal link</a>.
                </p>
                <ul>
                  <li>Its internal unclassed list should not receive rich-text list styling.</li>
                  <li>Selectors should stop at this classed child boundary.</li>
                </ul>
              </div>
            </li>
            <li>
              <p>
                Later prose list links such as
                <a href="https://invisiblesloth.com/support">support details</a>
                still stay in scope.
              </p>
            </li>
          </ul>
        </RichTextBlock>
      </div>
    </div>
  {/snippet}
</Story>

<Story name="Classed List Item Boundary" args={{ body: '' }}>
  {#snippet template(args)}
    <div class="rich-text-block-story">
      <div class="rail rail--md rail--padded rich-text-block-story__rail">
        <RichTextBlock {...args}>
          <ul>
            <li class="rich-text-block-story__custom-list-item">
              <p>
                This classed list-item child owns an unclassed
                <a href="https://invisiblesloth.com/">internal link</a>.
              </p>
              <ul>
                <li>Its internal unclassed list should not receive rich-text list styling.</li>
              </ul>
            </li>
            <li>
              <p>
                Normal prose list links such as
                <a href="https://invisiblesloth.com/support">support details</a>
                still stay in scope.
              </p>
            </li>
          </ul>
        </RichTextBlock>
      </div>
    </div>
  {/snippet}
</Story>

<Story name="Empty Child Wrapper" args={{ body: '' }}>
  {#snippet template(args)}
    <div class="rich-text-block-story">
      <div class="rail rail--md rail--padded rich-text-block-story__rail">
        <RichTextBlock {...args} class="rich-text-block-story__empty-wrapper">
          {#if false}
            <p>This paragraph should not render.</p>
          {/if}
        </RichTextBlock>
      </div>
    </div>
  {/snippet}
</Story>

<Story
  name="Blank Body (No DOM)"
  args={{
    body: blankRuntimeBody,
  }}
>
  {#snippet template(args)}
    <div class="rich-text-block-story__absence-check" data-case="blank-body">
      <p class="rich-text-block-story__absence-label text-label-large">
        Absence check: no RichTextBlock DOM should render below.
      </p>
      <RichTextBlock {...args} />
    </div>
  {/snippet}
</Story>

<Story
  name="Malformed Body (No DOM)"
  args={{
    body: malformedRuntimeBody,
  }}
>
  {#snippet template(args)}
    <div class="rich-text-block-story__absence-check" data-case="malformed-body">
      <p class="rich-text-block-story__absence-label text-label-large">
        Absence check: no RichTextBlock DOM should render below.
      </p>
      <RichTextBlock {...args} />
    </div>
  {/snippet}
</Story>

<Story
  name="Ignored Malformed Body With Children"
  args={{
    body: malformedRuntimeBody,
  }}
>
  {#snippet template(args)}
    <div class="rich-text-block-story">
      <div class="rail rail--md rail--padded rich-text-block-story__rail">
        <RichTextBlock {...args}>
          <p>Children win over malformed fallback body data without warning.</p>
        </RichTextBlock>
      </div>
    </div>
  {/snippet}
</Story>

<Story
  name="Forwarded Attributes"
  args={{
    body: plainBody,
  }}
>
  {#snippet template(args)}
    <div class="rich-text-block-story">
      <div class="rail rail--md rail--padded rich-text-block-story__rail">
        <RichTextBlock
          {...args}
          id="rich-text-block-forwarded-root"
          role="group"
          aria-label="Forwarded attributes root rich text block"
          data-story-root="rich-text-block"
          title="Native div title"
          class="rich-text-block-story__forwarded"
        />
      </div>
    </div>
  {/snippet}
</Story>
