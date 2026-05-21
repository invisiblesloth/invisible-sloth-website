<!--
/**
 * PostHeader
 *
 * Storybook-documented blog post header composition with optional tags,
 * publication date, author byline, and featured media.
 *
 * Featured media defaults to a non-cropping art treatment so transparent or
 * designed assets are preserved. Use featured-cover only for photo covers that
 * may be cropped into a fixed frame.
 *
 * Only title is required. Publishing constraints for date, author, and media
 * belong in future content schemas rather than this presentation component.
 *
 * Caption/credit snippets pass through to Figure. Use `.text-link` for links
 * when the shared inline link treatment is needed.
 */
-->
<script module lang="ts">
  import type { FigureMediaTreatment } from './Figure.svelte';
  import type { PostAuthorItem } from './PostAuthor.svelte';
  import type { TagLink } from '../lib/tagLinks';

  export const POST_HEADER_MEDIA_TREATMENTS = [
    'featured-art',
    'featured-cover',
  ] as const satisfies readonly FigureMediaTreatment[];
  export type PostHeaderMediaTreatment = Extract<
    FigureMediaTreatment,
    'featured-art' | 'featured-cover'
  >;
  export type PostHeaderAuthor = PostAuthorItem;
  export type PostHeaderTag = TagLink;
</script>

