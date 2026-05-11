<!--
/**
 * PostHeader
 *
 * Storybook-documented blog post header composition with optional tags,
 * publication date, author byline, and featured media.
 *
 * Only title is required. Publishing constraints for date, author, and media
 * belong in future content schemas rather than this presentation component.
 */
-->
<script module lang="ts">
  export type PostHeaderTag = {
    label: string;
    href: string;
    target?: string;
    rel?: string;
  };
</script>

<script lang="ts">
  import type { ComponentProps, Snippet } from 'svelte';
  import DetailHeader from './DetailHeader.svelte';
  import Figure from './Figure.svelte';
  import Image from './Image.svelte';
  import PostAuthor from './PostAuthor.svelte';
  import PostDate from './PostDate.svelte';
  import Tag from './Tag.svelte';
  import TagGroup from './TagGroup.svelte';
  import { warnOnce } from '../lib/devWarnings';
  import { normalizeHref } from '../lib/linkBehavior';

  type ImageProps = ComponentProps<typeof Image>;
  type ResolvedPostHeaderTag = PostHeaderTag & {
    index: number;
  };
  type TagResolution = ResolvedPostHeaderTag | {
    index: number;
    invalid: true;
  };

  let {
    title,
    excerpt = '',
    date = '',
    dateTime = '',
    authorName = '',
    authorImageSrc = '',
    authorImageAlt = '',
    tags = [],
    imageProps = undefined,
    captionText = '',
    creditText = '',
    caption,
    credit,
    class: className = '',
  }: {
    title: string;
    excerpt?: string;
    date?: string;
    dateTime?: string;
    authorName?: string;
    authorImageSrc?: string;
    authorImageAlt?: string;
    tags?: PostHeaderTag[];
    imageProps?: ImageProps;
    captionText?: string;
    creditText?: string;
    caption?: Snippet;
    credit?: Snippet;
    class?: string;
  } = $props();

  const postHeaderClasses = $derived(['post-header', className].filter(Boolean).join(' '));
  const normalizedDate = $derived(String(date ?? '').trim());
  const normalizedDateTime = $derived(String(dateTime ?? '').trim());
  const normalizedAuthorName = $derived(String(authorName ?? '').trim());
  const normalizedAuthorImageSrc = $derived(String(authorImageSrc ?? '').trim());
  const normalizedAuthorImageAlt = $derived(String(authorImageAlt ?? ''));
  const resolvedImageProps = $derived.by((): ImageProps => {
    if (imageProps && typeof imageProps === 'object') {
      return imageProps;
    }

    return {} as ImageProps;
  });
  const hasDate = $derived(normalizedDate.length > 0);
  const hasAuthor = $derived(normalizedAuthorName.length > 0);
  const hasAuthorImage = $derived(hasAuthor && normalizedAuthorImageSrc.length > 0);
  const hasImage = $derived(String(resolvedImageProps.src ?? '').trim().length > 0);
  const tagInputs = $derived(Array.isArray(tags) ? tags : []);
  const resolvedTags = $derived.by((): TagResolution[] =>
    tagInputs.map((tag, index) => {
      const label = String(tag?.label ?? '').trim();
      const href = normalizeHref(tag?.href);

      if (!label || !href) {
        return { index, invalid: true };
      }

      return {
        index,
        label,
        href,
        target: tag.target,
        rel: tag.rel,
      };
    })
  );
  const normalizedTags = $derived(
    resolvedTags.filter((tag): tag is ResolvedPostHeaderTag => !('invalid' in tag))
  );
  const hasTags = $derived(normalizedTags.length > 0);
  const postHeaderImageProps = $derived.by((): ImageProps => {
    const imageClass = ['post-header__media', resolvedImageProps.class].filter(Boolean).join(' ');

    return {
      ...resolvedImageProps,
      class: imageClass,
      frame: 'ratio',
      ratio: '3:2',
      fit: 'cover',
      radius: 'small',
    };
  });

  $effect(() => {
    if (!Array.isArray(tags)) {
      warnOnce(
        'post-header:invalid-tags',
        '[PostHeader] `tags` must be an array. Rendering without tags.'
      );
    }

    for (const tag of resolvedTags) {
      if ('invalid' in tag) {
        warnOnce(
          `post-header:invalid-tag:${tag.index}`,
          '[PostHeader] Tags need non-empty label and href values. Skipping invalid tag.'
        );
      }
    }
  });
</script>

<header class={postHeaderClasses}>
  {#if hasTags}
    <div class="post-header__content-rail">
      <TagGroup class="post-header__tag-group">
        {#each normalizedTags as tag (tag.href + ':' + tag.index)}
          <Tag
            label={tag.label}
            href={tag.href}
            target={tag.target}
            rel={tag.rel}
          />
        {/each}
      </TagGroup>
    </div>
  {/if}

  {#if hasDate}
    <div class="post-header__content-rail">
      <PostDate
        date={normalizedDate}
        dateTime={normalizedDateTime || undefined}
      />
    </div>
  {/if}

  <div class="post-header__content-rail">
    <DetailHeader {title} {excerpt} />
  </div>

  {#if hasAuthor}
    <div class="post-header__content-rail">
      <PostAuthor
        name={normalizedAuthorName}
        imageSrc={hasAuthorImage ? normalizedAuthorImageSrc : undefined}
        imageAlt={normalizedAuthorImageAlt}
      />
    </div>
  {/if}

  {#if hasImage}
    <div class="post-header__image-rail">
      <Figure
        imageProps={postHeaderImageProps}
        {captionText}
        {creditText}
        {caption}
        {credit}
        class="post-header__figure"
      />
    </div>
  {/if}
</header>

<style>
  .post-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-400);
    inline-size: 100%;
    padding-block-end: var(--space-section-block);
    color: var(--color-on-surface);
  }

  .post-header__content-rail,
  .post-header__image-rail {
    inline-size: 100%;
    margin-inline: auto;
    padding-inline: var(--space-rail-inline);
  }

  .post-header__content-rail {
    max-inline-size: var(--size-rail-lg);
  }

  .post-header__image-rail {
    max-inline-size: var(--size-rail-lg);
  }

  .post-header__figure {
    inline-size: 100%;
  }

  .post-header__content-rail :global(.post-header__tag-group) {
    padding-block: var(--space-100);
  }

  @media (min-width: 1015px) {
    .post-header__content-rail :global(.post-header__tag-group) {
      padding-block: var(--space-200);
    }
  }

  @media (min-width: 1176px) {
    .post-header__content-rail,
    .post-header__image-rail {
      padding-inline: 0;
    }

    .post-header__content-rail {
      max-inline-size: var(--size-rail-sm);
    }
  }
</style>
