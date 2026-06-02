<!--
/**
 * RichTextBlock
 *
 * Responsive prose block for already-rendered prose-shaped child markup. Parent
 * composition owns rails, placement, and outer section spacing.
 *
 * Forwarded div attributes land on the root <div>. Slotted children win over
 * the plain body fallback. Existing broader root forwarding is part of the
 * public root-hook contract.
 *
 * @prop {string} body - Optional escaped plain-text fallback when no children snippet is provided
 * @prop {Snippet} children - Optional already-rendered rich prose content; wins over body
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
  const hasMalformedBody = $derived(typeof body !== 'string');
  const normalizedBody = $derived(typeof body === 'string' ? body.trim() : '');
  const hasBody = $derived(normalizedBody.length > 0);
  const shouldRender = $derived(hasChildren || hasBody);
  const normalizedClassName = $derived(String(className ?? '').trim());
  const richTextBlockClasses = $derived(
    ['rich-text', 'text-body-responsive', normalizedClassName].filter(Boolean).join(' ')
  );

  $effect(() => {
    if (hasChildren || !hasMalformedBody) {
      return;
    }

    warnOnce(
      'rich-text-block:malformed-body',
      '[RichTextBlock] `body` must be a string when provided. Rendering nothing.'
    );
  });
</script>

{#if shouldRender}
  <div {...restProps} class={richTextBlockClasses}>
    {#if hasChildren}
      {@render children?.()}
    {:else}
      <p class="rich-text__body-fallback">{normalizedBody}</p>
    {/if}
  </div>
{/if}
