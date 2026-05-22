<script lang="ts">
  import type { Snippet } from 'svelte';
  import {
    DEFAULT_BUTTON_SHAPE,
    DEFAULT_BUTTON_TYPE,
    DEFAULT_BUTTON_VARIANT,
    normalizeButtonShape,
    normalizeButtonType,
    normalizeButtonVariant,
    type ButtonShape,
    type ButtonType,
    type ButtonVariant,
  } from '../lib/button';
  import { warnOnce } from '../lib/devWarnings';
  import { normalizeHref, normalizeRelForTarget, normalizeTarget } from '../lib/linkBehavior';

  type ButtonMode = 'link' | 'button';

  type Props = {
    variant?: ButtonVariant;
    shape?: ButtonShape;
    type?: ButtonType;
    label?: string;
    disabled?: boolean;
    href?: string;
    target?: string;
    rel?: string;
    onclick?: (event: MouseEvent) => void;
    icon?: Snippet;
    leadingIcon?: Snippet;
    trailingIcon?: Snippet;
    [key: string]: unknown;
  };

  const BASE_ATTRIBUTES = new Set(['id', 'title', 'lang', 'dir', 'accesskey']);
  const BLOCKED_ARIA_ATTRIBUTES = new Set([
    'aria-disabled',
    'aria-label',
    'aria-labelledby',
    'aria-hidden',
  ]);
  const OWNED_ATTRIBUTES = new Set([
    'href',
    'target',
    'rel',
    'type',
    'disabled',
    'role',
    'tabindex',
    'onclick',
    'ontouchstart',
    'ontouchend',
    'ontouchcancel',
  ]);
  const FORWARDED_EVENTS = new Set(['onfocus', 'onblur', 'onmouseenter', 'onmouseleave']);
  const LINK_ATTRIBUTES = new Set(['download', 'hreflang', 'referrerpolicy']);
  const BUTTON_ATTRIBUTES = new Set([
    'name',
    'value',
    'form',
    'formaction',
    'formenctype',
    'formmethod',
    'formnovalidate',
    'formtarget',
  ]);

  /**
   * Button component with lift-and-reveal hover effect
   *
   * @prop {string} variant - Button style variant (default: 'filled-primary')
   * @prop {string} shape - Button shape (default: 'label'); use 'icon' for icon-only controls
   * @prop {string} type - HTML button type (default: 'button')
   * @prop {string} label - Button text label or icon button accessible name
   * @prop {Snippet} icon - Required icon-only snippet when shape is 'icon'; rendered as decorative content
   * @prop {Snippet} leadingIcon - Optional decorative leading icon snippet; must render inert glyphs only
   * @prop {Snippet} trailingIcon - Optional decorative trailing icon snippet; must render inert glyphs only
   * @prop {boolean} disabled - Whether the button is disabled
   * @prop {string} href - Optional non-empty URL to render as anchor instead of button
   * @prop {string} target - Optional link target (same-tab by default when href is present)
   * @prop {string} rel - Optional link rel (security tokens auto-appended when target resolves to '_blank')
   * Disabled links render as non-interactive anchors without href, with role="link" and aria-disabled semantics
   * @prop {Function} onclick - Click event handler (receives native MouseEvent)
   * Migration note: `on:click` was removed; use `onclick`.
   */

  let {
    variant = DEFAULT_BUTTON_VARIANT,
    shape = DEFAULT_BUTTON_SHAPE,
    type = DEFAULT_BUTTON_TYPE,
    label = 'Button',
    disabled = false,
    href = undefined,
    target = undefined,
    rel = undefined,
    onclick = undefined,
    icon = undefined,
    leadingIcon = undefined,
    trailingIcon = undefined,
    ...restProps
  }: Props = $props();

  let pressed = $state(false);

  const normalizedHref = $derived(normalizeHref(href));
  const hasHrefProp = $derived(href !== undefined && href !== null);
  const isLinkMode = $derived(Boolean(normalizedHref));
  const mode = $derived<ButtonMode>(isLinkMode ? 'link' : 'button');
  const isDisabledLink = $derived(Boolean(normalizedHref && disabled));
  const linkHref = $derived<string | undefined>(isDisabledLink ? undefined : normalizedHref);
  const normalizedTarget = $derived<string | undefined>(normalizeTarget(target));
  const linkTarget = $derived<string | undefined>(isDisabledLink ? undefined : normalizedTarget);
  const linkRel = $derived<string | undefined>(
    isDisabledLink ? undefined : normalizeRelForTarget(linkTarget, rel)
  );
  const normalizedVariant = $derived(normalizeButtonVariant(variant));
  const normalizedShape = $derived(normalizeButtonShape(shape));
  const normalizedType = $derived(normalizeButtonType(type));
  const normalizedLabel = $derived(normalizeButtonLabel(label));
  const isRequestedIconShape = $derived(normalizedShape === 'icon');
  const isIconShape = $derived(isRequestedIconShape && Boolean(icon));
  const variantModifier = $derived(`button--${normalizedVariant}`);
  const shapeModifier = $derived(`button--shape-${isIconShape ? 'icon' : 'label'}`);
  const forwardedAttributes = $derived(filterForwardedAttributes(mode, restProps));

  function hasValidButtonLabel(value: unknown): value is string {
    return typeof value === 'string' && value.trim().length > 0;
  }

  function normalizeButtonLabel(value: unknown): string {
    if (hasValidButtonLabel(value)) {
      return value.trim();
    }

    return 'Button';
  }

  function isAriaAttribute(name: string): boolean {
    return name.startsWith('aria-') && !BLOCKED_ARIA_ATTRIBUTES.has(name);
  }

  function isDataAttribute(name: string): boolean {
    return name.startsWith('data-');
  }

  function isAllowedAttribute(attributeMode: ButtonMode, name: string): boolean {
    if (name === 'class' || name === 'style') return false;
    if (OWNED_ATTRIBUTES.has(name) || BLOCKED_ARIA_ATTRIBUTES.has(name)) return false;
    if (BASE_ATTRIBUTES.has(name) || isAriaAttribute(name) || isDataAttribute(name)) return true;
    if (FORWARDED_EVENTS.has(name)) return true;

    return attributeMode === 'link' ? LINK_ATTRIBUTES.has(name) : BUTTON_ATTRIBUTES.has(name);
  }

  function filterForwardedAttributes(
    attributeMode: ButtonMode,
    source: Record<string, unknown>
  ): Record<string, unknown> {
    const filtered: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(source)) {
      if (isAllowedAttribute(attributeMode, key)) {
        filtered[key] = value;
      }
    }

    return filtered;
  }

  $effect(() => {
    if (hasHrefProp && !normalizedHref) {
      warnOnce(
        'button:invalid-href',
        '[Button] `href` must be a non-empty string. Rendering as <button> fallback.'
      );
    }

    if (Object.prototype.hasOwnProperty.call(restProps, 'class')) {
      warnOnce(
        'button:unsupported-class',
        '[Button] `class` is not forwarded. Use the `variant` prop for visual styling.'
      );
    }

    if (Object.prototype.hasOwnProperty.call(restProps, 'style')) {
      warnOnce(
        'button:unsupported-style',
        '[Button] `style` is not forwarded. Use component variants and design tokens for styling.'
      );
    }

    if (!hasValidButtonLabel(label)) {
      warnOnce(
        'button:invalid-label',
        '[Button] `label` must be a non-empty string. Falling back to "Button".'
      );
    }

    if (isRequestedIconShape && !icon) {
      warnOnce(
        'button:missing-icon',
        '[Button] `shape="icon"` requires an `icon` snippet. Rendering a label-shaped button fallback with visible label text.'
      );
    }

    if (!isRequestedIconShape && icon) {
      warnOnce(
        'button:ignored-icon',
        '[Button] `icon` is only used with `shape="icon"`. Ignoring icon snippet.'
      );
    }

    if (isRequestedIconShape && (leadingIcon || trailingIcon)) {
      warnOnce(
        'button:ignored-label-icons',
        '[Button] `leadingIcon` and `trailingIcon` are ignored with `shape="icon"`.'
      );
    }
  });

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

