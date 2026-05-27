<!--
/**
 * TextBlock
 *
 * Headingless responsive body-copy block for page composition. Parent
 * composition owns rails, placement, and outer section spacing.
 *
 * Forwarded div attributes land on the root <div>. Slotted children win over
 * the plain body fallback.
 *
 * @prop {string} body - Optional plain-text fallback when no children snippet is provided
 * @prop {Snippet} children - Optional rich body content; wins over body when provided
 * @prop {string} class - Additional classes merged onto the root wrapper
 */
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { SvelteHTMLElements } from 'svelte/elements';
  import { warnOnce } from '../lib/devWarnings';

  type DivAttributes = Omit<SvelteHTMLElements['div'], 'children' | 'class'>;

  type Props = DivAttributes & {
    body?: string;
    children?: Snippet;
    class?: string;
  };

  let {
    body = '',
    children,
    class: className = '',
    ...restProps
  }: Props = $props();

  const hasChildren = $derived(Boolean(children));
  const hasMalformedBody = $derived(body !== undefined && typeof body !== 'string');
  const normalizedBody = $derived(typeof body === 'string' ? body.trim() : '');
  const hasBody = $derived(normalizedBody.length > 0);
  const shouldRender = $derived(hasChildren || hasBody);
  const normalizedClassName = $derived(String(className ?? '').trim());
  const textBlockClasses = $derived(
    ['text-block', 'text-body-responsive', normalizedClassName].filter(Boolean).join(' ')
  );

  $effect(() => {
    if (hasChildren || hasBody) {
      return;
    }

    if (hasMalformedBody) {
      warnOnce(
        'text-block:malformed-body',
        '[TextBlock] `body` must be a string when provided. Rendering nothing.'
      );
      return;
    }

    warnOnce(
      'text-block:blank-body',
      '[TextBlock] `body` must be non-empty when no children snippet is provided. Rendering nothing.'
    );
  });
</script>

{#if shouldRender}
  <div {...restProps} class={textBlockClasses}>
    {#if hasChildren}
      {@render children?.()}
    {:else}
      <p class="text-block__body-fallback">{normalizedBody}</p>
    {/if}
  </div>
{/if}

<style>
  .text-block {
    display: grid;
    gap: var(--space-gutter);
    inline-size: 100%;
    min-inline-size: 0;
    color: inherit;
    overflow-wrap: break-word;
  }

  .text-block > :global(p),
  .text-block__body-fallback {
    min-inline-size: 0;
    margin-block: 0;
    overflow-wrap: anywhere;
  }
</style>
