<script module lang="ts">
  import type { Snippet } from 'svelte';
  import type { TagLink } from '../lib/tagLinks';

  type TagGroupSnippet = Snippet;
  type TagLinkGroupWrapper = Snippet<[TagGroupSnippet]>;

  export type TagLinkGroupProps = {
    tags?: TagLink[];
    componentLabel?: string;
    warningNamespace?: string;
    wrapper?: TagLinkGroupWrapper;
    children?: Snippet;
    class?: string;
    [key: string]: unknown;
  };
</script>

<script lang="ts">
  /**
   * TagLinkGroup
   *
   * Owns linked tag data normalization, validation warnings, and rendering.
   * TagGroup remains the layout-only wrapper for internal tag gaps/wrapping.
   * class and passthrough attributes land on the internal TagGroup. The
   * optional wrapper receives a renderable TagGroup snippet and owns only
   * outer placement.
   * Data composition contract: renders no DOM when there are no valid tags.
   */
  import { warnOnce } from '../lib/devWarnings';
  import { resolveTagLinks } from '../lib/tagLinks';
  import Tag from './Tag.svelte';
  import TagGroup from './TagGroup.svelte';

  let {
    tags = [],
    componentLabel = '[TagLinkGroup]',
    warningNamespace = 'tag-link-group',
    wrapper,
    class: className = '',
    children: _children,
    ...restProps
  }: TagLinkGroupProps = $props();

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

{#snippet group()}
  <TagGroup {...restProps} class={className}>
    {#each normalizedTags as tag (tag.href + ':' + tag.index)}
      <Tag
        label={tag.label}
        href={tag.href}
        target={tag.target}
        rel={tag.rel}
      />
    {/each}
  </TagGroup>
{/snippet}

{#if hasTags}
  {#if wrapper}
    {@render wrapper(group)}
  {:else}
    {@render group()}
  {/if}
{/if}
