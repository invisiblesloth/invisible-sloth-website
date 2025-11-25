<script lang="ts">
  /**
   * Standard Logo component with automatic dark mode support
   *
   * Displays the Invisible Sloth standard logo (full design for footers)
   * with automatic theme switching based on system preferences
   * (prefers-color-scheme) and manual theme override (data-theme attribute).
   *
   * @prop {string} size - Size variant ('sm', 'md', 'lg', 'xl') or custom CSS value (default: 'md')
   * @prop {string} alt - Alternative text for accessibility (default: 'Invisible Sloth')
   */
  let {
    size = 'md',
    alt = 'Invisible Sloth',
  }: {
    size?: 'sm' | 'md' | 'lg' | 'xl' | string;
    alt?: string;
  } = $props();

  // Map named sizes to pixel values
  const sizeMap = {
    sm: '48px',
    md: '96px',
    lg: '160px',
    xl: '192px',
  };

  // Use mapped size if it's a named size, otherwise use custom value
  const logoSize = $derived(size in sizeMap ? sizeMap[size as keyof typeof sizeMap] : size);
</script>

<div class="logo-standard" style="--logo-size: {logoSize}">
  <!--
    Uses CSS background-image with media queries for automatic dark mode.
    The logo image changes based on:
    1. System preference (prefers-color-scheme: dark)
    2. Manual override (html[data-theme="dark"])
  -->
  <div class="logo-standard__mark" role="img" aria-label={alt}></div>
</div>

<style>
  .logo-standard {
    display: inline-block;
    width: var(--logo-size);
    height: var(--logo-size);
  }

  .logo-standard__mark {
    width: 100%;
    height: 100%;
    background-image: url('/logos/logo-standard-light.svg');
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
  }

  /* Dark mode: Automatic system preference detection */
  @media (prefers-color-scheme: dark) {
    .logo-standard__mark {
      background-image: url('/logos/logo-standard-dark.svg');
    }
  }

  /* Dark mode: Manual theme override (future-proof for theme toggle) */
  :global(html[data-theme='dark']) .logo-standard__mark {
    background-image: url('/logos/logo-standard-dark.svg');
  }

  /* Light mode: Manual theme override (ensures light logo when explicitly set) */
  :global(html[data-theme='light']) .logo-standard__mark {
    background-image: url('/logos/logo-standard-light.svg');
  }
</style>
