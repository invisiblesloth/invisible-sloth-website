<script lang="ts">
  /**
   * Technical Logo component with system and manual theme support
   *
   * Displays the Invisible Sloth technical logo (simplified design for headers)
   * using the global theme contract: no data-theme follows system preference,
   * while data-theme="light" or "dark" forces the matching logo.
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

<div class="logo-technical" style="--logo-size: {logoSize}">
  <!--
    Uses CSS background-image with the global theme contract.
    The logo image changes based on:
    1. System preference (prefers-color-scheme: dark)
    2. Manual override (html[data-theme])
  -->
  <div class="logo-technical__mark" role="img" aria-label={alt}></div>
</div>

<style>
  .logo-technical {
    display: inline-block;
    width: var(--logo-size);
    height: var(--logo-size);
  }

  .logo-technical__mark {
    width: 100%;
    height: 100%;
    background-image: url('/logos/logo-technical-light.svg');
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
  }

  /* System dark route */
  @media (prefers-color-scheme: dark) {
    .logo-technical__mark {
      background-image: url('/logos/logo-technical-dark.svg');
    }
  }

  /* Manual dark route */
  :global(html[data-theme='dark']) .logo-technical__mark {
    background-image: url('/logos/logo-technical-dark.svg');
  }

  /* Manual light route */
  :global(html[data-theme='light']) .logo-technical__mark {
    background-image: url('/logos/logo-technical-light.svg');
  }
</style>
