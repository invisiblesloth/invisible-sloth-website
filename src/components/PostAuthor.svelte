<!--
/**
 * PostAuthor
 *
 * Content-only author byline block with optional avatar and component-scoped
 * label typography. Renders text-only when no usable image source is provided.
 * Author links apply to visible author names. Single-author linked avatars
 * duplicate that destination for pointer users while staying non-focusable and
 * hidden from assistive tech. The scalar avatar props render only for
 * single-author bylines.
 *
 * @prop {PostAuthorItem[]} authors - Optional author list; each item needs a non-empty name
 * @prop {string} name - Required author name when authors is empty
 * @prop {string} imageSrc - Optional avatar source; ignored when empty after trim
 * @prop {string} imageAlt - Optional avatar alt text; ignored for linked duplicate avatars
 * @prop {string} href - Optional single-author name URL; blank values render as text
 * @prop {string} target - Optional single-author link target
 * @prop {string} rel - Optional single-author link rel; _blank targets are hardened
 * @prop {string} class - Additional CSS classes for the root wrapper
 */
-->
<script module lang="ts">
  export type PostAuthorItem = {
    name: string;
    href?: string;
    target?: string;
    rel?: string;
  };
</script>

<script lang="ts">
  import { warnOnce } from '../lib/devWarnings';
  import { normalizeHref, normalizeRelForTarget, normalizeTarget } from '../lib/linkBehavior';

  type NormalizedPostAuthorItem = {
    name: string;
    href?: string;
    target?: string;
    rel?: string;
    hadHrefProp: boolean;
    index: number;
    key: string;
  };

  const resolveAuthors = (
    value: PostAuthorItem[] | undefined,
    fallback: PostAuthorItem
  ): NormalizedPostAuthorItem[] => {
    const usesAuthorList = Array.isArray(value) && value.length > 0;
    const source = usesAuthorList ? value : [fallback];
    const normalized = source.map((author, index) => {
      const normalizedName = String(author?.name ?? '').trim();

      if (normalizedName.length === 0) {
        throw new Error(
          usesAuthorList
            ? 'PostAuthor authors require non-empty names.'
            : 'PostAuthor requires a non-empty name when authors is empty.'
        );
      }

      const normalizedTarget = normalizeTarget(author?.target);

      return {
        name: normalizedName,
        href: normalizeHref(author?.href),
        target: normalizedTarget,
        rel: normalizeRelForTarget(normalizedTarget, author?.rel),
        hadHrefProp: author?.href !== undefined && author?.href !== null,
        index,
        key: `${normalizedName}:${index}`,
      };
    });

    if (normalized.length === 0) {
      throw new Error('PostAuthor requires at least one author.');
    }

    return normalized;
  };

  const getAuthorSeparator = (index: number, total: number): string => {
    if (index === 0) return '';
    if (total === 2) return ' and ';
    if (index === total - 1) return ', and ';
    return ', ';
  };

  let {
    authors = undefined,
    name = '',
    imageSrc,
    imageAlt = '',
    href,
    target,
    rel,
    class: className = '',
  }: {
    authors?: PostAuthorItem[];
    name?: string;
    imageSrc?: string;
    imageAlt?: string;
    href?: string;
    target?: string;
    rel?: string;
    class?: string;
  } = $props();

  const normalizedAuthors = $derived(
    resolveAuthors(authors, {
      name,
      href,
      target,
      rel,
    })
  );

  const normalizedImageSrc = $derived.by(() => {
    const value = String(imageSrc ?? '').trim();
    return value.length > 0 ? value : undefined;
  });
  const normalizedImageAlt = $derived(String(imageAlt ?? ''));

  const hasImage = $derived(Boolean(normalizedImageSrc) && normalizedAuthors.length === 1);
  const avatarAuthor = $derived(hasImage ? normalizedAuthors[0] : undefined);
  const postAuthorClasses = $derived(['post-author', className].filter(Boolean).join(' '));

  $effect(() => {
    for (const author of normalizedAuthors) {
      if (author.hadHrefProp && !author.href) {
        warnOnce(
          `post-author:invalid-href:${author.index}`,
          '[PostAuthor] `href` must resolve to a non-empty string after trimming. Rendering author name as text.'
        );
      }
    }
  });
</script>

<div class={postAuthorClasses}>
  {#if hasImage}
    {#if avatarAuthor?.href}
      <a
        class="post-author__avatar post-author__avatar-link"
        href={avatarAuthor.href}
        target={avatarAuthor.target}
        rel={avatarAuthor.rel}
        tabindex="-1"
        aria-hidden="true"
      >
        <img class="post-author__image" src={normalizedImageSrc} alt="" />
      </a>
    {:else}
      <div class="post-author__avatar">
        <img class="post-author__image" src={normalizedImageSrc} alt={normalizedImageAlt} />
      </div>
    {/if}
  {/if}

  <div class="post-author__content">
    <p class="post-author__name">
      {#each normalizedAuthors as author, index (author.key)}{#if index > 0}<span class="post-author__separator">{getAuthorSeparator(index, normalizedAuthors.length)}</span>{/if}{#if author.href}<a
            class="post-author__link text-link"
            href={author.href}
            target={author.target}
            rel={author.rel}>{author.name}</a
          >{:else}<span class="post-author__text">{author.name}</span>{/if}{/each}
    </p>
  </div>
</div>

<style>
  .post-author {
    display: flex;
    align-items: center;
    gap: var(--space-400);
    inline-size: 100%;
    min-inline-size: 0;
    color: var(--color-on-surface);
  }

  .post-author__link {
    color: inherit;
    font-weight: inherit;
  }

  .post-author__link:visited {
    color: inherit;
  }

  .post-author__avatar {
    display: block;
    flex: 0 0 auto;
    inline-size: var(--space-1200);
    block-size: var(--space-1200);
    overflow: hidden;
    border-radius: var(--radius-full);
  }

  .post-author__avatar-link {
    color: inherit;
    -webkit-tap-highlight-color: transparent;
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
    /* Metadata label treatment; not part of page/section heading scale. */
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
