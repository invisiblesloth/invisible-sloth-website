<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import ContentSection from '../components/ContentSection.svelte';

  const headingLevelOptions = ['h2', 'h3', 'h4', 'h5', 'h6'] as const;
  // Exercises ContentSection's runtime guards for non-typed callers.
  const invalidRuntimeHeadingLevel = 'h1' as unknown as (typeof headingLevelOptions)[number];
  const invalidRuntimeVisualLevel = 'display-large' as unknown as (typeof headingLevelOptions)[number];
  const malformedRuntimeBody = {
    body: 'This object should be ignored as malformed runtime input.',
  } as unknown as string;
  const richContentHtml = `
    <p>
      In the heart of the digital jungle, semantic body copy can include
      <a href="https://invisiblesloth.com/">bare Markdown-style links</a>
      while keeping normal responsive paragraph line-height.
    </p>
    <ul>
      <li>Unordered list item one</li>
      <li>Item 2 is long enough to demonstrate wrapping inside the section body.</li>
      <li>List item number 3</li>
    </ul>
    <ol>
      <li>Ordered list item one</li>
      <li>Item 2 is long enough to demonstrate wrapping inside the section body.</li>
      <li>List item number 3</li>
    </ol>
  `;
  const longBareUrl =
    'https://invisiblesloth.com/support/articles/SuperLongUnbrokenSupportReferenceThatShouldWrapInsideTheContentSectionAtCompactWidths';
  const longBareUrlAnchorHtml = `
    <p>
      A bare anchor with a long URL should wrap without overflowing:
      <a href="${longBareUrl}">${longBareUrl}</a>
    </p>
  `;

  const { Story } = defineMeta({
    title: 'Molecules/ContentSection',
    component: ContentSection,
    tags: ['autodocs'],
    parameters: {
      controls: {
        include: ['heading', 'body', 'headingLevel', 'visualLevel'],
      },
      docs: {
        description: {
          component:
            'Below-page content section with responsive prose body styling delegated to RichTextBlock. `heading` is required, trimmed at the boundary, and fails fast when blank; blanking the required control may break the story canvas. Existing broader root forwarding is public: section attributes land on the root section, while parent compositions own rails, placement, and section spacing.',
        },
      },
    },
    args: {
      heading: 'Content section heading',
      body: 'Body copy uses responsive typography: Body Medium below the Extended breakpoint and Body Large at 1015px and wider.',
      headingLevel: 'h2',
    },
    argTypes: {
      heading: {
        control: 'text',
        description: 'Required non-empty visible section heading, trimmed at the boundary.',
      },
      body: {
        control: 'text',
        description: 'Plain escaped fallback rendered only when no children snippet is provided.',
      },
      headingLevel: {
        control: { type: 'select' },
        options: headingLevelOptions,
        description: 'Semantic heading level. H1 is intentionally excluded.',
      },
      visualLevel: {
        control: { type: 'select' },
        options: headingLevelOptions,
        description: 'Optional visual heading scale. Defaults to headingLevel.',
      },
      class: {
        control: false,
        description:
          'Optional root section class hook; existing broader section attributes also forward to the root.',
      },
    },
  });
</script>

<style>
  :global(.content-section-story) {
    inline-size: 100%;
    padding-block: var(--space-section-block-sm);
  }

  :global(.content-section-story__rail) {
    inline-size: 100%;
  }

  :global(.content-section-story__custom-child) {
    display: grid;
    gap: var(--space-200);
    inline-size: 100%;
    max-inline-size: 32rem;
    padding: var(--space-400);
    border: 1px solid var(--color-outline-variant);
    border-radius: var(--radius-sm);
    background: var(--color-surface-container-low);
  }

  :global(.content-section-story__custom-child p) {
    margin: 0;
  }

  :global(.content-section-story__custom-child button) {
    justify-self: start;
    padding: var(--space-100) var(--space-300);
    border: 1px solid var(--color-outline);
    border-radius: var(--radius-full);
    background: var(--color-surface);
    color: var(--color-on-surface);
    font: inherit;
  }

  :global(.content-section-story__forwarded) {
    /* Marker class for root-attribute forwarding coverage. */
  }
</style>

