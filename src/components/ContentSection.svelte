<!--
/**
 * ContentSection
 *
 * Reusable below-page content section with responsive heading and body content.
 * Parent composition owns page rails, placement, and section spacing. RichTextBlock
 * owns prose-shaped body styling; structured children own their own typography,
 * spacing, and semantics.
 *
 * Forwarded section attributes land on the root <section>. The heading and
 * body wrappers intentionally receive only component-owned attributes.
 * Existing broader root forwarding is part of the public root-hook contract.
 *
 * @prop {string} heading - Required visible section heading text, trimmed at the boundary
 * @prop {string} body - Optional plain-text fallback when no children snippet is provided
 * @prop {string} headingLevel - Semantic section heading level, h2-h6
 * @prop {string} visualLevel - Optional visual heading scale, h2-h6
 * @prop {string} bodyMode - How children are wrapped: prose or structured; does not affect body fallback rendering
 * @prop {Snippet} children - Optional body content; wins over body when provided
 * @prop {string} class - Additional classes merged onto the root section
 */
-->
<script module lang="ts">
  import type { Snippet } from 'svelte';
  import type { SvelteHTMLElements } from 'svelte/elements';

  const SECTION_HEADING_LEVELS = ['h2', 'h3', 'h4', 'h5', 'h6'] as const;
  const SECTION_BODY_MODES = ['prose', 'structured'] as const;

  type SectionHeadingLevel = (typeof SECTION_HEADING_LEVELS)[number];
  type SectionBodyMode = (typeof SECTION_BODY_MODES)[number];
  type SectionAttributes = Omit<SvelteHTMLElements['section'], 'children' | 'class'>;

  export type ContentSectionProps = SectionAttributes & {
    heading: string;
    body?: string;
    headingLevel?: SectionHeadingLevel;
    visualLevel?: SectionHeadingLevel;
    bodyMode?: SectionBodyMode;
    children?: Snippet;
    class?: string;
  };
</script>

<script lang="ts">
  import { requireNonEmptyString } from '../lib/componentValidation';
  import { warnOnce } from '../lib/devWarnings';
  import Heading from './Heading.svelte';
  import RichTextBlock from './RichTextBlock.svelte';

  const DEFAULT_SECTION_BODY_MODE: SectionBodyMode = 'prose';
  const VALID_SECTION_HEADING_LEVELS = new Set<unknown>(SECTION_HEADING_LEVELS);
  const VALID_SECTION_BODY_MODES = new Set<unknown>(SECTION_BODY_MODES);

  let {
    heading,
    body = '',
    headingLevel = 'h2',
    visualLevel,
    bodyMode = DEFAULT_SECTION_BODY_MODE,
    children,
    class: className = '',
    ...restProps
  }: ContentSectionProps = $props();

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
  const normalizedBodyMode = $derived(normalizeSectionBodyMode(bodyMode));
  const hasInvalidBodyMode = $derived(bodyMode !== normalizedBodyMode);
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

  function normalizeSectionBodyMode(value: unknown): SectionBodyMode {
    return VALID_SECTION_BODY_MODES.has(value)
      ? (value as SectionBodyMode)
      : DEFAULT_SECTION_BODY_MODE;
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

    if (hasInvalidBodyMode) {
      warnOnce(
        'content-section:invalid-body-mode',
        '[ContentSection] `bodyMode` must be either prose or structured. Falling back to prose.'
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
    {#if normalizedBodyMode === 'structured'}
      <div class="content-section__body">
        {@render children()}
      </div>
    {:else}
      <RichTextBlock class="content-section__body">
        {@render children()}
      </RichTextBlock>
    {/if}
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
