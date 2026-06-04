<script module lang="ts">
  import type { Snippet } from 'svelte';
  import type { ProjectBadge, ProjectButton } from '../types/project';

  const PROJECT_CARD_HEADING_LEVELS = [1, 2, 3, 4, 5, 6] as const;

  type HeadingLevel = (typeof PROJECT_CARD_HEADING_LEVELS)[number];

  export type ProjectCardProps = {
    title?: string;
    subhead?: string;
    description?: string;
    headingLevel?: HeadingLevel;
    badges?: ProjectBadge[];
    button?: ProjectButton;
    children?: Snippet;
    class?: string;
  };
</script>

<script lang="ts">
  /**
   * ProjectCard component for displaying project information
   *
   * Featured project card with badges, name, subhead, slotted description, and CTA button.
   * Shared semantic typography responds to viewport size for optimal readability.
   *
   * Responsive behavior:
   * - Compact and medium viewports use the base card typography.
   * - Extended viewports use larger card-specific typography.
   * Outer width and rail behavior belong to the parent layout/surface.
   * Root-hook component: `class` is appended to the root <div> for
   * layout hooks, global utilities, and global selectors.
   *
   * @prop {string} title - Project name/title
   * @prop {string} subhead - Project subheading
   * @prop {string} description - Plain text fallback when no rich description slot is provided
   * @prop {number} headingLevel - Semantic title heading level, from 1 to 6
   * @prop {ProjectButton} button - Optional link CTA
   * @prop {Array} badges - Array of badge objects with variant and label
   * @prop {Snippet} children - Rich description content, usually rendered from Astro Markdown
   * @prop {string} class - Additional classes appended to the root div
   */
  import Button from './Button.svelte';
  import BadgeGroup from './BadgeGroup.svelte';
  import Badge from './Badge.svelte';
  import ExternalLink from '../icons/ExternalLink.svelte';
  import { normalizeOptionProp } from '../lib/componentValidation';
  import { isExternalAbsoluteHttpUrl } from '../lib/siteLinks';

  type HeadingTag = `h${HeadingLevel}`;

  let {
    title = 'Project Name',
    subhead,
    description,
    headingLevel = 2,
    badges = [],
    button,
    children,
    class: className = '',
  }: ProjectCardProps = $props();

  const hasBadges = $derived(badges.length > 0);
  const fallbackDescription = $derived(description?.trim());
  const resolvedHeadingLevel = $derived(
    normalizeOptionProp({
      value: headingLevel,
      allowedValues: PROJECT_CARD_HEADING_LEVELS,
      fallbackValue: 2,
      componentName: 'ProjectCard',
      propName: 'headingLevel',
      warningKey: 'project-card:invalid-heading-level',
    })
  );
  const headingTag = $derived(`h${resolvedHeadingLevel}` as HeadingTag);
  const showsExternalCtaIcon = $derived(Boolean(button && isExternalAbsoluteHttpUrl(button.href)));
  const normalizedClassName = $derived(String(className ?? '').trim());
  const projectCardClasses = $derived(
    ['project-card', normalizedClassName].filter(Boolean).join(' ')
  );
</script>

{#snippet externalLinkIcon()}
  <ExternalLink />
{/snippet}

<div class={projectCardClasses}>
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
    <svelte:element
      this={headingTag}
      class="project-card__title text-display-card-title-responsive"
    >
      {title}
    </svelte:element>
    {#if subhead}
      <p class="project-card__subhead text-supporting-heading-responsive">{subhead}</p>
    {/if}
    {#if children}
      <div class="project-card__description text-body-responsive">
        {@render children()}
      </div>
    {:else if fallbackDescription}
      <p class="project-card__description text-body-responsive">{fallbackDescription}</p>
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

  .project-card__subhead {
    margin: 0;
    width: 100%;
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

</style>