<Story name="Rich Content" args={{ heading: 'Section Title' }}>
  {#snippet template(args)}
    <div class="content-section-story">
      <div class="rail rail--md rail--padded content-section-story__rail">
        <ContentSection {...args}>
          {@html richContentHtml}
        </ContentSection>
      </div>
    </div>
  {/snippet}
</Story>

<Story name="Plain Body">
  {#snippet template(args)}
    <div class="content-section-story">
      <div class="rail rail--md rail--padded content-section-story__rail">
        <ContentSection {...args} />
      </div>
    </div>
  {/snippet}
</Story>

<Story
  name="Slot Overrides Body"
  args={{
    heading: 'Slot content wins',
    body: 'This fallback body should not render while slotted content is present.',
  }}
>
  {#snippet template(args)}
    <div class="content-section-story">
      <div class="rail rail--md rail--padded content-section-story__rail">
        <ContentSection {...args}>
          <p>
            This paragraph comes from the default slot and intentionally replaces the plain
            body fallback.
          </p>
        </ContentSection>
      </div>
    </div>
  {/snippet}
</Story>

<Story
  name="Heading Visual Split"
  args={{
    heading: 'Semantic H3 with H2 visual scale',
    body: 'The section can keep document structure and visual hierarchy separate.',
    headingLevel: 'h3',
    visualLevel: 'h2',
  }}
>
  {#snippet template(args)}
    <div class="content-section-story">
      <div class="rail rail--md rail--padded content-section-story__rail">
        <ContentSection {...args} />
      </div>
    </div>
  {/snippet}
</Story>

<Story
  name="Whitespace Body Omitted"
  args={{
    heading: 'Heading without body copy',
    body: '   ',
  }}
>
  {#snippet template(args)}
    <div class="content-section-story">
      <div class="rail rail--md rail--padded content-section-story__rail">
        <ContentSection {...args} />
      </div>
    </div>
  {/snippet}
</Story>

<Story
  name="Malformed Body Omitted"
  args={{
    heading: 'Heading without usable body copy',
    body: malformedRuntimeBody,
  }}
>
  {#snippet template(args)}
    <div class="content-section-story">
      <div class="rail rail--md rail--padded content-section-story__rail">
        <ContentSection {...args} />
      </div>
    </div>
  {/snippet}
</Story>

<Story
  name="Invalid Heading Level Fallback"
  args={{
    heading: 'Invalid heading level fallback',
    body: 'Malformed heading levels fall back to the supported section heading range.',
    headingLevel: invalidRuntimeHeadingLevel,
    visualLevel: invalidRuntimeVisualLevel,
  }}
>
  {#snippet template(args)}
    <div class="content-section-story">
      <div class="rail rail--md rail--padded content-section-story__rail">
        <ContentSection {...args} />
      </div>
    </div>
  {/snippet}
</Story>

<Story
  name="Ordered List Start And Reversed"
  args={{
    heading: 'Ordered list start and reversed',
  }}
>
  {#snippet template(args)}
    <div class="content-section-story">
      <div class="rail rail--md rail--padded content-section-story__rail">
        <ContentSection {...args}>
          <ol start="4">
            <li>Started ordered item four</li>
            <li>Started ordered item five</li>
          </ol>
          <ol reversed start="3">
            <li>Reversed ordered item three</li>
            <li>Reversed ordered item two</li>
          </ol>
        </ContentSection>
      </div>
    </div>
  {/snippet}
</Story>

<Story
  name="Nested Markdown Lists"
  args={{
    heading: 'Markdown-shaped list content',
  }}
>
  {#snippet template(args)}
    <div class="content-section-story">
      <div class="rail rail--md rail--padded content-section-story__rail">
        <ContentSection {...args}>
          <ul>
            <li>
              <p>Top-level list items often arrive from Markdown wrapped in paragraphs.</p>
              <ul>
                <li>Nested list items keep the tight line-height.</li>
                <li>
                  <p>Nested items can also contain paragraph wrappers without double spacing.</p>
                </li>
              </ul>
            </li>
            <li>
              <p>Multiple paragraphs inside one list item keep local rhythm.</p>
              <p>The next paragraph stays tighter than top-level body rhythm.</p>
            </li>
          </ul>
          <ol>
            <li>
              <p>Ordered lists keep decimal markers after Tailwind preflight.</p>
              <ol>
                <li>Nested ordered lists use a distinct marker style.</li>
              </ol>
            </li>
            <li>Second ordered item keeps the same tight list rhythm.</li>
          </ol>
        </ContentSection>
      </div>
    </div>
  {/snippet}
</Story>

<Story
  name="Long Unbroken Text"
  args={{
    heading: 'Long token wrapping',
    body: 'A long URL-like token should wrap instead of overflowing: https://invisiblesloth.com/support/articles/SuperLongUnbrokenSupportReferenceThatShouldWrapInsideTheContentSectionAtCompactWidths',
  }}
>
  {#snippet template(args)}
    <div class="content-section-story">
      <div class="rail rail--md rail--padded content-section-story__rail">
        <ContentSection {...args} />
      </div>
    </div>
  {/snippet}
</Story>

<Story
  name="Long Bare Url Anchor"
  args={{
    heading: 'Long bare URL anchor wrapping',
  }}
>
  {#snippet template(args)}
    <div class="content-section-story">
      <div class="rail rail--md rail--padded content-section-story__rail">
        <ContentSection {...args}>
          {@html longBareUrlAnchorHtml}
        </ContentSection>
      </div>
    </div>
  {/snippet}
</Story>

<Story
  name="Custom Child Boundary"
  args={{
    heading: 'Custom child boundary',
  }}
>
  {#snippet template(args)}
    <div class="content-section-story">
      <div class="rail rail--md rail--padded content-section-story__rail">
        <ContentSection {...args}>
          <p>
            Direct custom children participate in section spacing without inheriting rich-text
            internals.
          </p>
          <div class="content-section-story__custom-child">
            <p>
              This embedded child owns its own paragraphs and
              <a href="https://invisiblesloth.com/">unclassed internal link</a>.
            </p>
            <button type="button">Child-owned control</button>
          </div>
          <p>The next top-level body block resumes the section rhythm.</p>
        </ContentSection>
      </div>
    </div>
  {/snippet}
</Story>

<Story
  name="Forwarded Attributes"
  args={{
    heading: 'Forwarded root attributes',
    body: 'The marker class and attributes are forwarded to the root section.',
  }}
>
  {#snippet template(args)}
    <div class="content-section-story">
      <div class="rail rail--md rail--padded content-section-story__rail">
        <ContentSection
          {...args}
          id="content-section-forwarded-root"
          aria-label="Forwarded attributes root section"
          data-story-root="content-section"
          title="Native section title"
          class="content-section-story__forwarded"
        />
      </div>
    </div>
  {/snippet}
</Story>