{#snippet buttonContent()}
  <div class="button__side" aria-hidden="true"></div>

  <div class="button__surface">
    <div class="button__state-layer" aria-hidden="true"></div>

    <span class="button__content">
      {#if isIconShape && icon}
        <span class="button__icon" aria-hidden="true">
          {@render icon()}
        </span>
      {:else}
        {#if !isRequestedIconShape && leadingIcon}
          <span class="button__icon" aria-hidden="true">
            {@render leadingIcon()}
          </span>
        {/if}

        <span class="button__label text-label-large">{normalizedLabel}</span>

        {#if !isRequestedIconShape && trailingIcon}
          <span class="button__icon" aria-hidden="true">
            {@render trailingIcon()}
          </span>
        {/if}
      {/if}
    </span>
  </div>
{/snippet}

{#if isLinkMode}
  <a
    {...forwardedAttributes}
    class="button {variantModifier} {shapeModifier}"
    class:is-pressed={pressed}
    class:is-disabled={isDisabledLink}
    href={linkHref}
    role={isDisabledLink ? 'link' : undefined}
    aria-label={isIconShape ? normalizedLabel : undefined}
    aria-disabled={isDisabledLink ? 'true' : undefined}
    tabindex={isDisabledLink ? -1 : undefined}
    target={linkTarget}
    rel={linkRel}
    ontouchstart={handleTouchStart}
    ontouchend={handleTouchEnd}
    ontouchcancel={handleTouchEnd}
    onclick={handleAnchorClick}
  >
    {@render buttonContent()}
  </a>
{:else}
  <button
    {...forwardedAttributes}
    class="button {variantModifier} {shapeModifier}"
    class:is-pressed={pressed}
    class:is-disabled={disabled}
    type={normalizedType}
    aria-label={isIconShape ? normalizedLabel : undefined}
    {disabled}
    ontouchstart={handleTouchStart}
    ontouchend={handleTouchEnd}
    ontouchcancel={handleTouchEnd}
    onclick={handleClick}
  >
    {@render buttonContent()}
  </button>
{/if}

<style>
  /* ==========================================
     BASE STRUCTURE
     Layout, tokens, and core layers
     ========================================== */

  .button {
    --button-transition: 150ms cubic-bezier(0.4, 0, 0.2, 1);
    --button-block-size: 40px;
    --button-min-inline-size: 64px;
    --button-padding-block: var(--space-300);
    --button-padding-inline: var(--space-400);
    --button-icon-size: 18px;
    --button-surface-color: var(--color-primary);
    --button-content-color: var(--color-on-primary);
    --button-side-color: var(--color-button-side-primary);
    --button-border-width: 0px;
    --button-border-color: transparent;
    --button-surface-shadow: 0 0 0 0 transparent;
    --button-surface-shadow-hover: 0 0 0 0 transparent;
    --button-surface-shadow-focus: var(--button-surface-shadow-hover);
    --button-surface-shadow-pressed: 0 0 0 0 transparent;
    --button-disabled-surface-color: var(--color-state-on-surface-08);
    --button-disabled-content-color: var(--color-on-surface);
    --button-disabled-border-color: transparent;
    --button-disabled-surface-shadow: 0 0 0 0 transparent;
    --button-state-hover: var(--color-state-on-primary-08);
    --button-state-focus: var(--color-state-on-primary-08);
    --button-state-pressed: var(--color-state-on-primary-12);

    position: relative;
    box-sizing: border-box;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-inline-size: var(--button-min-inline-size);
    block-size: var(--button-block-size);
    padding: 0;
    margin: 0;
    border: none;
    border-radius: var(--radius-full);
    background: transparent;
    appearance: none;
    cursor: pointer;
    font-family: inherit;
    text-decoration: none;
    -webkit-tap-highlight-color: transparent;
  }

  .button--shape-icon {
    --button-block-size: 48px;
    --button-icon-size: 32px;
    --button-padding-block: var(--space-200);
    --button-padding-inline: var(--space-600);

    inline-size: 80px;
  }

  .button:disabled,
  .button.is-disabled {
    cursor: not-allowed;
  }

  .button__side {
    position: absolute;
    box-sizing: border-box;
    inset: 0;
    border-radius: var(--radius-full);
    background-color: var(--button-side-color);
    pointer-events: none;
  }

  .button__surface {
    position: relative;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: center;
    inline-size: 100%;
    block-size: 100%;
    padding: var(--button-padding-block) var(--button-padding-inline);
    border-radius: var(--radius-full);
    background-color: var(--button-surface-color);
    box-shadow:
      inset 0 0 0 var(--button-border-width) var(--button-border-color),
      var(--button-surface-shadow);
    color: var(--button-content-color);
    transition:
      transform var(--button-transition),
      background-color var(--button-transition),
      box-shadow var(--button-transition);
    overflow: hidden;
    transform: translate(-1px, -3px);
  }

  .button__state-layer {
    position: absolute;
    box-sizing: border-box;
    inset: 0;
    border-radius: inherit;
    background-color: var(--button-state-hover);
    opacity: 0;
    transition: opacity var(--button-transition);
    pointer-events: none;
    z-index: 0;
  }

  .button__content {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-200);
    z-index: 1;
  }

  /* ==========================================
     VARIANTS
     ========================================== */

  .button--filled-primary {
    --button-surface-color: var(--color-primary);
    --button-content-color: var(--color-on-primary);
    --button-side-color: var(--color-button-side-primary);
    --button-state-hover: var(--color-state-on-primary-08);
    --button-state-focus: var(--color-state-on-primary-08);
    --button-state-pressed: var(--color-state-on-primary-12);
  }

  .button--filled-inverse-primary {
    --button-surface-color: var(--color-inverse-primary);
    --button-content-color: var(--color-on-primary-container);
    --button-side-color: var(--color-button-side-inverse-primary);
    --button-state-hover: var(--color-state-on-inverse-primary-08);
    --button-state-focus: var(--color-state-on-inverse-primary-08);
    --button-state-pressed: var(--color-state-on-inverse-primary-12);
  }

  .button--filled-secondary {
    --button-surface-color: var(--color-secondary);
    --button-content-color: var(--color-on-secondary);
    --button-side-color: var(--color-button-side-secondary);
    --button-state-hover: var(--color-state-on-secondary-08);
    --button-state-focus: var(--color-state-on-secondary-08);
    --button-state-pressed: var(--color-state-on-secondary-12);
  }

  .button--filled-inverse-secondary {
    --button-surface-color: var(--color-inverse-secondary);
    --button-content-color: var(--color-on-inverse-secondary);
    --button-side-color: var(--color-button-side-inverse-secondary);
    --button-state-hover: var(--color-state-on-inverse-secondary-08);
    --button-state-focus: var(--color-state-on-inverse-secondary-08);
    --button-state-pressed: var(--color-state-on-inverse-secondary-12);
  }

  .button--filled-tertiary {
    --button-surface-color: var(--color-tertiary);
    --button-content-color: var(--color-on-tertiary);
    --button-side-color: var(--color-button-side-tertiary);
    --button-state-hover: var(--color-state-on-tertiary-08);
    --button-state-focus: var(--color-state-on-tertiary-08);
    --button-state-pressed: var(--color-state-on-tertiary-12);
  }

  .button--filled-inverse-tertiary {
    --button-surface-color: var(--color-inverse-tertiary);
    --button-content-color: var(--color-on-inverse-tertiary);
    --button-side-color: var(--color-button-side-inverse-tertiary);
    --button-state-hover: var(--color-state-on-inverse-tertiary-08);
    --button-state-focus: var(--color-state-on-inverse-tertiary-08);
    --button-state-pressed: var(--color-state-on-inverse-tertiary-12);
  }

  .button--filled-error {
    --button-surface-color: var(--color-error);
    --button-content-color: var(--color-on-error);
    --button-side-color: var(--color-button-side-error);
    --button-state-hover: var(--color-state-on-error-08);
    --button-state-focus: var(--color-state-on-error-08);
    --button-state-pressed: var(--color-state-on-error-12);
  }

  .button--filled-inverse-error {
    --button-surface-color: var(--color-inverse-error);
    --button-content-color: var(--color-on-inverse-error);
    --button-side-color: var(--color-button-side-inverse-error);
    --button-state-hover: var(--color-state-on-inverse-error-08);
    --button-state-focus: var(--color-state-on-inverse-error-08);
    --button-state-pressed: var(--color-state-on-inverse-error-12);
  }

  .button--outline,
  .button--text,
  .button--outline-error,
  .button--text-error {
    --button-surface-color: transparent;
    --button-side-color: transparent;
    --button-surface-shadow-hover: var(--effect-standard-card-lift);
    --button-surface-shadow-focus: 0 0 0 0 transparent;
    --button-disabled-surface-color: transparent;
    --button-disabled-content-color: var(--color-on-surface);
  }

  .button--outline {
    --button-content-color: var(--color-on-surface-dim);
    --button-border-width: 2px;
    --button-border-color: var(--color-outline);
    --button-disabled-border-color: var(--color-state-on-surface-12);
    --button-state-hover: var(--color-state-on-surface-08);
    --button-state-focus: var(--color-state-on-surface-08);
    --button-state-pressed: var(--color-state-on-surface-12);
  }

  .button--text {
    --button-content-color: var(--color-on-surface-dim);
    --button-state-hover: var(--color-state-on-surface-08);
    --button-state-focus: var(--color-state-on-surface-08);
    --button-state-pressed: var(--color-state-on-surface-12);
  }

  .button--outline-error {
    --button-content-color: var(--color-on-error-container);
    --button-border-width: 2px;
    --button-border-color: var(--color-error);
    --button-disabled-border-color: var(--color-state-on-surface-12);
    --button-state-hover: var(--color-state-error-08);
    --button-state-focus: var(--color-state-error-08);
    --button-state-pressed: var(--color-state-error-12);
  }

  .button--text-error {
    --button-content-color: var(--color-on-error-container);
    --button-state-hover: var(--color-state-error-08);
    --button-state-focus: var(--color-state-error-08);
    --button-state-pressed: var(--color-state-error-12);
  }

  /* ==========================================
     INTERACTIVE STATES
     Hover, focus, press, and disabled
     ========================================== */

  /* POINTER DEVICES (mouse/trackpad) */
  @media (hover: hover) and (pointer: fine) {
    .button:where(:hover):not(:disabled):not(.is-disabled) .button__surface {
      box-shadow:
        inset 0 0 0 var(--button-border-width) var(--button-border-color),
        var(--button-surface-shadow-hover);
      transform: translate(-1.8px, -4px);
    }

    .button:where(:hover):not(:disabled):not(.is-disabled) .button__state-layer {
      background-color: var(--button-state-hover);
      opacity: 1;
    }

    .button:active:not(:disabled):not(.is-disabled) .button__surface {
      box-shadow:
        inset 0 0 0 var(--button-border-width) var(--button-border-color),
        var(--button-surface-shadow-pressed);
      transform: translate(0, 0);
      transition-duration: 50ms;
    }

    .button:active:not(:disabled):not(.is-disabled) .button__state-layer {
      background-color: var(--button-state-pressed);
      opacity: 1;
      transition-duration: 50ms;
    }
  }

  /* TOUCH DEVICES (touch screens) */
  @media (hover: none) and (pointer: coarse) {
    .button:not(:disabled):not(.is-disabled):not(:active):not(:focus-visible) .button__surface {
      transform: translate(-1.4px, -3px);
    }

    .button:active:not(:disabled):not(.is-disabled) .button__surface {
      box-shadow:
        inset 0 0 0 var(--button-border-width) var(--button-border-color),
        var(--button-surface-shadow-pressed);
      transform: translate(0, 0);
      transition-duration: 50ms;
    }

    .button:active:not(:disabled):not(.is-disabled) .button__state-layer {
      background-color: var(--button-state-pressed);
      opacity: 1;
      transition-duration: 50ms;
    }
  }

  /* FOCUS (applies to all input types) */
  .button:focus-visible:not(:disabled):not(.is-disabled) {
    outline: var(--focus-outline-width) solid var(--color-focus);
  }

  .button:focus-visible:not(:disabled):not(.is-disabled) .button__surface {
    box-shadow:
      inset 0 0 0 var(--button-border-width) var(--button-border-color),
      var(--button-surface-shadow-focus);
    transform: translate(0, 0);
  }

  .button:focus-visible:not(:disabled):not(.is-disabled) .button__surface::before {
    content: "";
    position: absolute;
    inset: 0;
    border: var(--focus-ring-width) solid var(--color-on-focus);
    border-radius: inherit;
    pointer-events: none;
    z-index: 2;
  }

  .button:focus-visible:not(:disabled):not(.is-disabled) .button__state-layer {
    background-color: var(--button-state-focus);
    opacity: 1;
  }

  .button:focus-visible:active:not(:disabled):not(.is-disabled) .button__surface {
    box-shadow:
      inset 0 0 0 var(--button-border-width) var(--button-border-color),
      var(--button-surface-shadow-pressed);
  }

  .button:focus-visible:active:not(:disabled):not(.is-disabled) .button__state-layer {
    background-color: var(--button-state-pressed);
    opacity: 1;
    transition-duration: 50ms;
  }

  /* Disabled - muted appearance, no shadow */
  .button:disabled .button__surface,
  .button.is-disabled .button__surface {
    background: var(--button-disabled-surface-color);
    box-shadow:
      inset 0 0 0 var(--button-border-width) var(--button-disabled-border-color),
      var(--button-disabled-surface-shadow);
    color: var(--button-disabled-content-color);
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
  .button.is-pressed:not(:disabled):not(.is-disabled) .button__surface,
  .button.is-enhanced-pressed:not(:disabled):not(.is-disabled) .button__surface {
    box-shadow:
      inset 0 0 0 var(--button-border-width) var(--button-border-color),
      var(--button-surface-shadow-pressed);
    transform: translate(0, 0) !important;
    transition-duration: 50ms;
  }

  .button.is-pressed:not(:disabled):not(.is-disabled) .button__state-layer,
  .button.is-enhanced-pressed:not(:disabled):not(.is-disabled) .button__state-layer {
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
    flex: 0 0 auto;
    align-items: center;
    justify-content: center;
    inline-size: var(--button-icon-size);
    block-size: var(--button-icon-size);
    font-size: var(--button-icon-size);
    pointer-events: none;
  }

  .button__icon :global(svg) {
    display: block;
    inline-size: 1em;
    block-size: 1em;
    pointer-events: none;
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

    .button--outline,
    .button--text,
    .button--outline-error,
    .button--text-error {
      --button-surface-shadow-hover: 0 0 0 0 transparent;
    }

    /* Neutralize default and interactive transforms, including touch default lift */
    .button:not(:disabled):not(.is-disabled) .button__surface,
    .button:where(:hover, :active, :focus-visible):not(:disabled):not(.is-disabled) .button__surface {
      transform: none;
    }

    /* Ensure touch/press helper class does not reintroduce motion */
    .button.is-pressed:not(:disabled):not(.is-disabled) .button__surface,
    .button.is-enhanced-pressed:not(:disabled):not(.is-disabled) .button__surface {
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
