<!--
/**
 * ContentSection
 *
 * Reusable below-page content section with responsive heading and prose body.
 * Parent composition owns page rails, placement, and section spacing. RichTextBlock
 * owns already-rendered prose-shaped body styling.
 *
 * Forwarded section attributes land on the root <section>. The heading and
 * body wrappers intentionally receive only component-owned attributes.
 * Existing broader root forwarding is part of the public root-hook contract.
 *
 * @prop {string} heading - Required visible section heading text, trimmed at the boundary
 * @prop {string} body - Optional plain-text fallback when no children snippet is provided
 * @prop {string} headingLevel - Semantic section heading level, h2-h6
 * @prop {string} visualLevel - Optional visual heading scale, h2-h6
 * @prop {Snippet} children - Optional rich body content; wins over body when provided
 * @prop {string} class - Additional classes merged onto the root section
 */
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { SvelteHTMLElements } from 'svelte/elements';
  import { requireNonEmptyString } from '../lib/componentValidation';
  import { warnOnce } from '../lib/devWarnings';
  import Heading from './Heading.svelte';
  import RichTextBlock from './RichTextBlock.svelte';

  const SECTION_HEADING_LEVELS = ['h2', 'h3', 'h4', 'h5', 'h6'] as const;

  type SectionHeadingLevel = (typeof SECTION_HEADING_LEVELS)[number];
  type SectionAttributes = Omit<SvelteHTMLElements['section'], 'children' | 'class'>;
  const VALID_SECTION_HEADING_LEVELS = new Set<unknown>(SECTION_HEADING_LEVELS);

  type Props = SectionAttributes & {
    heading: string;
    body?: string;
    headingLevel?: SectionHeadingLevel;
    visualLevel?: SectionHeadingLevel;
    children?: Snippet;
    class?: string;
  };

  let {
    heading,
    body = '',
    headingLevel = 'h2',
    visualLevel,
    children,
    class: className = '',
    ...restProps
  }: Props = $props();

  const normalizedHeading = $derived(
    requireNonEmptyString(heading, { componentName: 'ContentSection', propName: 'heading' })
  );

  const normalizedHeadingLevel = $derived(
    normalizeSectionHeadingLevel(headingLevel, 'h2')
  );
  const resolvedVisualLevel = $derived(
    visualLevel === undefined
      ? normalizedHeadingLevel
      : normalizeSectionHeadingLevel(visualLevel, normalizedHeadingLevel)
  );
  const normalizedClassName = $derived(String(className ?? '').trim());
  const contentSectionClasses = $derived(
    ['content-section', normalizedClassName].filter(Boolean).join(' ')
  );

  function normalizeSectionHeadingLevel(
    value: unknown,
    fallback: SectionHeadingLevel
  ): SectionHeadingLevel {
    return VALID_SECTION_HEADING_LEVELS.has(value) ? (value as SectionHeadingLevel) : fallback;
  }

  $effect(() => {
    if (!VALID_SECTION_HEADING_LEVELS.has(headingLevel)) {
      warnOnce(
        'content-section:invalid-heading-level',
        '[ContentSection] `headingLevel` must be one of h2, h3, h4, h5, h6. Falling back to h2.'
      );
    }

    if (visualLevel !== undefined && !VALID_SECTION_HEADING_LEVELS.has(visualLevel)) {
      warnOnce(
        'content-section:invalid-visual-level',
        '[ContentSection] `visualLevel` must be one of h2, h3, h4, h5, h6. Falling back to the resolved heading level.'
      );
    }
  });
</script>

<section {...restProps} class={contentSectionClasses}>
  <Heading
    class="content-section__heading"
    level={normalizedHeadingLevel}
    visualLevel={resolvedVisualLevel}
    text={normalizedHeading}
  />

  {#if children}
    <RichTextBlock class="content-section__body">
      {@render children()}
    </RichTextBlock>
  {:else}
    <RichTextBlock {body} class="content-section__body" />
  {/if}
</section>

<style>
  .content-section {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-gutter);
    inline-size: 100%;
    color: inherit;
  }

  .content-section__heading,
  .content-section__body {
    inline-size: 100%;
    min-inline-size: 0;
  }
</style>
