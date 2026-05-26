<script lang="ts">
  import type { Snippet } from 'svelte';

  type HeaderRailKind = 'content' | 'image';
  type HeaderRailSection = 'default' | 'metadata' | 'tag';

  let {
    children,
    kind = 'content',
    section = 'default',
    class: className = '',
  }: {
    children?: Snippet;
    kind?: HeaderRailKind;
    section?: HeaderRailSection;
    class?: string;
  } = $props();

  const railClasses = $derived(
    [
      'header-rail',
      `header-rail--${kind}`,
      section !== 'default' ? `header-rail--${section}` : '',
      className,
    ]
      .filter(Boolean)
      .join(' ')
  );
</script>

<div class={railClasses}>
  {@render children?.()}
</div>

<style>
  .header-rail {
    inline-size: 100%;
    margin-inline: auto;
    padding-inline: var(--space-rail-inline);
  }

  .header-rail--content,
  .header-rail--image {
    max-inline-size: var(--size-rail-lg);
  }

  .header-rail--metadata,
  .header-rail--tag {
    padding-block: var(--space-100);
  }

  @media (min-width: 1015px) {
    .header-rail--tag {
      padding-block: var(--space-200);
    }
  }

  @media (min-width: 1176px) {
    .header-rail {
      padding-inline: 0;
    }

    .header-rail--content {
      max-inline-size: var(--size-rail-sm);
    }

    .header-rail--image {
      --figure-caption-max-inline-size: var(--size-rail-sm);
    }
  }
</style>
