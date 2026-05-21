<script lang="ts">
  /**
   * ProjectCard component for displaying project information
   *
   * Featured project card with badges, name, subhead, slotted description, and CTA button.
   * Component-scoped typography responds to viewport size for optimal readability.
   *
   * Responsive behavior:
   * - Compact and medium viewports use the base card typography.
   * - Extended viewports use larger card-specific typography.
   * Outer width and rail behavior belong to the parent layout/surface.
   *
   * @prop {string} title - Project name/title
   * @prop {string} subhead - Project subheading
   * @prop {string} description - Plain text fallback when no rich description slot is provided
   * @prop {number} headingLevel - Semantic title heading level, from 1 to 6
   * @prop {ProjectButton} button - Optional link CTA
   * @prop {Array} badges - Array of badge objects with variant and label
   * @prop {Snippet} children - Rich description content, usually rendered from Astro Markdown
   */
  import type { Snippet } from 'svelte';
  import Button from './Button.svelte';
  import BadgeGroup from './BadgeGroup.svelte';
  import Badge from './Badge.svelte';
  import ExternalLink from '../icons/ExternalLink.svelte';
  import { isExternalAbsoluteHttpUrl } from '../lib/siteLinks';
  import type { ProjectBadge, ProjectButton } from '../types/project';

  type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;
  type HeadingTag = `h${HeadingLevel}`;

  const VALID_HEADING_LEVELS = new Set([1, 2, 3, 4, 5, 6]);

  let {
    title = 'Project Name',
    subhead,
    description,
    headingLevel = 2,
    badges = [],
    button,
    children,
  }: {
    title?: string;
    subhead?: string;
    description?: string;
    headingLevel?: HeadingLevel;
    badges?: ProjectBadge[];
    button?: ProjectButton;
    children?: Snippet;
  } = $props();

  function normalizeHeadingLevel(value: unknown): HeadingLevel {
    return typeof value === 'number' && VALID_HEADING_LEVELS.has(value)
      ? (value as HeadingLevel)
      : 2;
  }

  const hasBadges = $derived(badges.length > 0);
  const fallbackDescription = $derived(description?.trim());
  const resolvedHeadingLevel = $derived(normalizeHeadingLevel(headingLevel));
  const headingTag = $derived(`h${resolvedHeadingLevel}` as HeadingTag);
  const showsExternalCtaIcon = $derived(Boolean(button && isExternalAbsoluteHttpUrl(button.href)));
</script>

{#snippet externalLinkIcon()}
  <ExternalLink />
{/snippet}

<div class="project-card">
  {#if hasBadges}
    <div class="project-card__badge-group">
      <BadgeGroup>
        {#each badges as badge}
          <Badge variant={badge.variant} label={badge.label} />
        {/each}
      </BadgeGroup>
    </div>
  {/if}

  <div class="project-card__content">
    <svelte:element this={headingTag} class="project-card__title text-display-extra-small">
      {title}
    </svelte:element>
    {#if subhead}
      <p class="project-card__subhead text-headline-small">{subhead}</p>
    {/if}
    {#if children}
      <div class="project-card__description text-body-medium">
        {@render children()}
      </div>
    {:else if fallbackDescription}
      <p class="project-card__description text-body-medium">{fallbackDescription}</p>
    {/if}
  </div>

  {#if button}
    <Button
      variant="filled-secondary"
      label={button.label}
      href={button.href}
      target={button.target}
      rel={button.rel}
      trailingIcon={showsExternalCtaIcon ? externalLinkIcon : undefined}
    />
  {/if}
</div>

<style>
  .project-card {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-gutter);
    width: 100%;
  }

  .project-card__badge-group {
    padding-block-end: var(--space-200);
  }

  .project-card__content {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-gutter-tight);
    width: 100%;
    color: var(--color-on-surface);
  }

  .project-card__title {
    margin: 0;
    width: 100%;
  }

  /* Card-specific h2 treatment; page/section heading scale remains in .heading-h*. */
  @media (min-width: 1015px) {
    .project-card__title {
      font-family: var(--typography-display-small-family);
      font-size: var(--typography-display-small-size);
      font-weight: var(--typography-display-small-weight);
      line-height: var(--typography-display-small-line-height);
      letter-spacing: var(--typography-display-small-letter-spacing);
    }
  }

  .project-card__subhead {
    margin: 0;
    width: 100%;
  }

  /* Card-specific subhead treatment. */
  @media (min-width: 1015px) {
    .project-card__subhead {
      font-family: var(--typography-headline-medium-family);
      font-size: var(--typography-headline-medium-size);
      font-weight: var(--typography-headline-medium-weight);
      line-height: var(--typography-headline-medium-line-height);
      letter-spacing: var(--typography-headline-medium-letter-spacing);
    }
  }

  .project-card__description {
    display: grid;
    gap: var(--space-gutter-tight);
    margin: 0;
    width: 100%;
  }

  .project-card__description :global(:where(p, ul, ol, blockquote)) {
    margin-block: 0;
  }

  /* Card-specific description treatment. */
  @media (min-width: 1015px) {
    .project-card__description {
      font-family: var(--typography-body-large-family);
      font-size: var(--typography-body-large-size);
      font-weight: var(--typography-body-large-weight);
      line-height: var(--typography-body-large-line-height);
      letter-spacing: var(--typography-body-large-letter-spacing);
    }
  }
</style>
