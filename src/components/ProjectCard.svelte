<script lang="ts">
  /**
   * ProjectCard component for displaying project information
   *
   * Featured project card with badges, name, subhead, slotted description, and CTA button.
   * Card width and component-scoped typography respond to viewport size for optimal readability.
   *
   * Responsive behavior:
   * - Compact (0-631px): 398px width, smaller typography
   * - Medium (632-1014px): 616px width, smaller typography
   * - Extended (1015px+): 832px width, larger typography
   *
   * @prop {string} title - Project name/title
   * @prop {string} subhead - Project subheading
   * @prop {string} description - Plain text fallback when no rich description slot is provided
   * @prop {ProjectButton} button - Optional link CTA
   * @prop {Array} badges - Array of badge objects with variant and label
   * @prop {Snippet} children - Rich description content, usually rendered from Astro Markdown
   */
  import type { Snippet } from 'svelte';
  import Button from './Button.svelte';
  import BadgeGroup from './BadgeGroup.svelte';
  import Badge from './Badge.svelte';
  import type { ProjectBadge, ProjectBadgeVariant, ProjectButton } from '../types/project';

  const BADGE_PRESET_LABELS: Record<ProjectBadgeVariant, string> = {
    default: 'Badge',
    boardgame: 'Boardgame',
    playdate: 'Playdate',
    apple: 'Apple Platforms',
    error: 'Error',
    web: 'Web',
  };

  const normalizeBadge = (badge: ProjectBadge) => {
    const variant = badge.variant ?? 'default';
    const label = badge.label ?? BADGE_PRESET_LABELS[variant] ?? BADGE_PRESET_LABELS.default;

    return { variant, label };
  };

  let {
    title = 'Project Name',
    subhead,
    description,
    badges = [],
    button,
    children,
  }: {
    title?: string;
    subhead?: string;
    description?: string;
    badges?: ProjectBadge[];
    button?: ProjectButton;
    children?: Snippet;
  } = $props();

  const badgeList = $derived(badges.map(normalizeBadge));
  const hasBadges = $derived(badgeList.length > 0);
  const fallbackDescription = $derived(description?.trim());
</script>

<div class="project-card">
  {#if hasBadges}
    <BadgeGroup>
      {#each badgeList as badge}
        <Badge variant={badge.variant} label={badge.label} />
      {/each}
    </BadgeGroup>
  {/if}

  <div class="project-card__content">
    <h2 class="project-card__title text-display-extra-small">{title}</h2>
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
      hasTrailingIcon={button.hasTrailingIcon}
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
