<script lang="ts">
  /**
   * StandardCard component for blog/article cards
   *
   * Grid-friendly card with kicker, title, excerpt, date, and author.
   * Uses CSS container queries to adapt typography based on card width.
   *
   * @prop {string} href - Card link URL
   * @prop {string} kicker - Small text above title (category/tag)
   * @prop {string} title - Card title/headline
   * @prop {string} description - Card excerpt/description
   * @prop {string} date - Publication date
   * @prop {string} author - Author name
   * @prop {string} image - Optional image URL
   * @prop {string} imageAlt - Alt text for image
   */

  let {
    href = '#',
    kicker = 'Kicker',
    title = 'Card Title',
    description = 'Card excerpt.',
    date = 'Card Date',
    author = 'Author',
    image,
    imageAlt = '',
  }: {
    href?: string;
    kicker?: string;
    title?: string;
    description?: string;
    date?: string;
    author?: string;
    image?: string;
    imageAlt?: string;
  } = $props();
</script>

<article class="standard-card">
  <a {href} class="standard-card__surface" aria-label={title}>
    <!-- State layer for hover/focus/pressed feedback -->
    <div class="standard-card__state-layer" aria-hidden="true"></div>

    <!-- Image container with 3:2 aspect ratio -->
    {#if image}
      <div class="standard-card__image-container">
        <img src={image} alt={imageAlt} class="standard-card__image" />
      </div>
    {:else}
      <div class="standard-card__image-container standard-card__image-container--placeholder" aria-hidden="true"></div>
    {/if}

    <!-- Card content -->
    <div class="standard-card__content">
      <p class="standard-card__kicker text-title-medium">{kicker}</p>
      <h3 class="standard-card__title text-display-extra-small">{title}</h3>
      <p class="standard-card__description text-body-small">{description}</p>

      <div class="standard-card__footer">
        <p class="standard-card__date text-label-large">{date}</p>
        <p class="standard-card__author text-title-small">{author}</p>
      </div>
    </div>
  </a>
</article>

<style>
  /* ========================================================================= */
  /* Card Wrapper & Container                                                  */
  /* ========================================================================= */

  .standard-card {
    --card-transition: 150ms cubic-bezier(0.4, 0, 0.2, 1);

    position: relative;
    width: 100%;
    max-width: 430px;
    container-type: inline-size;
    container-name: card;
  }

  /* ========================================================================= */
  /* Card Surface (clickable link)                                             */
  /* ========================================================================= */

  .standard-card__surface {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    width: 100%;
    background-color: var(--color-surface-container);
    color: var(--color-on-surface);
    border-radius: var(--radius-lg);
    text-decoration: none;
    overflow: hidden;
    transition: transform var(--card-transition);
  }

  /* ========================================================================= */
  /* State Layer (hover/focus/pressed feedback)                                */
  /* ========================================================================= */

  .standard-card__state-layer {
    position: absolute;
    inset: 0;
    background-color: currentColor;
    opacity: 0;
    transition: opacity var(--card-transition);
    pointer-events: none;
    z-index: 0;
  }

  /* ========================================================================= */
  /* Image Container (3:2 aspect ratio)                                        */
  /* ========================================================================= */

  .standard-card__image-container {
    position: relative;
    width: 100%;
    aspect-ratio: 3 / 2;
    overflow: hidden;
  }

  .standard-card__image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .standard-card__image-container--placeholder {
    background: linear-gradient(135deg, var(--color-green-050) 0%, var(--color-green-060) 100%);
  }

  /* ========================================================================= */
  /* Card Content                                                              */
  /* ========================================================================= */

  .standard-card__content {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-400);
    width: 100%;
    padding: var(--space-600);
  }

  /* ========================================================================= */
  /* Typography - Responsive via Container Queries                             */
  /* ========================================================================= */

  .standard-card__kicker {
    margin: 0;
    width: 100%;
    color: var(--color-on-surface-dim);
    line-height: 1;
  }

  .standard-card__title {
    margin: 0;
    width: 100%;
    color: var(--color-on-surface);
    transition: text-decoration-color var(--card-transition);
  }

  .standard-card__description {
    margin: 0;
    width: 100%;
    color: var(--color-on-surface);
  }

  .standard-card__footer {
    display: flex;
    flex-direction: column;
    gap: var(--space-200);
    width: 100%;
  }

  .standard-card__date {
    margin: 0;
    width: 100%;
    color: var(--color-on-surface);
  }

  .standard-card__author {
    margin: 0;
    width: 100%;
    color: var(--color-on-surface-dim);
  }

  /* ========================================================================= */
  /* Container Query: Larger Cards (360px+)                                    */
  /* ========================================================================= */

  @container card (min-width: 360px) {
    .standard-card__kicker {
      /* title-large */
      font-family: var(--typography-title-large-family);
      font-size: var(--typography-title-large-size);
      font-weight: var(--typography-title-large-weight);
      line-height: var(--typography-title-large-line-height);
      letter-spacing: var(--typography-title-large-letter-spacing);
    }

    .standard-card__title {
      /* display-small */
      font-family: var(--typography-display-small-family);
      font-size: var(--typography-display-small-size);
      line-height: var(--typography-display-small-line-height);
      letter-spacing: var(--typography-display-small-letter-spacing);
    }

    .standard-card__description {
      /* body-medium */
      font-family: var(--typography-body-medium-family);
      font-size: var(--typography-body-medium-size);
      line-height: var(--typography-body-medium-line-height);
      letter-spacing: var(--typography-body-medium-letter-spacing);
    }

    .standard-card__date {
      /* label-extra-large */
      font-family: var(--typography-label-extra-large-family);
      font-size: var(--typography-label-extra-large-size);
      font-weight: var(--typography-label-extra-large-weight);
      line-height: var(--typography-label-extra-large-line-height);
      letter-spacing: var(--typography-label-extra-large-letter-spacing);
    }

    .standard-card__author {
      /* title-medium */
      font-family: var(--typography-title-medium-family);
      font-size: var(--typography-title-medium-size);
      font-weight: var(--typography-title-medium-weight);
      line-height: var(--typography-title-medium-line-height);
      letter-spacing: var(--typography-title-medium-letter-spacing);
    }
  }

  /* ========================================================================= */
  /* Interactive States - Desktop (hover: hover)                               */
  /* ========================================================================= */

  @media (hover: hover) and (pointer: fine) {
    /* Hover - lift card with elevation shadow and state layer */
    .standard-card:hover .standard-card__surface {
      transform: translate(-2px, -4px);
      box-shadow:
        1px 1px 4px 0px rgba(0, 0, 0, 0.08),
        4px 4px 7px 0px rgba(0, 0, 0, 0.04),
        6px 6px 14px 0px rgba(0, 0, 0, 0.04),
        3px 3px 7px 0px rgba(0, 0, 0, 0.02);
    }

    .standard-card:hover .standard-card__state-layer {
      opacity: var(--state-hover); /* 0.08 */
    }

    /* Hover - underline title */
    .standard-card:hover .standard-card__title {
      text-decoration: underline;
      text-decoration-thickness: 1px;
      text-decoration-color: var(--color-on-surface);
      text-underline-position: from-font;
    }

    /* Active/Pressed - return to origin */
    .standard-card:active .standard-card__surface {
      transform: translate(0, 0);
      box-shadow: none;
      transition-duration: 50ms;
    }

    .standard-card:active .standard-card__state-layer {
      opacity: var(--state-pressed); /* 0.12 */
      transition-duration: 50ms;
    }
  }

  /* ========================================================================= */
  /* Interactive States - Touch Devices (hover: none)                          */
  /* ========================================================================= */

  @media (hover: none) and (pointer: coarse) {
    /* Touch devices - default lifted state */
    .standard-card__surface {
      transform: translate(-2px, -4px);
      box-shadow:
        1px 1px 4px 0px rgba(0, 0, 0, 0.08),
        4px 4px 7px 0px rgba(0, 0, 0, 0.04),
        6px 6px 14px 0px rgba(0, 0, 0, 0.04),
        3px 3px 7px 0px rgba(0, 0, 0, 0.02);
    }

    /* Active/Pressed - return to origin */
    .standard-card:active .standard-card__surface {
      transform: translate(0, 0);
      box-shadow: none;
    }

    .standard-card:active .standard-card__state-layer {
      opacity: var(--state-pressed); /* 0.12 */
    }

    /* Touch - underline title on active */
    .standard-card:active .standard-card__title {
      text-decoration: underline;
      text-decoration-thickness: 1px;
      text-decoration-color: var(--color-on-surface);
      text-underline-position: from-font;
    }
  }

  /* ========================================================================= */
  /* Focus State (keyboard navigation)                                         */
  /* ========================================================================= */

  .standard-card__surface:focus-visible {
    outline: var(--focus-outline-width) solid var(--color-focus);
    outline-offset: 0;
    transform: translate(0, 0); /* Stay in place on focus */
  }

  /* Focus - inner white ring */
  .standard-card__surface:focus-visible::before {
    content: "";
    position: absolute;
    inset: 0;
    border: var(--focus-ring-width) solid var(--color-on-focus);
    border-radius: inherit;
    pointer-events: none;
    z-index: 10;
  }

  /* Focus - state layer */
  .standard-card__surface:focus-visible .standard-card__state-layer {
    opacity: var(--state-focus); /* 0.12 */
  }

  /* Focus + Hover - disable transform on hover when focused */
  .standard-card__surface:focus-visible:hover {
    transform: translate(0, 0);
    box-shadow: none;
  }

  /* Focus + Active - apply pressed state */
  .standard-card__surface:focus-visible:active .standard-card__state-layer {
    opacity: var(--state-pressed); /* 0.12 */
    transition-duration: 50ms;
  }

  /* ========================================================================= */
  /* Reduced Motion Support                                                    */
  /* ========================================================================= */

  @media (prefers-reduced-motion: reduce) {
    .standard-card__surface,
    .standard-card__state-layer,
    .standard-card__title {
      transition: none;
    }

    .standard-card:hover .standard-card__surface,
    .standard-card:active .standard-card__surface {
      transform: none;
    }
  }
</style>
