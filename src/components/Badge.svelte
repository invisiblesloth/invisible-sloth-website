<script lang="ts">
  /**
   * Badge component for displaying labels with semantic color variants
   *
   * @prop {string} variant - Badge style variant (default: 'default')
   * @prop {string} label - Badge text label
   */
  let {
    variant = 'default',
    label = 'Label',
  }: {
    variant?: 'default' | 'boardgame' | 'playdate' | 'apple' | 'error' | 'web';
    label?: string;
  } = $props();

  const normalizeVariant = (value?: string, fallback: string = 'default') => {
    if (!value) return fallback;
    const sanitized = value.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-');
    return sanitized || fallback;
  };

  const variantModifier = $derived(`badge--${normalizeVariant(variant, 'default')}`);
</script>

<span class="badge {variantModifier}" role="status">
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

    height: var(--space-600);
    padding: var(--space-50) var(--space-200);
    border-radius: var(--radius-xs);

    /* Badge is non-interactive */
    pointer-events: none;
  }

  /* ==========================================
     VARIANT: DEFAULT
     Gray color scheme
     ========================================== */

  .badge--default {
    background-color: var(--color-inverse-secondary);
    color: var(--color-on-inverse-secondary);
  }

  /* ==========================================
     VARIANT: BOARDGAME
     Green color scheme for physical games
     ========================================== */
  
  .badge--boardgame {
    background-color: var(--color-green-070);
    color: #092700;
  }
  
  /* ==========================================
     VARIANT: PLAYDATE
     Yellow color scheme for playdate console
     ========================================== */
  
  .badge--playdate {
    background-color: #FCB426;
    color: #040707;
  }
  
  /* ==========================================
     VARIANT: APPLE PLATFORMS
     Blue color scheme for Apple Platforms
     ========================================== */
  
  .badge--apple {
    background-color: #0071E3;
    color: #FFFFFF;
  }
  
  /* ==========================================
     VARIANT: WEB
     Light blue color scheme for web
     ========================================== */
  
  .badge--web {
    background-color: var(--color-inverse-tertiary);
    color: var(--color-on-inverse-tertiary);
  }
  
  /* ==========================================
     VARIANT: ERROR
     Red color scheme for warnings/errors
     ========================================== */
  
  .badge--error {
    background-color: var(--color-inverse-error);
    color: var(--color-on-inverse-error);
  }

  /* ==========================================
     TYPOGRAPHY
     Text styling matching Figma spec
     ========================================== */

  .badge__label {
    white-space: nowrap;
  }
</style>
