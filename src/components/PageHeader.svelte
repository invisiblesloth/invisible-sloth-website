<!--
/**
 * PageHeader
 *
 * Reusable page header composition with optional wide media, clickable tags,
 * and detail-header title/excerpt content.
 *
 * PageHeader owns page-level section order and media semantics. TagLinkGroup
 * owns linked tag validation; internal header pieces own rail layout and
 * Figure composition.
 *
 * When media with a non-empty source is provided, media is meaningful content
 * for this pattern and uses the wide non-cropping treatment so shaped assets
 * are not cropped.
 *
 * Caption/credit snippets pass through to Figure. Use `.text-link` for links
 * when the shared inline link treatment is needed.
 */
-->
<script module lang="ts">
  import type { HeaderMedia } from './header/HeaderMediaSection.svelte';
  import type { TagLink } from '../lib/tagLinks';

  export type PageHeaderMedia = HeaderMedia;
  export type PageHeaderTag = TagLink;
</script>

<script lang="ts">
  import DetailHeader from './DetailHeader.svelte';
  import HeaderMediaSection from './header/HeaderMediaSection.svelte';
  import HeaderRail from './header/HeaderRail.svelte';
  import HeaderRoot from './header/HeaderRoot.svelte';
  import HeaderTagSection from './header/HeaderTagSection.svelte';

  type Props = {
    title: string;
    excerpt?: string;
    tags?: PageHeaderTag[];
    media?: PageHeaderMedia;
    class?: string;
  };

  let {
    title,
    excerpt = '',
    tags = [],
    media = undefined,
    class: className = '',
  }: Props = $props();

  const pageHeaderClasses = $derived(['page-header', className].filter(Boolean).join(' '));
</script>

<HeaderRoot class={pageHeaderClasses}>
  <HeaderMediaSection
    {media}
    mediaTreatment="wide-contain"
    componentLabel="[PageHeader]"
    warningNamespace="page-header"
  />

  <HeaderTagSection
    {tags}
    componentLabel="[PageHeader]"
    warningNamespace="page-header"
  />

  <HeaderRail>
    <DetailHeader {title} {excerpt} />
  </HeaderRail>
</HeaderRoot>
