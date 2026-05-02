<script lang="ts">
  import Close from '../icons/Close.svelte';
  import ExternalLink from '../icons/ExternalLink.svelte';
  import { warnOnce } from '../lib/devWarnings';
  import { normalizeHref, normalizeRelForTarget, normalizeTarget } from '../lib/linkBehavior';

  /**
   * Button component with lift-and-reveal hover effect
   *
   * @prop {string} variant - Button style variant (default: 'filled-primary')
   * @prop {string} type - HTML button type (default: 'button')
   * @prop {string} label - Button text label
   * @prop {boolean} hasLeadingIcon - Show leading icon (Close icon)
   * @prop {boolean} hasTrailingIcon - Show trailing icon (ExternalLink icon)
   * @prop {boolean} disabled - Whether the button is disabled
   * @prop {string} href - Optional non-empty URL to render as anchor instead of button
   * @prop {string} target - Optional link target (same-tab by default when href is present)
   * @prop {string} rel - Optional link rel (security tokens auto-appended when target resolves to '_blank')
   * Disabled links render as non-interactive anchors without href, with role="link" and aria-disabled semantics
   * @prop {Function} onclick - Click event handler (receives native MouseEvent)
   * Migration note: `on:click` was removed; use `onclick`.
   */

  let {
    variant = 'filled-primary',
    type = 'button',
    label = 'Button',
    disabled = false,
    hasLeadingIcon = false,
    hasTrailingIcon = false,
    href = undefined,
    target = undefined,
    rel = undefined,
    onclick = undefined,
  }: {
    variant?: string;
    type?: 'button' | 'submit' | 'reset';
    label?: string;
    disabled?: boolean;
    hasLeadingIcon?: boolean;
    hasTrailingIcon?: boolean;
    href?: string;
    target?: string;
    rel?: string;
    onclick?: (event: MouseEvent) => void;
  } = $props();

  let pressed = $state(false);

  const normalizedHref = $derived(normalizeHref(href));
  const hasHrefProp = $derived(href !== undefined && href !== null);
  const isLinkMode = $derived(Boolean(normalizedHref));
  const isDisabledLink = $derived(Boolean(normalizedHref && disabled));
  const linkHref = $derived<string | undefined>(isDisabledLink ? undefined : normalizedHref);
  const normalizedTarget = $derived<string | undefined>(normalizeTarget(target));
  const linkTarget = $derived<string | undefined>(isDisabledLink ? undefined : normalizedTarget);
  const linkRel = $derived<string | undefined>(
    isDisabledLink ? undefined : normalizeRelForTarget(linkTarget, rel)
  );

  $effect(() => {
    if (hasHrefProp && !normalizedHref) {
      warnOnce(
        'button:invalid-href',
        '[Button] `href` must be a non-empty string. Rendering as <button> fallback.'
      );
    }
  });

  // Normalized modifier class for BEM variants
  const normalizeVariant = (value?: string, fallback: string = 'filled-primary'): string => {
    if (!value) return fallback;
    const sanitized = value.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-');
    return sanitized || fallback;
  };

  const variantModifier = $derived(`button--${normalizeVariant(variant, 'filled-primary')}`);

  function handleClick(event: MouseEvent): void {
    onclick?.(event);
  }

  // Delayed navigation for anchor variant to allow pressed animation to play
  function handleAnchorClick(event: MouseEvent): void {
    if (isDisabledLink) {
      event.preventDefault();
      return;
    }

    handleClick(event);

    // Allow native navigation to proceed; only linger the pressed state briefly for
    // touch polish without blocking the user-gesture navigation path.
    pressed = true;
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        pressed = false;
      }, 120);
    }
  }

  function handleTouchStart(): void {
    if (disabled || isDisabledLink) return;
    pressed = true;
  }

  function handleTouchEnd(): void {
    pressed = false;
  }
</script>

