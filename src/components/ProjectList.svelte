<script lang="ts">
  /**
   * ProjectList visual shell for displaying project cards in a single-column stack.
   *
   * Layout deliberately stays as one column across breakpoints to focus attention on each project,
   * while responsive spacing and container padding adapt for larger viewports.
   *
   * @prop {Snippet} children - Composed project cards and separators
   */
  import type { Snippet } from 'svelte';

  let {
    children,
    class: className = '',
  }: {
    children?: Snippet;
    class?: string;
  } = $props();
</script>

<div class={`project-list ${className}`}>
  <div class="project-list__surface elevation-2">
    {@render children?.()}
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
