<script module lang="ts">
  const DIVIDER_ORIENTATIONS = ["horizontal", "vertical"] as const;
  const DIVIDER_THICKNESSES = ["Default", "Double"] as const;

  type DividerOrientation = (typeof DIVIDER_ORIENTATIONS)[number];
  type DividerThickness = (typeof DIVIDER_THICKNESSES)[number];

  export type DividerProps = {
    /** Orientation of the divider */
    orientation?: DividerOrientation;
    /** Thickness variant: default is 1px, double is 2px */
    thickness?: DividerThickness;
    /** Hide divider from assistive technologies when purely decorative */
    ariaHidden?: boolean;
    /** Additional global utility or hook classes */
    class?: string;
  };
</script>

<script lang="ts">
  import { normalizeOptionProp } from "../lib/componentValidation";

  /**
   * Divider primitive for separating content.
   *
   * Parent components own placement, spacing, inset, and container sizing.
   * The forwarded class is intended for global utilities, global hooks, or
   * external selectors; scoped parent CSS should use wrappers for layout.
   *
   * Vertical dividers stretch only inside a flex/grid parent with a definite
   * cross-size. Without that parent sizing, the divider may render at zero height.
   */
  let {
    orientation = "horizontal",
    thickness = "Default",
    ariaHidden = false,
    class: className = "",
  }: DividerProps = $props();

  const normalizedOrientation = $derived(
    normalizeOptionProp({
      value: orientation,
      allowedValues: DIVIDER_ORIENTATIONS,
      fallbackValue: "horizontal",
      componentName: "Divider",
      propName: "orientation",
      warningKey: "divider:invalid-orientation",
    })
  );
  const normalizedThickness = $derived(
    normalizeOptionProp({
      value: thickness,
      allowedValues: DIVIDER_THICKNESSES,
      fallbackValue: "Default",
      componentName: "Divider",
      propName: "thickness",
      warningKey: "divider:invalid-thickness",
    })
  );

  function classes(...values: Array<string | false | undefined>): string {
    return values
      .map((value) => (typeof value === "string" ? value.trim() : ""))
      .filter(Boolean)
      .join(" ");
  }

  const horizontalClasses = $derived(
    classes(
      "divider",
      "divider--horizontal",
      normalizedThickness === "Double" && "divider--double",
      className
    )
  );

  const verticalClasses = $derived(
    classes(
      "divider",
      "divider--vertical",
      normalizedThickness === "Double" && "divider--double",
      className
    )
  );
</script>

{#if normalizedOrientation === "horizontal"}
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
</style>
