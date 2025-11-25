<script lang="ts">
  /**
   * Divider component for separating content
   *
   * Features:
   * - Theme-aware: Automatically adapts color using --color-outline-variant
   * - Flexible: Supports horizontal and vertical orientations
   * - Customizable: Full-width or middle-inset layouts, default or double thickness
   */
  interface Props {
    /** Orientation of the divider */
    orientation?: "horizontal" | "vertical";
    /** Layout variant: full-width spans the entire container, middle-inset has spacing on sides */
    layout?: "Full-width" | "Middle-inset";
    /** Thickness variant: default is 1px, double is 2px */
    thickness?: "Default" | "Double";
    /** Hide divider from assistive technologies when purely decorative */
    ariaHidden?: boolean;
  }

  const {
    orientation = "horizontal",
    layout = "Full-width",
    thickness = "Default",
    ariaHidden = false,
  }: Props = $props();

  const sharedModifiers = $derived([
    layout === "Middle-inset" ? "divider--middle-inset" : "",
    thickness === "Double" ? "divider--double" : "",
  ]);

  const horizontalClasses = $derived(
    ["divider", "divider--horizontal", ...sharedModifiers]
      .filter(Boolean)
      .join(" ")
  );

  const verticalClasses = $derived(
    ["divider", "divider--vertical", ...sharedModifiers]
      .filter(Boolean)
      .join(" ")
  );
</script>

{#if orientation === "horizontal"}
  <hr class={horizontalClasses} aria-hidden={ariaHidden ? "true" : undefined} />
{:else}
  <div
    role="separator"
    aria-orientation="vertical"
    class={verticalClasses}
    aria-hidden={ariaHidden ? "true" : undefined}
  ></div>
{/if}

<style>
  /* ==========================================
     DIVIDER STYLES
     Theme-aware component using --color-outline-variant
     Light: #bec9c6 (--color-gray-080)
     Dark:  #323b3b (--color-gray-024)
     ========================================== */

  .divider {
    margin: 0;
    box-sizing: border-box;
    border: 0;
  }

  /* Horizontal divider */
  .divider--horizontal {
    width: 100%;
    border-block-start: 1px solid var(--color-outline-variant);
  }

  .divider--horizontal.divider--double {
    border-block-start-width: 2px;
  }

  .divider--horizontal.divider--middle-inset {
    width: calc(100% - 2 * var(--space-600));
    margin-inline: var(--space-600);
  }

  /* Vertical divider */
  .divider--vertical {
    width: 1px;
    align-self: stretch;
    border-inline-start: 1px solid var(--color-outline-variant);
  }

  .divider--vertical.divider--double {
    width: 2px;
    border-inline-start-width: 2px;
  }

  /* Inset variant (requires a parent with a definite height) */
  .divider--vertical.divider--middle-inset {
    /* Only apply explicit height for the inset variant */
    height: calc(100% - 2 * var(--space-600));
    margin-block: var(--space-600);
  }
</style>
