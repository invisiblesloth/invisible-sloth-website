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

  {#if hasBodyContent}
    <div class="content-section__body text-body-responsive">
      {#if children}
        {@render children()}
      {:else}
        <p class="content-section__body-fallback">{normalizedBody}</p>
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

  .content-section__body > :global(*) {
    min-inline-size: 0;
  }

  .content-section__body > :global(:where(p, ul, ol)) {
    margin-block: 0;
    overflow-wrap: break-word;
  }

  .content-section__body > :global(* + *) {
    margin-block-start: var(--space-gutter);
  }

  .content-section__body-fallback {
    overflow-wrap: anywhere;
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

  .content-section__body > :global(:where(ul, ol) li + li) {
    margin-block-start: var(--space-400);
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

  .content-section__body > :global(p a:not([class])),
  .content-section__body > :global(:where(ul, ol) a:not([class])) {
    position: relative;
    display: inline-block;
    max-inline-size: 100%;
    padding: 1px 6px;
    margin: -1px -6px;
    border-radius: var(--radius-full);
    color: currentcolor;
    font-weight: var(--font-weight-medium);
    text-decoration-line: underline;
    text-decoration-style: solid;
    text-decoration-color: var(--text-link-underline, var(--color-link-underline-on-surface));
    text-decoration-thickness: 0.12em;
    text-decoration-skip-ink: none;
    text-underline-offset: 0.125em;
    outline: var(--focus-outline-width) solid transparent;
    outline-offset: 0.125em;
    overflow-wrap: anywhere;
    transition: transform var(--animation-duration-extra-fast) var(--animation-easing-standard);
    vertical-align: baseline;
    will-change: transform;
    -webkit-tap-highlight-color: transparent;
  }

  .content-section__body > :global(p a:not([class]):focus-visible),
  .content-section__body > :global(:where(ul, ol) a:not([class]):focus-visible) {
    outline-color: var(--color-focus);
    text-decoration: none;
    transform: translate(0, 0);
  }

  @media (hover: hover) and (pointer: fine) {
    .content-section__body > :global(p a:not([class]):where(:hover):not(:focus-visible)),
    .content-section__body
      > :global(:where(ul, ol) a:not([class]):where(:hover):not(:focus-visible)) {
      text-decoration-color: currentcolor;
    }

    .content-section__body > :global(p a:not([class]):where(:active):not(:focus-visible)),
    .content-section__body
      > :global(:where(ul, ol) a:not([class]):where(:active):not(:focus-visible)) {
      text-decoration-color: currentcolor;
      transform: translateY(1px);
    }
  }

  @media (hover: none) and (pointer: coarse) {
    .content-section__body > :global(p a:not([class])),
    .content-section__body > :global(:where(ul, ol) a:not([class])) {
      text-decoration-color: currentcolor;
    }

    .content-section__body > :global(p a:not([class]):active:not(:focus-visible)),
    .content-section__body > :global(:where(ul, ol) a:not([class]):active:not(:focus-visible)) {
      transform: translateY(1px);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .content-section__body > :global(p a:not([class])),
    .content-section__body > :global(:where(ul, ol) a:not([class])),
    .content-section__body > :global(p a:not([class]):where(:hover, :active, :focus-visible)),
    .content-section__body
      > :global(:where(ul, ol) a:not([class]):where(:hover, :active, :focus-visible)) {
      transition: none;
      transform: none;
    }
  }

  @media (min-width: 1015px) {
    .content-section__body > :global(:where(ul, ol) li) {
      line-height: var(--typography-body-large-line-height-tight);
    }
  }
</style>