<script lang="ts">
  import DetailHeader from './DetailHeader.svelte';
  import Figure from './Figure.svelte';
  import type { FigureCaptionContent } from './FigureCaption.svelte';
  import type { FigureImageProps } from './Figure.svelte';
  import PostAuthor from './PostAuthor.svelte';
  import PostDate from './PostDate.svelte';
  import Tag from './Tag.svelte';
  import TagGroup from './TagGroup.svelte';
  import { warnOnce } from '../lib/devWarnings';
  import { resolveTagLinks } from '../lib/tagLinks';

  const resolveImageProps = (value: unknown): FigureImageProps => {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      return value as FigureImageProps;
    }

    return {} as FigureImageProps;
  };

  const resolveMediaTreatment = (value: unknown): PostHeaderMediaTreatment => {
    if (
      typeof value === 'string' &&
      (POST_HEADER_MEDIA_TREATMENTS as readonly string[]).includes(value)
    ) {
      return value as PostHeaderMediaTreatment;
    }

    return 'featured-art';
  };

  type AuthorResolution = {
    authors: PostHeaderAuthor[];
    invalidIndexes: number[];
  };

  function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
  }

  const resolveAuthors = (
    input: unknown,
    fallbackAuthor: PostHeaderAuthor | undefined
  ): AuthorResolution => {
    if (Array.isArray(input) && input.length > 0) {
      const resolvedAuthors: PostHeaderAuthor[] = [];
      const invalidIndexes: number[] = [];

      input.forEach((author, index) => {
        const authorRecord = isRecord(author) ? author : undefined;
        const name = String(authorRecord?.name ?? '').trim();

        if (!authorRecord || !name) {
          invalidIndexes.push(index);
          return;
        }

        const resolvedAuthor: PostHeaderAuthor = { name };

        if (typeof authorRecord.href === 'string') {
          resolvedAuthor.href = authorRecord.href;
        }

        if (typeof authorRecord.target === 'string') {
          resolvedAuthor.target = authorRecord.target;
        }

        if (typeof authorRecord.rel === 'string') {
          resolvedAuthor.rel = authorRecord.rel;
        }

        resolvedAuthors.push(resolvedAuthor);
      });

      return {
        authors: resolvedAuthors,
        invalidIndexes,
      };
    }

    return {
      authors: fallbackAuthor ? [fallbackAuthor] : [],
      invalidIndexes: [],
    };
  };

  type Props = FigureCaptionContent & {
    title: string;
    excerpt?: string;
    date?: string;
    dateTime?: string;
    authorName?: string;
    authorImageSrc?: string;
    authorImageAlt?: string;
    authorHref?: string;
    authorTarget?: string;
    authorRel?: string;
    authors?: PostHeaderAuthor[];
    tags?: PostHeaderTag[];
    imageProps?: FigureImageProps;
    mediaTreatment?: PostHeaderMediaTreatment;
    class?: string;
  };

  let {
    title,
    excerpt = '',
    date = '',
    dateTime = '',
    authorName = '',
    authorImageSrc = '',
    authorImageAlt = '',
    authorHref = undefined,
    authorTarget = undefined,
    authorRel = undefined,
    authors = undefined,
    tags = [],
    imageProps = undefined,
    captionText = '',
    creditText = '',
    caption,
    credit,
    mediaTreatment: requestedMediaTreatment = 'featured-art',
    class: className = '',
  }: Props = $props();

  const postHeaderClasses = $derived(['post-header', className].filter(Boolean).join(' '));
  const normalizedDate = $derived(String(date ?? '').trim());
  const normalizedDateTime = $derived(String(dateTime ?? '').trim());
  const normalizedAuthorName = $derived(String(authorName ?? '').trim());
  const normalizedAuthorImageSrc = $derived(String(authorImageSrc ?? '').trim());
  const normalizedAuthorImageAlt = $derived(String(authorImageAlt ?? ''));
  const authorResolution = $derived(
    resolveAuthors(
      authors,
      normalizedAuthorName.length > 0
        ? {
            name: normalizedAuthorName,
            href: authorHref,
            target: authorTarget,
            rel: authorRel,
          }
        : undefined
    )
  );
  const resolvedAuthors = $derived(authorResolution.authors);
  const resolvedImageProps = $derived(resolveImageProps(imageProps));
  const resolvedMediaTreatment = $derived(resolveMediaTreatment(requestedMediaTreatment));
  const hasDate = $derived(normalizedDate.length > 0);
  const hasAuthor = $derived(resolvedAuthors.length > 0);
  const hasAuthorImage = $derived(
    hasAuthor && resolvedAuthors.length === 1 && normalizedAuthorImageSrc.length > 0
  );
  const hasImage = $derived(String(resolvedImageProps.src ?? '').trim().length > 0);
  const tagResolution = $derived(resolveTagLinks(tags));
  const normalizedTags = $derived(tagResolution.links);
  const hasTags = $derived(normalizedTags.length > 0);

  $effect(() => {
    if (requestedMediaTreatment !== resolvedMediaTreatment) {
      warnOnce(
        'post-header:invalid-media-treatment',
        `[PostHeader] \`mediaTreatment\` must be one of ${POST_HEADER_MEDIA_TREATMENTS.map((treatment) => `"${treatment}"`).join(', ')}. Falling back to "featured-art".`
      );
    }

    if (!tagResolution.inputWasArray) {
      warnOnce(
        'post-header:invalid-tags',
        '[PostHeader] `tags` must be an array. Rendering without tags.'
      );
    }

    for (const index of tagResolution.invalidIndexes) {
      warnOnce(
        `post-header:invalid-tag:${index}`,
        '[PostHeader] Tags need non-empty label and href values. Skipping invalid tag.'
      );
    }

    for (const index of authorResolution.invalidIndexes) {
      warnOnce(
        `post-header:invalid-author:${index}`,
        '[PostHeader] Authors need non-empty name values. Skipping invalid author.'
      );
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
    <div class="post-header__content-rail post-header__date-section">
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
    <div class="post-header__content-rail post-header__author-section">
      <PostAuthor
        authors={resolvedAuthors}
        imageSrc={hasAuthorImage ? normalizedAuthorImageSrc : undefined}
        imageAlt={normalizedAuthorImageAlt}
      />
    </div>
  {/if}

  {#if hasImage}
    <div class="post-header__image-rail">
      <Figure
        imageProps={resolvedImageProps}
        mediaTreatment={resolvedMediaTreatment}
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

  .post-header__content-rail :global(.post-header__tag-group),
  .post-header__date-section,
  .post-header__author-section {
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
