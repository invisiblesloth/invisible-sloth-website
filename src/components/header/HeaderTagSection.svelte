<script lang="ts">
  import HeaderRail from './HeaderRail.svelte';
  import Tag from '../Tag.svelte';
  import TagGroup from '../TagGroup.svelte';
  import { warnOnce } from '../../lib/devWarnings';
  import { resolveTagLinks } from '../../lib/tagLinks';
  import type { TagLink } from '../../lib/tagLinks';

  let {
    tags = [],
    componentLabel,
    warningNamespace,
  }: {
    tags?: TagLink[];
    componentLabel: string;
    warningNamespace: string;
  } = $props();

  const tagResolution = $derived(resolveTagLinks(tags));
  const normalizedTags = $derived(tagResolution.links);
  const hasTags = $derived(normalizedTags.length > 0);

  $effect(() => {
    if (!tagResolution.inputWasArray) {
      warnOnce(
        `${warningNamespace}:invalid-tags`,
        `${componentLabel} \`tags\` must be an array. Rendering without tags.`
      );
    }

    for (const index of tagResolution.invalidIndexes) {
      warnOnce(
        `${warningNamespace}:invalid-tag:${index}`,
        `${componentLabel} Tags need non-empty label and href values. Skipping invalid tag.`
      );
    }
  });
</script>

{#if hasTags}
  <HeaderRail section="tag">
    <TagGroup>
      {#each normalizedTags as tag (tag.href + ':' + tag.index)}
        <Tag
          label={tag.label}
          href={tag.href}
          target={tag.target}
          rel={tag.rel}
        />
      {/each}
    </TagGroup>
  </HeaderRail>
{/if}
