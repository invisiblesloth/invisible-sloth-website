<!--
/**
 * PageHeader
 *
 * Reusable page header composition with wide media, clickable tags, and
 * detail-header title/excerpt content.
 *
 * Media mode is fixed for this pattern: PageHeader always renders its image
 * with frame="auto" and fit="contain" so shaped assets are not cropped.
 */
-->
<script module lang="ts">
  export type PageHeaderTag = {
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
  import Tag from './Tag.svelte';
  import TagGroup from './TagGroup.svelte';
  import { warnOnce } from '../lib/devWarnings';
  import { normalizeHref } from '../lib/linkBehavior';

  type ImageProps = ComponentProps<typeof Image>;
  type ResolvedPageHeaderTag = PageHeaderTag & {
    index: number;
  };
  type TagResolution = ResolvedPageHeaderTag | {
    index: number;
    invalid: true;
  };

  let {
    title,
    excerpt = '',
    tags = [],
    imageProps,
    captionText = '',
    creditText = '',
    caption,
    credit,
    class: className = '',
  }: {
    title: string;
    excerpt?: string;
    tags?: PageHeaderTag[];
    imageProps: ImageProps;
    captionText?: string;
    creditText?: string;
    caption?: Snippet;
    credit?: Snippet;
    class?: string;
  } = $props();

  const pageHeaderClasses = $derived(['page-header', className].filter(Boolean).join(' '));
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
    resolvedTags.filter((tag): tag is ResolvedPageHeaderTag => !('invalid' in tag))
  );
  const hasTags = $derived(normalizedTags.length > 0);
  const pageHeaderImageProps = $derived.by((): ImageProps => {
    const resolvedImageProps = imageProps ?? ({} as ImageProps);
    const imageClass = ['page-header__media', resolvedImageProps.class].filter(Boolean).join(' ');

    return {
      ...resolvedImageProps,
      class: imageClass,
      frame: 'auto',
      fit: 'contain',
    };
  });

  $effect(() => {
    if (!Array.isArray(tags)) {
      warnOnce(
        'page-header:invalid-tags',
        '[PageHeader] `tags` must be an array. Rendering without tags.'
      );
    }

    for (const tag of resolvedTags) {
      if ('invalid' in tag) {
        warnOnce(
          `page-header:invalid-tag:${tag.index}`,
          '[PageHeader] Tags need non-empty label and href values. Skipping invalid tag.'
        );
      }
    }
  });
</script>

<header class={pageHeaderClasses}>
  <div class="page-header__image-rail">
    <Figure
      imageProps={pageHeaderImageProps}
      {captionText}
      {creditText}
      {caption}
      {credit}
      class="page-header__figure"
    />
  </div>

  {#if hasTags}
    <div class="page-header__content-rail">
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

  .page-header__figure :global(.page-header__media.image--contain .image__media) {
    inline-size: 100%;
  }

  .page-header__content-rail :global(.page-header__tag-group) {
    padding-block: var(--space-100);
  }

  @media (min-width: 1015px) {
    .page-header__content-rail :global(.page-header__tag-group) {
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
  }
</style>
