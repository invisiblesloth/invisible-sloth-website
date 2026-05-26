<script lang="ts">
  /**
   * HeaderTagSection adapts linked tag rendering into the header rail.
   * TagLinkGroup owns validation and empty-state suppression.
   */
  import type { Snippet } from 'svelte';
  import HeaderRail from './HeaderRail.svelte';
  import TagLinkGroup from '../../TagLinkGroup.svelte';
  import type { TagLink } from '../../../lib/tagLinks';

  let {
    tags = [],
    componentLabel,
    warningNamespace,
  }: {
    tags?: TagLink[];
    componentLabel: string;
    warningNamespace: string;
  } = $props();
</script>

{#snippet tagRail(group: Snippet)}
  <HeaderRail section="tag">
    {@render group()}
  </HeaderRail>
{/snippet}

<TagLinkGroup
  {tags}
  {componentLabel}
  {warningNamespace}
  wrapper={tagRail}
/>
