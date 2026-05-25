<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import ContentSection from '../components/ContentSection.svelte';

  const headingLevelOptions = ['h2', 'h3', 'h4', 'h5', 'h6'] as const;
  // Exercises ContentSection's runtime guards for non-typed callers.
  const invalidRuntimeHeadingLevel = 'h1' as unknown as (typeof headingLevelOptions)[number];
  const invalidRuntimeVisualLevel = 'display-large' as unknown as (typeof headingLevelOptions)[number];

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
            'Below-page content section with responsive body typography. Attributes forward to the root section; parent compositions own rails, placement, and section spacing.',
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
        description: 'Required non-empty visible section heading.',
      },
      body: {
        control: 'text',
        description: 'Plain-text fallback rendered only when no children snippet is provided.',
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
    },
  });
</script>

<style>
  .content-section-story {
    inline-size: 100%;
    padding-block: var(--space-section-block-sm);
  }

  .content-section-story__rail {
    inline-size: 100%;
  }

  :global(.content-section-story__forwarded) {
    /* Marker class for root-attribute forwarding coverage. */
  }
</style>

<Story name="Rich Content">
  {#snippet template(args)}
    <div class="content-section-story">
      <div class="rail rail--md rail--padded content-section-story__rail">
        <ContentSection {...args}>
          <p>
            Rich section content can include semantic paragraphs,
            <a class="text-link" href="https://invisiblesloth.com/">inline links</a>,
            and emphasized text.
          </p>
          <p>
            The body wrapper owns responsive paragraph typography while callers keep normal
            authoring semantics.
          </p>
          <ul>
            <li>List items use the tight body line-height from the design tokens.</li>
            <li>Marker spacing and indentation are owned by the section body.</li>
          </ul>
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
