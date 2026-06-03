<script module lang="ts">
  import Image, { type ImageProps } from './Image.svelte';

  export type StandardCardImage = Pick<
    ImageProps,
    | 'src'
    | 'srcset'
    | 'sizes'
    | 'alt'
    | 'decorative'
    | 'width'
    | 'height'
    | 'loading'
    | 'decoding'
    | 'fetchPriority'
    | 'fallbackSrc'
    | 'fallbackSrcset'
    | 'fallbackSizes'
    | 'fallbackAlt'
    | 'fallbackWidth'
    | 'fallbackHeight'
  >;

  type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;
  type HeadingTag = `h${HeadingLevel}`;

  export type StandardCardProps = {
    href: string;
    title: string;
    target?: string;
    rel?: string;
    linkLabel?: string;
    headingLevel?: HeadingLevel;
    kicker?: string;
    description?: string;
    date?: string;
    dateTime?: string;
    author?: string;
    image?: StandardCardImage;
    class?: string;
  };
</script>

<script lang="ts">
  /**
   * StandardCard component for article and summary cards.
   *
   * Whole-card navigation is required. Parent layouts own outer width and
   * placement; this component owns only its internal card presentation.
   * Root-hook component: `class` is appended to the root <article> for
   * layout hooks, global utilities, and global selectors.
   *
   * @prop {string} href - Required non-empty card link URL, normalized through shared link helpers
   * @prop {string} title - Required non-empty card title/headline, trimmed at the boundary
   * @prop {string} target - Optional link target
   * @prop {string} rel - Optional link rel; _blank links are hardened
   * @prop {string} linkLabel - Optional explicit accessible name for the card link
   * @prop {number} headingLevel - Semantic title heading level, from 1 to 6
   * @prop {string} kicker - Optional small text above title
   * @prop {string} description - Optional card excerpt/description
   * @prop {string} date - Optional human-readable publication date
   * @prop {string} dateTime - Optional machine-readable datetime value
   * @prop {string} author - Optional author name rendered as plain text
   * @prop {StandardCardImage} image - Optional image input rendered through Image
   * @prop {string} class - Additional classes appended to the root article
   */
  import { requireNonEmptyString } from '../lib/componentValidation';
  import { normalizeHref, normalizeRelForTarget, normalizeTarget } from '../lib/linkBehavior';

  const VALID_HEADING_LEVELS = new Set([1, 2, 3, 4, 5, 6]);

  let {
    href,
    title,
    target,
    rel,
    linkLabel,
    headingLevel = 3,
    kicker = '',
    description = '',
    date = '',
    dateTime = '',
    author = '',
    image,
    class: className = '',
  }: StandardCardProps = $props();

  function normalizeOptionalString(value: unknown): string {
    return typeof value === 'string' ? value.trim() : '';
  }

  function normalizeRequiredHref(value: unknown): string {
    return requireNonEmptyString(normalizeHref(typeof value === 'string' ? value : undefined), {
      componentName: 'StandardCard',
      propName: 'href',
    });
  }

  function normalizeNonEmptyString(value: unknown): string | undefined {
    const normalizedValue = normalizeOptionalString(value);
    return normalizedValue.length > 0 ? normalizedValue : undefined;
  }

  function normalizeHeadingLevel(value: unknown): HeadingLevel {
    return typeof value === 'number' && VALID_HEADING_LEVELS.has(value)
      ? (value as HeadingLevel)
      : 3;
  }

  const normalizedHref = $derived(normalizeRequiredHref(href));
  const normalizedTitle = $derived(
    requireNonEmptyString(title, { componentName: 'StandardCard', propName: 'title' })
  );
  const normalizedTarget = $derived<string | undefined>(normalizeTarget(target));
  const normalizedRel = $derived<string | undefined>(
    normalizeRelForTarget(normalizedTarget, typeof rel === 'string' ? rel : undefined)
  );
  const normalizedLinkLabel = $derived(normalizeOptionalString(linkLabel));
  const linkAriaLabel = $derived(normalizedLinkLabel.length > 0 ? normalizedLinkLabel : undefined);
  const resolvedHeadingLevel = $derived(normalizeHeadingLevel(headingLevel));
  const headingTag = $derived(`h${resolvedHeadingLevel}` as HeadingTag);

  const normalizedKicker = $derived(normalizeOptionalString(kicker));
  const normalizedDescription = $derived(normalizeOptionalString(description));
  const normalizedDate = $derived(normalizeOptionalString(date));
  const normalizedDateTime = $derived(normalizeNonEmptyString(dateTime));
  const normalizedAuthor = $derived(normalizeOptionalString(author));
  const hasKicker = $derived(normalizedKicker.length > 0);
  const hasDescription = $derived(normalizedDescription.length > 0);
  const hasDate = $derived(normalizedDate.length > 0);
  const hasAuthor = $derived(normalizedAuthor.length > 0);
  const hasFooter = $derived(hasDate || hasAuthor);
  const normalizedClassName = $derived(String(className ?? '').trim());
  const standardCardClasses = $derived(
    ['standard-card', normalizedClassName].filter(Boolean).join(' ')
  );

  const normalizedImageSrc = $derived.by(() => {
    return normalizeNonEmptyString(image?.src);
  });
  const normalizedImageAlt = $derived(normalizeOptionalString(image?.alt));
  const requestedImageDecorative = $derived(
    typeof image?.decorative === 'boolean' ? image.decorative : undefined
  );
  const imageDecorative = $derived(requestedImageDecorative ?? normalizedImageAlt.length === 0);
  const imageProps = $derived.by((): ImageProps | undefined => {
    if (!image || !normalizedImageSrc) {
      return undefined;
    }

    return {
      src: normalizedImageSrc,
      srcset: image.srcset,
      sizes: image.sizes,
      alt: normalizedImageAlt,
      decorative: imageDecorative,
      width: image.width,
      height: image.height,
      loading: image.loading,
      decoding: image.decoding,
      fetchPriority: image.fetchPriority,
      fallbackSrc: image.fallbackSrc,
      fallbackSrcset: image.fallbackSrcset,
      fallbackSizes: image.fallbackSizes,
      fallbackAlt: image.fallbackAlt,
      fallbackWidth: image.fallbackWidth,
      fallbackHeight: image.fallbackHeight,
      frame: 'ratio',
      ratio: '3:2',
      fit: 'cover',
      radius: 'none',
    };
  });
