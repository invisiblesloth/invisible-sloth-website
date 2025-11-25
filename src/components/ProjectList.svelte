<script lang="ts">
  /**
   * ProjectList component for displaying multiple project cards in a single-column stack.
   *
   * Layout deliberately stays as one column across breakpoints to focus attention on each project,
   * while responsive spacing and container padding adapt for larger viewports.
   *
   * @prop {Array} projects - Array of project objects to display
   */
  import ProjectCard from './ProjectCard.svelte';
  import Divider from './Divider.svelte';

  type BadgeVariant = 'default' | 'boardgame' | 'playdate' | 'apple' | 'error' | 'web';
  type BadgeInput = {
    variant?: BadgeVariant;
    label?: string;
  };

  type Project = {
    title?: string;
    subhead?: string;
    description?: string;
    descriptionHtml?: string;
    ctaLabel?: string;
    ctaHref?: string;
    ctaTarget?: string;
    ctaRel?: string;
    ctaHasTrailingIcon?: boolean;
    onCtaClick?: (event: MouseEvent) => void;
    badges?: BadgeInput[];
    showButton?: boolean;
    button?: {
      label: string;
      href?: string;
      target?: string;
      rel?: string;
      hasTrailingIcon?: boolean;
      onClick?: (event: MouseEvent) => void;
    };
  };

  let {
    projects = [],
    class: className = '',
  }: {
    projects?: Project[];
    class?: string;
  } = $props();
</script>

<div class={`project-list ${className}`}>
  <div class="project-list__surface elevation-2">
    {#each projects as project, index (index)}
      <ProjectCard
        title={project.title}
        subhead={project.subhead}
        description={project.description}
        descriptionHtml={project.descriptionHtml}
        button={project.button}
        showButton={project.showButton}
        ctaLabel={project.ctaLabel}
        ctaHref={project.ctaHref}
        ctaTarget={project.ctaTarget}
        ctaRel={project.ctaRel}
        ctaHasTrailingIcon={project.ctaHasTrailingIcon}
        onCtaClick={project.onCtaClick}
        badges={project.badges}
      />
      {#if index < projects.length - 1}
        <Divider thickness="Double" ariaHidden />
      {/if}
    {/each}
  </div>
</div>

<style>
  /* ==========================================
     OUTER CONTAINER
     Provides flex layout for centering and stretching
     ========================================== */

  .project-list {
    display: flex;
    flex-direction: column;
    align-items: center;
    align-self: stretch;
  }

  /* ==========================================
     SURFACE CONTAINER
     Visual surface with background, shadow, and responsive padding
     ========================================== */

  .project-list__surface {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-gutter-loose);
    align-self: stretch;
    padding: var(--space-section-block-lg) var(--space-rail-inline);

    /* Surface styling */
    border-radius: var(--radius-sm);
    background-color: var(--color-surface-container-low);
  }

  @media (min-width: 632px) {
    .project-list__surface {
      border-radius: var(--radius-xl);
    }

    .project-list {
      padding-inline: var(--space-rail-inline);
    }
  }

  @media (min-width: 1176px) {
    .project-list {
      padding: 0;
    }
  }
</style>
