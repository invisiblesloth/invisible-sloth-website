<!--
/**
 * ContentSection
 *
 * Reusable below-page content section with responsive heading and body typography.
 * Parent composition owns page rails, placement, and section spacing.
 *
 * Forwarded section attributes land on the root <section>. The heading and
 * body wrappers intentionally receive only component-owned attributes.
 *
 * @prop {string} heading - Required visible section heading text
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
  import { warnOnce } from '../lib/devWarnings';
  import Heading from './Heading.svelte';

  const SECTION_HEADING_LEVELS = ['h2', 'h3', 'h4', 'h5', 'h6'] as const;

  type SectionHeadingLevel = 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
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

  const validatedHeading = $derived.by(() => {
    if (String(heading ?? '').trim().length === 0) {
      throw new Error('ContentSection requires a non-empty heading.');
    }

    return heading;
  });

  const normalizedBody = $derived(String(body ?? '').trim());
  const normalizedHeadingLevel = $derived(
    normalizeSectionHeadingLevel(headingLevel, 'h2')
  );
  const resolvedVisualLevel = $derived(
    visualLevel === undefined
      ? normalizedHeadingLevel
      : normalizeSectionHeadingLevel(visualLevel, normalizedHeadingLevel)
  );
  const hasBodyContent = $derived(Boolean(children) || normalizedBody.length > 0);
  const contentSectionClasses = $derived(
    ['content-section', className].filter(Boolean).join(' ')
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
    text={validatedHeading}
  />

  {#if hasBodyContent}
    <div class="content-section__body text-body-responsive">
      {#if children}
        {@render children()}
      {:else}
        <p>{normalizedBody}</p>
      {/if}
    </div>
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

  .content-section__body {
    overflow-wrap: break-word;
  }

  .content-section__body > :global(:where(p, ul, ol, blockquote)) {
    margin-block: 0;
    overflow-wrap: break-word;
  }

  .content-section__body
    > :global(:where(p, ul, ol, blockquote) + :where(p, ul, ol, blockquote)) {
    margin-block-start: var(--space-gutter-tight);
  }

  .content-section__body > :global(:where(ul, ol)) {
    list-style-position: outside;
    padding-inline-start: var(--space-600);
  }

  .content-section__body > :global(ul) {
    list-style-type: disc;
  }

  .content-section__body > :global(ol) {
    list-style-type: decimal;
  }

  .content-section__body > :global(:where(ul, ol) li) {
    line-height: var(--typography-body-medium-line-height-tight);
    padding-inline-start: var(--space-100);
    overflow-wrap: break-word;
  }

  .content-section__body > :global(:where(ul, ol) li::marker) {
    color: currentcolor;
  }

  .content-section__body > :global(:where(ul, ol) li > p) {
    margin-block: 0;
    overflow-wrap: break-word;
  }

  .content-section__body > :global(:where(ul, ol) li > p + p) {
    margin-block-start: var(--space-200);
  }

  .content-section__body > :global(:where(ul, ol) li > :where(ul, ol)) {
    margin-block-start: var(--space-200);
    padding-inline-start: var(--space-600);
  }

  .content-section__body > :global(:where(ul, ol) li > ul) {
    list-style-type: circle;
  }

  .content-section__body > :global(:where(ul, ol) li > ol) {
    list-style-type: lower-alpha;
  }

  .content-section__body > :global(:where(ul, ol) li > :where(ul, ol) li > ul) {
    list-style-type: square;
  }

  .content-section__body > :global(:where(ul, ol) li > :where(ul, ol) li > ol) {
    list-style-type: lower-roman;
  }

  .content-section__body > :global(:where(ul, ol) li > p + :where(ul, ol)) {
    margin-block-start: var(--space-200);
  }

  @media (min-width: 1015px) {
    .content-section__body > :global(:where(ul, ol) li) {
      line-height: var(--typography-body-large-line-height-tight);
    }
  }
</style>