</script>

<article class={standardCardClasses}>
  <a
    href={normalizedHref}
    target={normalizedTarget}
    rel={normalizedRel}
    class="standard-card__surface"
    aria-label={linkAriaLabel}
  >
    <div class="standard-card__state-layer" aria-hidden="true"></div>

    {#if imageProps}
      <div class="standard-card__media">
        <Image {...imageProps} />
      </div>
    {/if}

    <div class="standard-card__content">
      {#if hasKicker}
        <p class="standard-card__kicker text-summary-card-kicker">{normalizedKicker}</p>
      {/if}

      <svelte:element this={headingTag} class="standard-card__title text-summary-card-title">
        {normalizedTitle}
      </svelte:element>

      {#if hasDescription}
        <p class="standard-card__description text-summary-card-description">
          {normalizedDescription}
        </p>
      {/if}

      {#if hasFooter}
        <div class="standard-card__footer">
          {#if hasDate}
            {#if normalizedDateTime}
              <time
                class="standard-card__date text-summary-card-date"
                datetime={normalizedDateTime}
              >
                {normalizedDate}
              </time>
            {:else}
              <span class="standard-card__date text-summary-card-date">
                {normalizedDate}
              </span>
            {/if}
          {/if}

          {#if hasAuthor}
            <p class="standard-card__author text-summary-card-author">{normalizedAuthor}</p>
          {/if}
        </div>
      {/if}
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
    inline-size: 100%;
    container-type: inline-size;
    container-name: summary-card;
  }

  /* ========================================================================= */
  /* Card Surface (clickable link)                                             */
  /* ========================================================================= */

  .standard-card__surface {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    inline-size: 100%;
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
  /* Card Media                                                                */
  /* ========================================================================= */

  .standard-card__media {
    position: relative;
    z-index: 1;
    inline-size: 100%;
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
    inline-size: 100%;
    padding: var(--space-600);
  }

  /* ========================================================================= */
  /* Text Elements                                                             */
  /* ========================================================================= */

  .standard-card__kicker {
    margin: 0;
    inline-size: 100%;
    color: var(--color-on-surface-dim);
  }

  .standard-card__title {
    margin: 0;
    inline-size: 100%;
    color: var(--color-on-surface);
    transition: text-decoration-color var(--card-transition);
  }

  .standard-card__description {
    margin: 0;
    inline-size: 100%;
    color: var(--color-on-surface);
  }

  .standard-card__footer {
    display: flex;
    flex-direction: column;
    gap: var(--space-200);
    inline-size: 100%;
  }

  .standard-card__date {
    display: block;
    margin: 0;
    inline-size: 100%;
    color: var(--color-on-surface);
  }

  .standard-card__author {
    margin: 0;
    inline-size: 100%;
    color: var(--color-on-surface-dim);
  }

  /* ========================================================================= */
  /* Interactive States - Desktop (hover: hover)                               */
  /* ========================================================================= */

  @media (hover: hover) and (pointer: fine) {
    /* Hover - lift card with elevation shadow and state layer */
    .standard-card:hover .standard-card__surface {
      transform: translate(-2px, -4px);
      box-shadow: var(--effect-standard-card-lift);
    }

    .standard-card:hover .standard-card__state-layer {
      opacity: var(--state-hover); /* 0.08 */
    }

    /* Hover - underline title */
    .standard-card:hover .standard-card__title {
      text-decoration: underline;
      text-decoration-thickness: 0.16em;
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
      box-shadow: var(--effect-standard-card-lift);
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
      text-decoration-thickness: 0.16em;
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
