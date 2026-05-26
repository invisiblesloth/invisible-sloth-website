<!--
/**
 * PostHeader
 *
 * Storybook-documented blog post header composition with optional tags,
 * publication date, author byline, and featured media.
 *
 * PostHeader owns post-level section order and media semantics. TagLinkGroup
 * owns linked tag validation; internal header pieces own rail layout and
 * Figure composition.
 *
 * Author identity and links are provided through authors. Avatar props are
 * single-author presentation data.
 *
 * Featured media defaults to a non-cropping art treatment so transparent or
 * designed assets are preserved. Use cover only for photo covers that may be
 * cropped into a fixed frame.
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
  import type { FigureCaptionContent } from './FigureCaption.svelte';
  import type { HeaderImageProps } from './internal/header/HeaderMediaSection.svelte';
  import type { PostAuthorItem } from '../lib/postAuthors';
  import type { TagLink } from '../lib/tagLinks';

  export const POST_HEADER_MEDIA_TREATMENTS = [
    'art',
    'cover',
  ] as const;
  export type PostHeaderMediaTreatment = (typeof POST_HEADER_MEDIA_TREATMENTS)[number];
  export type PostHeaderMedia = FigureCaptionContent & {
    image: HeaderImageProps;
    treatment?: PostHeaderMediaTreatment;
  };
  export type PostHeaderAuthor = PostAuthorItem;
  export type PostHeaderTag = TagLink;
</script>

<script lang="ts">
  import DetailHeader from './DetailHeader.svelte';
  import HeaderMediaSection from './internal/header/HeaderMediaSection.svelte';
  import HeaderRail from './internal/header/HeaderRail.svelte';
  import HeaderRoot from './internal/header/HeaderRoot.svelte';
  import HeaderTagSection from './internal/header/HeaderTagSection.svelte';
  import PostAuthor from './PostAuthor.svelte';
  import PostDate from './PostDate.svelte';
  import { warnOnce } from '../lib/devWarnings';
  import { resolvePostAuthors } from '../lib/postAuthors';

  function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }

  const resolveMediaTreatment = (media: unknown): FigureMediaTreatment => {
    if (!isRecord(media)) {
      return 'featured-art';
    }

    return media.treatment === 'cover' ? 'featured-cover' : 'featured-art';
  };

  const hasInvalidMediaTreatment = (media: unknown): boolean => {
    if (!isRecord(media) || media.treatment === undefined) {
      return false;
    }

    return !(POST_HEADER_MEDIA_TREATMENTS as readonly unknown[]).includes(media.treatment);
  };

  type Props = {
    title: string;
    excerpt?: string;
    date?: string;
    dateTime?: string;
    authorImageSrc?: string;
    authorImageAlt?: string;
    authors?: PostHeaderAuthor[];
    tags?: PostHeaderTag[];
    media?: PostHeaderMedia;
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
    media = undefined,
    class: className = '',
  }: Props = $props();

  const postHeaderClasses = $derived(['post-header', className].filter(Boolean).join(' '));
  const normalizedDate = $derived(String(date ?? '').trim());
  const normalizedDateTime = $derived(String(dateTime ?? '').trim());
  const normalizedAuthorImageSrc = $derived(String(authorImageSrc ?? '').trim());
  const normalizedAuthorImageAlt = $derived(String(authorImageAlt ?? ''));
  const authorResolution = $derived(resolvePostAuthors(authors));
  const resolvedAuthors = $derived(authorResolution.authors);
  const resolvedMediaTreatment = $derived(resolveMediaTreatment(media));
  const hasDate = $derived(normalizedDate.length > 0);
  const hasAuthor = $derived(resolvedAuthors.length > 0);
  const hasAuthorImage = $derived(
    hasAuthor && resolvedAuthors.length === 1 && normalizedAuthorImageSrc.length > 0
  );
  $effect(() => {
    if (hasInvalidMediaTreatment(media)) {
      warnOnce(
        'post-header:invalid-media-treatment',
        `[PostHeader] \`media.treatment\` must be one of ${POST_HEADER_MEDIA_TREATMENTS.map((treatment) => `"${treatment}"`).join(', ')}. Falling back to "art".`
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

<HeaderRoot class={postHeaderClasses}>
  <HeaderTagSection
    {tags}
    componentLabel="[PostHeader]"
    warningNamespace="post-header"
  />

  {#if hasDate}
    <HeaderRail section="metadata">
      <PostDate
        date={normalizedDate}
        dateTime={normalizedDateTime || undefined}
      />
    </HeaderRail>
  {/if}

  <HeaderRail>
    <DetailHeader {title} {excerpt} />
  </HeaderRail>

  {#if hasAuthor}
    <HeaderRail section="metadata">
      <PostAuthor
        authors={resolvedAuthors}
        imageSrc={hasAuthorImage ? normalizedAuthorImageSrc : undefined}
        imageAlt={hasAuthorImage ? normalizedAuthorImageAlt : ''}
      />
    </HeaderRail>
  {/if}

  <HeaderMediaSection
    {media}
    mediaTreatment={resolvedMediaTreatment}
    componentLabel="[PostHeader]"
    warningNamespace="post-header"
  />
</HeaderRoot>