{#if isLinkMode}
  <!-- Anchor variant for navigation (Svelte 5 uses event attributes like onclick/ontouch*) -->
  <a
    class="button {variantModifier}"
    class:is-pressed={pressed}
    class:is-disabled={isDisabledLink}
    href={linkHref}
    role={isDisabledLink ? 'link' : undefined}
    aria-disabled={isDisabledLink ? 'true' : undefined}
    tabindex={isDisabledLink ? -1 : undefined}
    target={linkTarget}
    rel={linkRel}
    ontouchstart={handleTouchStart}
    ontouchend={handleTouchEnd}
    ontouchcancel={handleTouchEnd}
    onclick={handleAnchorClick}
  >
    <!-- Shadow/reveal layer (stays in place) -->
    <div class="button__side" aria-hidden="true"></div>

    <!-- Main button surface (lifts on hover) -->
    <div class="button__surface">
      <!-- State layer for interactive feedback -->
      <div class="button__state-layer" aria-hidden="true"></div>

      <!-- Content -->
      <span class="button__content">
        {#if hasLeadingIcon}
          <span class="button__icon">
            <Close />
          </span>
        {/if}

        <span class="button__label text-label-large">{label}</span>

        {#if hasTrailingIcon}
          <span class="button__icon">
            <ExternalLink />
          </span>
        {/if}
      </span>
    </div>
  </a>
{:else}
  <!-- Button variant for actions (Svelte 5 uses event attributes like onclick/ontouch*) -->
  <button
    class="button {variantModifier}"
    class:is-pressed={pressed}
    class:is-disabled={disabled}
    {type}
    {disabled}
    ontouchstart={handleTouchStart}
    ontouchend={handleTouchEnd}
    ontouchcancel={handleTouchEnd}
    onclick={handleClick}
  >
    <!-- Shadow/reveal layer (stays in place) -->
    <div class="button__side" aria-hidden="true"></div>

    <!-- Main button surface (lifts on hover) -->
    <div class="button__surface">
      <!-- State layer for interactive feedback -->
      <div class="button__state-layer" aria-hidden="true"></div>

      <!-- Content -->
      <span class="button__content">
        {#if hasLeadingIcon}
          <span class="button__icon">
            <Close />
          </span>
        {/if}

        <span class="button__label text-label-large">{label}</span>

        {#if hasTrailingIcon}
          <span class="button__icon">
            <ExternalLink />
          </span>
        {/if}
      </span>
    </div>
  </button>
{/if}

<style>
  /* ==========================================
     BASE STRUCTURE
     Layout, tokens, and core layers
     ========================================== */

  .button {
    /* Shared timing for smooth interactions */
    --button-transition: 150ms cubic-bezier(0.4, 0, 0.2, 1);
    /* Default state-layer tokens (overridden by variant modifiers) */
    --button-state-hover: var(--color-state-on-primary-08);
    --button-state-focus: var(--color-state-on-primary-12);
    --button-state-pressed: var(--color-state-on-primary-16);

    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;

    height: 40px;
    padding: 0;
    margin: 0;

    border: none;
    border-radius: var(--radius-full); /* Shapes the focus outline */
    background: transparent;
    cursor: pointer;
    font-family: inherit;
    text-decoration: none; /* Remove underline for anchor variant */
    -webkit-tap-highlight-color: transparent;
  }

  .button:disabled,
  .button.is-disabled {
    cursor: not-allowed;
  }

  /* Shadow layer - revealed on hover */
  .button__side {
    position: absolute;
    inset: 0;
    border-radius: var(--radius-full);
    pointer-events: none;
  }

  /* Surface layer - lifts to reveal shadow */
  .button__surface {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;

    width: 100%;
    height: 100%;
    padding: var(--space-300) var(--space-400);

    border-radius: var(--radius-full);
    transition: transform var(--button-transition);
    overflow: hidden;
    
    transform: translate(-1px, -3px);
  }

  /* State layer - semi-transparent overlay for interactive feedback */
  .button__state-layer {
    position: absolute;
    inset: 0;
    border-radius: inherit;
    /* Token-driven state layer hues (alpha encoded in token) */
    background-color: var(--button-state-hover);
    opacity: 0;
    transition: opacity var(--button-transition);
    pointer-events: none;
    z-index: 0; /* Behind content */
  }

  /* Content wrapper - above state layer */
  .button__content {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-200);
    z-index: 1; /* Prevents contrast changes from state layer */
  }

  /* ==========================================
     VARIANT: FILLED PRIMARY
     All styles for primary button variant
     ========================================== */

  .button--filled-primary .button__surface {
    background-color: var(--color-primary);
    color: var(--color-on-primary);
    --button-state-hover: var(--color-state-on-primary-08);
    --button-state-focus: var(--color-state-on-primary-08);
    --button-state-pressed: var(--color-state-on-primary-12);
  }

  .button--filled-primary .button__side {
    /* Tokenized: defaults to #013201 in tokens */
    background-color: var(--color-button-side-primary);
  }

  /* ==========================================
     VARIANT: FILLED SECONDARY
     Secondary button variant styling
     ========================================== */

  .button--filled-secondary .button__surface {
    background-color: var(--color-secondary);
    color: var(--color-on-secondary);
    --button-state-hover: var(--color-state-on-secondary-08);
    --button-state-focus: var(--color-state-on-secondary-08);
    --button-state-pressed: var(--color-state-on-secondary-12);
  }

  .button--filled-secondary .button__side {
    /* Tokenized: defaults to var(--color-accent-secondary) */
    background-color: var(--color-button-side-secondary);
  }

  /* ==========================================
     VARIANT: FILLED TERTIARY
     Tertiary button variant styling
     ========================================== */

  .button--filled-tertiary .button__surface {
    background-color: var(--color-tertiary);
    color: var(--color-on-tertiary);
    --button-state-hover: var(--color-state-on-tertiary-08);
    --button-state-focus: var(--color-state-on-tertiary-08);
    --button-state-pressed: var(--color-state-on-tertiary-12);
  }

  .button--filled-tertiary .button__side {
    /* Tokenized: defaults to #013C3C in tokens */
    background-color: var(--color-button-side-tertiary);
  }

  /* ==========================================
     INTERACTIVE STATES
     Hover, focus, press, and disabled
     ========================================== */

  /* POINTER DEVICES (mouse/trackpad) */
  @media (hover: hover) and (pointer: fine) {
    /* Hover - lift to reveal shadow */
    .button:where(:hover):not(:disabled):not(.is-disabled) .button__surface {
      transform: translate(-1.8px, -4px);
    }

    /* Hover state layer using tokenized on-* color with embedded alpha */
    .button:where(:hover):not(:disabled):not(.is-disabled) .button__state-layer {
      background-color: var(--button-state-hover);
      opacity: 1;
    }

    /* Pressed - return to origin */
    .button:active:not(:disabled):not(.is-disabled) .button__surface {
      transform: translate(0, 0);
      transition-duration: 50ms;
    }

    /* Active/pressed state layer (tokenized alpha) */
    .button:active:not(:disabled):not(.is-disabled) .button__state-layer {
      background-color: var(--button-state-pressed);
      opacity: 1;
      transition-duration: 50ms;
    }
  }

  /* TOUCH DEVICES (touch screens) */
  @media (hover: none) and (pointer: coarse) {
    /* Default state - raised (like hover on pointer devices) */
    .button:not(:disabled):not(.is-disabled):not(:active):not(:focus-visible) .button__surface {
      transform: translate(-1.4px, -3px);
    }

    /* Touch/pressed - depress to origin */
    .button:active:not(:disabled):not(.is-disabled) .button__surface {
      transform: translate(0, 0);
      transition-duration: 50ms;
    }

    /* Active/pressed state layer */
    .button:active:not(:disabled):not(.is-disabled) .button__state-layer {
      background-color: var(--button-state-pressed);
      opacity: 1;
      transition-duration: 50ms;
    }
  }

  /* FOCUS (applies to all input types) */
  .button:focus-visible:not(.is-disabled) {
    outline: var(--focus-outline-width) solid var(--color-focus);
  }

  .button:focus-visible:not(.is-disabled) .button__surface {
    transform: translate(0, 0);
  }

  .button:focus-visible:not(.is-disabled) .button__surface::before {
    content: "";
    position: absolute;
    inset: 0;
    border: var(--focus-ring-width) solid var(--color-on-focus);
    border-radius: inherit;
    pointer-events: none;
  }

  /* Focus state layer 12–16% */
  .button:focus-visible:not(:disabled):not(.is-disabled) .button__state-layer {
    background-color: var(--button-state-focus);
    opacity: 1;
  }

  .button:focus-visible:active:not(:disabled):not(.is-disabled) .button__state-layer {
    background-color: var(--button-state-pressed);
    opacity: 1;
    transition-duration: 50ms;
  }

  /* Disabled - muted appearance, no shadow */
  .button:disabled .button__surface,
  .button.is-disabled .button__surface {
    background: var(--color-state-on-surface-08);
    color: var(--color-on-surface);
  }

  .button:disabled .button__side,
  .button.is-disabled .button__side {
    background: none;
  }

  .button:disabled .button__label,
  .button.is-disabled .button__label {
    opacity: var(--state-disabled);
  }

  .button:disabled .button__icon,
  .button.is-disabled .button__icon {
    opacity: var(--state-disabled);
  }

  /* Touch-driven pressed state helper */
  .button.is-pressed .button__surface {
    transform: translate(0, 0) !important;
    transition-duration: 50ms;
  }

  .button.is-pressed .button__state-layer {
    background-color: var(--button-state-pressed);
    opacity: 1;
    transition-duration: 50ms;
  }

  /* ==========================================
     TYPOGRAPHY & ICONS
     Content styling
     ========================================== */

  .button__label {
    white-space: nowrap;
  }

  .button__icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
  }

  /* ==========================================
     ACCESSIBILITY: REDUCED MOTION
     Disable animations for users who prefer reduced motion
     ========================================== */

  @media (prefers-reduced-motion: reduce) {
    .button__surface,
    .button__state-layer {
      transition: none;
    }

    /* Neutralize default and interactive transforms, including touch default lift */
    .button:not(:disabled):not(.is-disabled) .button__surface,
    .button:where(:hover, :active, :focus-visible):not(:disabled):not(.is-disabled) .button__surface {
      transform: none;
    }

    /* Ensure touch/press helper class does not reintroduce motion */
    .button.is-pressed .button__surface {
      transform: none !important;
    }

    /* On touch devices, keep the surface pressed-in by default */
    @media (hover: none) and (pointer: coarse) {
      .button:not(:disabled):not(.is-disabled) .button__surface {
        transform: none !important;
      }
    }
  }
</style>
