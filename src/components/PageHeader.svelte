<!--
/**
 * PageHeader
 *
 * Reusable page header composition with optional wide media, clickable tags,
 * and detail-header title/excerpt content.
 *
 * When media with a non-empty source is provided, media is meaningful content
 * for this pattern: PageHeader always renders it as non-decorative with
 * frame="auto" and fit="contain" so shaped assets are not cropped.
 *
 * Caption/credit snippets pass through to Figure. Use `.text-link` for links
 * when the shared inline link treatment is needed.
 */
-->
<script module lang="ts">
  import type { TagLink } from '../lib/tagLinks';

  export type PageHeaderTag = TagLink;
</script>

<script lang="ts">
  import DetailHeader from './DetailHeader.svelte';
  import Figure from './Figure.svelte';
  import type { FigureCaptionContent } from './FigureCaption.svelte';
  import type { FigureImageProps } from './Figure.svelte';
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

  type Props = FigureCaptionContent & {
    title: string;
    excerpt?: string;
    tags?: PageHeaderTag[];
    imageProps?: FigureImageProps;
    class?: string;
  };

  let {
    title,
    excerpt = '',
    tags = [],
    imageProps = undefined,
    captionText = '',
    creditText = '',
    caption,
    credit,
    class: className = '',
  }: Props = $props();

  const pageHeaderClasses = $derived(['page-header', className].filter(Boolean).join(' '));
  const tagResolution = $derived(resolveTagLinks(tags));
  const normalizedTags = $derived(tagResolution.links);
  const hasTags = $derived(normalizedTags.length > 0);
  const resolvedImageProps = $derived(resolveImageProps(imageProps));
  const hasImage = $derived(String(resolvedImageProps.src ?? '').trim().length > 0);

  $effect(() => {
    if (!tagResolution.inputWasArray) {
      warnOnce(
        'page-header:invalid-tags',
        '[PageHeader] `tags` must be an array. Rendering without tags.'
      );
    }

    for (const index of tagResolution.invalidIndexes) {
      warnOnce(
        `page-header:invalid-tag:${index}`,
        '[PageHeader] Tags need non-empty label and href values. Skipping invalid tag.'
      );
    }
  });
</script>

<header class={pageHeaderClasses}>
  {#if hasImage}
    <div class="page-header__image-rail">
      <Figure
        imageProps={resolvedImageProps}
        mediaTreatment="wide-contain"
        {captionText}
        {creditText}
        {caption}
        {credit}
        class="page-header__figure"
      />
    </div>
  {/if}

  {#if hasTags}
    <div class="page-header__content-rail page-header__tag-section">
      <TagGroup class="page-header__tag-group">
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

  <div class="page-header__content-rail">
    <DetailHeader {title} {excerpt} />
  </div>
</header>

<style>
  .page-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-400);
    inline-size: 100%;
    padding-block-end: var(--space-section-block);
    color: var(--color-on-surface);
  }

  .page-header__image-rail,
  .page-header__content-rail {
    inline-size: 100%;
    margin-inline: auto;
    padding-inline: var(--space-rail-inline);
  }

  .page-header__image-rail {
    max-inline-size: var(--size-rail-lg);
  }

  .page-header__content-rail {
    max-inline-size: var(--size-rail-lg);
  }

  .page-header__figure {
    inline-size: 100%;
  }

  .page-header__tag-section {
    padding-block: var(--space-100);
  }

  @media (min-width: 1015px) {
    .page-header__tag-section {
      padding-block: var(--space-200);
    }
  }

  @media (min-width: 1176px) {
    .page-header__image-rail,
    .page-header__content-rail {
      padding-inline: 0;
    }

    .page-header__content-rail {
      max-inline-size: var(--size-rail-sm);
    }

    .page-header__image-rail {
      --figure-caption-max-inline-size: var(--size-rail-sm);
    }
  }
</style>
