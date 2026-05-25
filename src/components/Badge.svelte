<script lang="ts">
  import {
    BADGE_VARIANTS,
    DEFAULT_BADGE_VARIANT,
    isBadgeVariant,
    normalizeBadgeVariant,
    normalizeBadgeVariantCandidate,
    type BadgeVariant,
  } from '../lib/badge';
  import { warnOnce } from '../lib/devWarnings';

  /**
   * Badge component for displaying labels with semantic color variants
   *
   * @prop {BadgeVariant} variant - Badge style variant (default: 'default')
   * @prop {string} label - Badge text label
   */
  let {
    variant = DEFAULT_BADGE_VARIANT,
    label = 'Label',
  }: {
    variant?: BadgeVariant;
    label?: string;
  } = $props();

  const normalizedCandidate = $derived(normalizeBadgeVariantCandidate(variant));
  const normalizedVariant = $derived(normalizeBadgeVariant(variant));
  const variantModifier = $derived(`badge--${normalizedVariant}`);

  $effect(() => {
    if (!isBadgeVariant(normalizedCandidate)) {
      warnOnce(
        'badge:invalid-variant',
        `[Badge] \`variant\` must be one of ${BADGE_VARIANTS.map((value) => `"${value}"`).join(', ')}. Falling back to "${DEFAULT_BADGE_VARIANT}".`
      );
    }
  });
</script>

<span class="badge {variantModifier}" title={label}>
  <span class="badge__label text-label-small-prominent">{label}</span>
</span>

<style>
  /* ==========================================
     BASE STRUCTURE
     Layout and positioning
     ========================================== */

  .badge {
    display: inline-flex;
    justify-content: center;
    align-items: center;
    gap: var(--space-200);
    box-sizing: border-box;
    max-width: 100%;

    height: var(--space-600);
    padding: var(--space-50) var(--space-200);
    border-radius: var(--radius-xs);

  }

  /* ==========================================
     VARIANT: DEFAULT
     Gray color scheme
     ========================================== */

  .badge--default {
    background-color: var(--color-badge-default);
    color: var(--color-on-badge-default);
  }

  /* ==========================================
     VARIANT: BOARDGAME
     Green color scheme for physical games
     ========================================== */
  
  .badge--boardgame {
    background-color: var(--color-badge-boardgame);
    color: var(--color-on-badge-boardgame);
  }
  
  /* ==========================================
     VARIANT: PLAYDATE
     Yellow color scheme for playdate console
     ========================================== */
  
  .badge--playdate {
    background-color: var(--color-badge-playdate);
    color: var(--color-on-badge-playdate);
  }
  
  /* ==========================================
     VARIANT: APPLE PLATFORMS
     Blue color scheme for Apple Platforms
     ========================================== */
  
  .badge--apple {
    background-color: var(--color-badge-apple);
    color: var(--color-on-badge-apple);
  }
  
  /* ==========================================
     VARIANT: WEB
     Light blue color scheme for web
     ========================================== */
  
  .badge--web {
    background-color: var(--color-badge-web);
    color: var(--color-on-badge-web);
  }
  
  /* ==========================================
     VARIANT: ERROR
     Red color scheme for warnings/errors
     ========================================== */
  
  .badge--error {
    background-color: var(--color-badge-error);
    color: var(--color-on-badge-error);
  }

  /* ==========================================
     TYPOGRAPHY
     Text styling matching Figma spec
     ========================================== */

  .badge__label {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
</style>
