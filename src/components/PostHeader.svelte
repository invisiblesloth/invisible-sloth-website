<!--
/**
 * PostHeader
 *
 * Storybook-documented blog post header composition with optional tags,
 * publication date, author byline, and featured media.
 * Author identity and links are provided through authors. Avatar props are
 * single-author presentation data.
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
  import type { PostAuthorItem } from '../lib/postAuthors';
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
  import { resolvePostAuthors } from '../lib/postAuthors';
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

  type Props = FigureCaptionContent & {
    title: string;
    excerpt?: string;
    date?: string;
    dateTime?: string;
    authorImageSrc?: string;
    authorImageAlt?: string;
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
    authorImageSrc = '',
    authorImageAlt = '',
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
  const normalizedAuthorImageSrc = $derived(String(authorImageSrc ?? '').trim());
  const normalizedAuthorImageAlt = $derived(String(authorImageAlt ?? ''));
  const authorResolution = $derived(resolvePostAuthors(authors));
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

    if (authorResolution.inputWasPresent && !authorResolution.inputWasArray) {
      warnOnce(
        'post-header:invalid-authors',
        '[PostHeader] `authors` must be an array. Rendering without authors.'
      );
    }

    for (const index of authorResolution.invalidAuthorIndexes) {
      warnOnce(
        `post-header:invalid-author:${index}`,
        '[PostHeader] Authors need non-empty name values. Skipping invalid author.'
      );
    }

    for (const index of authorResolution.blankHrefIndexes) {
      warnOnce(
        `post-header:blank-href:${index}`,
        '[PostHeader] Author href values must resolve to non-empty strings after trimming. Rendering author name as text.'
      );
    }
  });
</script>

<header class={postHeaderClasses}>
  {#if hasTags}
    <div class="post-header__content-rail post-header__tag-section">
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
        imageAlt={hasAuthorImage ? normalizedAuthorImageAlt : ''}
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

  .post-header__tag-section,
  .post-header__date-section,
  .post-header__author-section {
    padding-block: var(--space-100);
  }

  @media (min-width: 1015px) {
    .post-header__tag-section {
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

    .post-header__image-rail {
      --figure-caption-max-inline-size: var(--size-rail-sm);
    }
  }
</style>
