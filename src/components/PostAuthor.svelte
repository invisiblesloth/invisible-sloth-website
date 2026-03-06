<!--
/**
 * PostAuthor
 *
 * Content-only author byline block with optional avatar and responsive label
 * typography. Renders text-only when no usable image source is provided.
 *
 * @prop {string} name - Required author name; trimmed and rendered as text
 * @prop {string} imageSrc - Optional avatar source; ignored when empty after trim
 * @prop {string} imageAlt - Optional avatar alt text; defaults to decorative usage
 * @prop {string} class - Additional CSS classes for the root wrapper
 */
-->
<script lang="ts">
  let {
    name,
    imageSrc,
    imageAlt = '',
    class: className = '',
    ...restProps
  }: {
    name: string;
    imageSrc?: string;
    imageAlt?: string;
    class?: string;
    [key: string]: unknown;
  } = $props();

  const normalizedName = $derived.by(() => {
    const value = String(name ?? '').trim();

    if (value.length === 0) {
      throw new Error('PostAuthor requires a non-empty name.');
    }

    return value;
  });

  const normalizedImageSrc = $derived.by(() => {
    const value = String(imageSrc ?? '').trim();
    return value.length > 0 ? value : undefined;
  });

  const hasImage = $derived(Boolean(normalizedImageSrc));
  const postAuthorClasses = $derived(['post-author', className].filter(Boolean).join(' '));
</script>

<div class={postAuthorClasses} {...restProps}>
  {#if hasImage}
    <div class="post-author__avatar">
      <img class="post-author__image" src={normalizedImageSrc} alt={imageAlt} />
    </div>
  {/if}

  <div class="post-author__content">
    <p class="post-author__name">{normalizedName}</p>
  </div>
</div>

<style>
  .post-author {
    display: flex;
    align-items: center;
    gap: var(--space-400);
    inline-size: 100%;
    min-inline-size: 0;
    padding-block: var(--space-100);
    color: var(--color-on-surface);
  }

  .post-author__avatar {
    flex: 0 0 auto;
    inline-size: var(--space-1200);
    block-size: var(--space-1200);
    overflow: hidden;
    border-radius: var(--radius-full);
  }

  .post-author__image {
    display: block;
    inline-size: 100%;
    block-size: 100%;
    object-fit: cover;
    object-position: center;
  }

  .post-author__content {
    flex: 1 1 auto;
    min-inline-size: 0;
  }

  .post-author__name {
    margin: 0;
    inline-size: 100%;
    overflow-wrap: anywhere;
    font-family: var(--typography-label-large-family);
    font-size: var(--typography-label-large-size);
    font-weight: var(--typography-label-large-weight);
    line-height: var(--typography-label-large-line-height);
    letter-spacing: var(--typography-label-large-letter-spacing);
  }

  @media (min-width: 1015px) {
    .post-author__avatar {
      inline-size: var(--space-1600);
      block-size: var(--space-1600);
    }

    .post-author__name {
      font-family: var(--typography-label-extra-large-family);
      font-size: var(--typography-label-extra-large-size);
      font-weight: var(--typography-label-extra-large-weight);
      line-height: var(--typography-label-extra-large-line-height);
      letter-spacing: var(--typography-label-extra-large-letter-spacing);
    }
  }
</style>
