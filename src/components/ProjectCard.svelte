<script lang="ts">
  /**
   * ProjectCard component for displaying project information
   *
   * Featured project card with badges, name, subhead, description, and CTA button.
   * Card width and typography respond to viewport size for optimal readability.
   *
   * Responsive behavior:
   * - Compact (0-631px): 398px width, smaller typography
   * - Medium (632-1014px): 616px width, smaller typography
   * - Extended (1015px+): 832px width, larger typography
   *
   * @prop {string} title - Project name/title
   * @prop {string} subhead - Project subheading
   * @prop {string} description - Project description text
   * @prop {string} ctaLabel - Call-to-action button text (default: 'Learn More')
   * @prop {string} ctaHref - Optional CTA link
   * @prop {string} ctaTarget - Optional CTA link target
   * @prop {string} ctaRel - Optional CTA link rel
   * @prop {boolean} ctaHasTrailingIcon - Whether the CTA button shows the trailing icon
   * @prop {Function} onCtaClick - CTA button click handler
   * @prop {boolean} showButton - Toggle CTA visibility (default: true)
   * @prop {Array} badges - Array of badge objects with variant and label
   */
  import Button from './Button.svelte';
  import BadgeGroup from './BadgeGroup.svelte';
  import Badge from './Badge.svelte';

  type BadgeVariant = 'default' | 'boardgame' | 'playdate' | 'apple' | 'error' | 'web';
  type BadgeInput = {
    variant?: BadgeVariant;
    label?: string;
  };

  const BADGE_PRESET_LABELS: Record<BadgeVariant, string> = {
    default: 'Badge',
    boardgame: 'Boardgame',
    playdate: 'Playdate',
    apple: 'Apple Platforms',
    error: 'Error',
    web: 'Web',
  };

  const normalizeBadge = (badge: BadgeInput) => {
    const variant = badge.variant ?? 'default';
    const label = badge.label ?? BADGE_PRESET_LABELS[variant] ?? BADGE_PRESET_LABELS.default;

    return { variant, label };
  };

  type ButtonConfig = {
    label: string;
    href?: string;
    target?: string;
    rel?: string;
    hasTrailingIcon?: boolean;
    onClick?: (event: MouseEvent) => void;
  };

  let {
    title = 'Project Name',
    subhead,
    description,
    descriptionHtml,
    badges = [],
    button,
    ctaLabel = 'Learn More',
    ctaHref,
    ctaTarget,
    ctaRel,
    ctaHasTrailingIcon = false,
    onCtaClick,
    showButton = true,
  }: {
    title?: string;
    subhead?: string;
    description?: string;
    descriptionHtml?: string;
    badges?: BadgeInput[];
    button?: ButtonConfig;
    ctaLabel?: string;
    ctaHref?: string;
    ctaTarget?: string;
    ctaRel?: string;
    ctaHasTrailingIcon?: boolean;
    onCtaClick?: (event: MouseEvent) => void;
    showButton?: boolean;
  } = $props();

  const badgeList = $derived(badges.map(normalizeBadge));
  const hasBadges = $derived(badgeList.length > 0);
  const ctaButton: ButtonConfig | undefined = $derived.by(() => {
    if (button) {
      return {
        ...button,
        onClick: button.onClick ?? onCtaClick,
      };
    }

    if (!ctaLabel) {
      return undefined;
    }

    return {
      label: ctaLabel,
      href: ctaHref,
      target: ctaTarget,
      rel: ctaRel,
      hasTrailingIcon: ctaHasTrailingIcon,
      onClick: onCtaClick,
    };
  });
  const shouldRenderButton = $derived(Boolean(showButton && ctaButton));
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
    {#if descriptionHtml}
      <div class="project-card__description text-body-medium">
        {@html descriptionHtml}
      </div>
    {:else if description}
      <p class="project-card__description text-body-medium">{description}</p>
    {/if}
  </div>

  {#if shouldRenderButton && ctaButton}
    <Button
      variant="filled-secondary"
      label={ctaButton.label}
      href={ctaButton.href}
      target={ctaButton.target}
      rel={ctaButton.rel}
      hasTrailingIcon={ctaButton.hasTrailingIcon}
      onclick={ctaButton.onClick}
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

  /* Extended breakpoint (1015px+): display-small */
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

  /* Extended breakpoint (1015px+): headline-medium */
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
    margin: 0;
    width: 100%;
  }

  /* Extended breakpoint (1015px+): body-large */
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
