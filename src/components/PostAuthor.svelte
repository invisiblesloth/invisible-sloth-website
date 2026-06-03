<!--
/**
 * PostAuthor
 *
 * Content-only author byline block with optional avatar and component-scoped
 * label typography. Renders text-only when no usable image source is provided.
 * Author identity and links are provided through authors. Single-author linked
 * avatars duplicate that destination for pointer users while staying
 * non-focusable and hidden from assistive tech. The scalar avatar props render
 * only for single-author bylines.
 *
 * Omitted, malformed, empty, or all-invalid authors render no DOM. Present
 * malformed authors warn in development. Blank-name authors are skipped, and
 * blank hrefs render the author name as text.
 *
 * @prop {PostAuthorItem[]} authors - Optional author list; each item needs a non-empty name
 * @prop {string} imageSrc - Optional avatar source; ignored when empty after trim
 * @prop {string} imageAlt - Optional avatar alt text; ignored for linked duplicate avatars
 * @prop {string} class - Additional CSS classes for the root wrapper
 */
-->
<script module lang="ts">
  import type { PostAuthorItem } from '../lib/postAuthors';

  export type PostAuthorProps = {
    authors?: PostAuthorItem[];
    imageSrc?: string;
    imageAlt?: string;
    class?: string;
  };
</script>

<script lang="ts">
  import { warnOnce } from '../lib/devWarnings';
  import { resolvePostAuthors } from '../lib/postAuthors';

  const getAuthorSeparator = (index: number, total: number): string => {
    if (index === 0) return '';
    if (total === 2) return ' and ';
    if (index === total - 1) return ', and ';
    return ', ';
  };

  let {
    authors = undefined,
    imageSrc,
    imageAlt = '',
    class: className = '',
  }: PostAuthorProps = $props();

  const authorResolution = $derived(resolvePostAuthors(authors));
  const normalizedAuthors = $derived(authorResolution.authors);

  const normalizedImageSrc = $derived.by(() => {
    const value = String(imageSrc ?? '').trim();
    return value.length > 0 ? value : undefined;
  });
  const normalizedImageAlt = $derived(String(imageAlt ?? ''));

  const hasImage = $derived(Boolean(normalizedImageSrc) && normalizedAuthors.length === 1);
  const avatarAuthor = $derived(hasImage ? normalizedAuthors[0] : undefined);
  const postAuthorClasses = $derived(['post-author', className].filter(Boolean).join(' '));

  $effect(() => {
    if (authorResolution.inputWasPresent && !authorResolution.inputWasArray) {
      warnOnce(
        'post-author:invalid-authors',
        '[PostAuthor] `authors` must be an array. Rendering without authors.'
      );
    }

    for (const index of authorResolution.invalidAuthorIndexes) {
      warnOnce(
        `post-author:invalid-author:${index}`,
        '[PostAuthor] Authors need non-empty name values. Skipping invalid author.'
      );
    }

    for (const index of authorResolution.blankHrefIndexes) {
      warnOnce(
        `post-author:blank-href:${index}`,
        '[PostAuthor] Author href values must resolve to non-empty strings after trimming. Rendering author name as text.'
      );
    }
  });
</script>

{#if normalizedAuthors.length > 0}
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
      <p class="post-author__name text-byline-author-responsive">
        {#each normalizedAuthors as author, index (author.key)}{#if index > 0}<span class="post-author__separator">{getAuthorSeparator(index, normalizedAuthors.length)}</span>{/if}{#if author.href}<a
              class="post-author__link text-link"
              href={author.href}
              target={author.target}
              rel={author.rel}>{author.name}</a
            >{:else}<span class="post-author__text">{author.name}</span>{/if}{/each}
      </p>
    </div>
  </div>
{/if}

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
  }

  @media (min-width: 1015px) {
    .post-author__avatar {
      inline-size: var(--space-1600);
      block-size: var(--space-1600);
    }
  }
</style>
