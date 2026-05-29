<!--
/**
 * RichTextBlock
 *
 * Responsive prose block for already-rendered prose-shaped markup. Parent
 * composition owns rails, placement, and outer section spacing.
 *
 * Forwarded div attributes land on the root <div>. Slotted children win over
 * the plain body fallback. Existing broader root forwarding is part of the
 * public root-hook contract.
 *
 * @prop {string} body - Optional plain-text fallback when no children snippet is provided
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

<style>
  .rich-text {
    display: grid;
    gap: var(--space-gutter);
    inline-size: 100%;
    min-inline-size: 0;
    color: inherit;
    overflow-wrap: break-word;
  }

  .rich-text > :global(*) {
    min-inline-size: 0;
  }

  /* Svelte scope classes are compiler hooks, not caller-owned component boundaries. */
  .rich-text
    > :global(:where(p:not([class]), p[class^='s-']:not([class*=' ']), p[class^='svelte-']:not([class*=' ']))),
  .rich-text
    > :global(
      :where(
        ul:not([class]),
        ul[class^='s-']:not([class*=' ']),
        ul[class^='svelte-']:not([class*=' ']),
        ol:not([class]),
        ol[class^='s-']:not([class*=' ']),
        ol[class^='svelte-']:not([class*=' '])
      )
    ),
  .rich-text__body-fallback {
    margin-block: 0;
    overflow-wrap: break-word;
  }

  .rich-text__body-fallback {
    overflow-wrap: anywhere;
  }

  .rich-text
    > :global(
      :where(
        ul:not([class]),
        ul[class^='s-']:not([class*=' ']),
        ul[class^='svelte-']:not([class*=' ']),
        ol:not([class]),
        ol[class^='s-']:not([class*=' ']),
        ol[class^='svelte-']:not([class*=' '])
      )
    ) {
    list-style-position: outside;
    padding-inline-start: var(--space-600);
  }

  .rich-text
    > :global(:where(ul:not([class]), ul[class^='s-']:not([class*=' ']), ul[class^='svelte-']:not([class*=' ']))) {
    list-style-type: disc;
  }

  .rich-text
    > :global(:where(ol:not([class]), ol[class^='s-']:not([class*=' ']), ol[class^='svelte-']:not([class*=' ']))) {
    list-style-type: decimal;
  }

  .rich-text
    > :global(
      :where(
        ul:not([class]),
        ul[class^='s-']:not([class*=' ']),
        ul[class^='svelte-']:not([class*=' ']),
        ol:not([class]),
        ol[class^='s-']:not([class*=' ']),
        ol[class^='svelte-']:not([class*=' '])
      )
        > li:where(:not([class]), [class^='s-']:not([class*=' ']), [class^='svelte-']:not([class*=' ']))
    ),
  .rich-text
    > :global(
      :where(
        ul:not([class]),
        ul[class^='s-']:not([class*=' ']),
        ul[class^='svelte-']:not([class*=' ']),
        ol:not([class]),
        ol[class^='s-']:not([class*=' ']),
        ol[class^='svelte-']:not([class*=' '])
      )
        > li:where(:not([class]), [class^='s-']:not([class*=' ']), [class^='svelte-']:not([class*=' ']))
        > :where(
          ul:not([class]),
          ul[class^='s-']:not([class*=' ']),
          ul[class^='svelte-']:not([class*=' ']),
          ol:not([class]),
          ol[class^='s-']:not([class*=' ']),
          ol[class^='svelte-']:not([class*=' '])
        )
        > li:where(:not([class]), [class^='s-']:not([class*=' ']), [class^='svelte-']:not([class*=' ']))
    ),
  .rich-text
    > :global(
      :where(
        ul:not([class]),
        ul[class^='s-']:not([class*=' ']),
        ul[class^='svelte-']:not([class*=' ']),
        ol:not([class]),
        ol[class^='s-']:not([class*=' ']),
        ol[class^='svelte-']:not([class*=' '])
      )
        > li:where(:not([class]), [class^='s-']:not([class*=' ']), [class^='svelte-']:not([class*=' ']))
        > :where(
          ul:not([class]),
          ul[class^='s-']:not([class*=' ']),
          ul[class^='svelte-']:not([class*=' ']),
          ol:not([class]),
          ol[class^='s-']:not([class*=' ']),
          ol[class^='svelte-']:not([class*=' '])
        )
        > li:where(:not([class]), [class^='s-']:not([class*=' ']), [class^='svelte-']:not([class*=' ']))
        > :where(
          ul:not([class]),
          ul[class^='s-']:not([class*=' ']),
          ul[class^='svelte-']:not([class*=' ']),
          ol:not([class]),
          ol[class^='s-']:not([class*=' ']),
          ol[class^='svelte-']:not([class*=' '])
        )
        > li:where(:not([class]), [class^='s-']:not([class*=' ']), [class^='svelte-']:not([class*=' ']))
    ) {
    line-height: var(--typography-body-medium-line-height-tight);
    padding-inline-start: var(--space-100);
    overflow-wrap: break-word;
  }

  .rich-text
    > :global(
      :where(
        ul:not([class]),
        ul[class^='s-']:not([class*=' ']),
        ul[class^='svelte-']:not([class*=' ']),
        ol:not([class]),
        ol[class^='s-']:not([class*=' ']),
        ol[class^='svelte-']:not([class*=' '])
      )
        > li:where(:not([class]), [class^='s-']:not([class*=' ']), [class^='svelte-']:not([class*=' ']))
        + li:where(:not([class]), [class^='s-']:not([class*=' ']), [class^='svelte-']:not([class*=' ']))
    ),
  .rich-text
    > :global(
      :where(
        ul:not([class]),
        ul[class^='s-']:not([class*=' ']),
        ul[class^='svelte-']:not([class*=' ']),
        ol:not([class]),
        ol[class^='s-']:not([class*=' ']),
        ol[class^='svelte-']:not([class*=' '])
      )
        > li:where(:not([class]), [class^='s-']:not([class*=' ']), [class^='svelte-']:not([class*=' ']))
        > :where(
          ul:not([class]),
          ul[class^='s-']:not([class*=' ']),
          ul[class^='svelte-']:not([class*=' ']),
          ol:not([class]),
          ol[class^='s-']:not([class*=' ']),
          ol[class^='svelte-']:not([class*=' '])
        )
        > li:where(:not([class]), [class^='s-']:not([class*=' ']), [class^='svelte-']:not([class*=' ']))
        + li:where(:not([class]), [class^='s-']:not([class*=' ']), [class^='svelte-']:not([class*=' ']))
    ),
  .rich-text
    > :global(
      :where(
        ul:not([class]),
        ul[class^='s-']:not([class*=' ']),
        ul[class^='svelte-']:not([class*=' ']),
        ol:not([class]),
        ol[class^='s-']:not([class*=' ']),
        ol[class^='svelte-']:not([class*=' '])
      )
        > li:where(:not([class]), [class^='s-']:not([class*=' ']), [class^='svelte-']:not([class*=' ']))
        > :where(
          ul:not([class]),
          ul[class^='s-']:not([class*=' ']),
          ul[class^='svelte-']:not([class*=' ']),
          ol:not([class]),
          ol[class^='s-']:not([class*=' ']),
          ol[class^='svelte-']:not([class*=' '])
        )
        > li:where(:not([class]), [class^='s-']:not([class*=' ']), [class^='svelte-']:not([class*=' ']))
        > :where(
          ul:not([class]),
          ul[class^='s-']:not([class*=' ']),
          ul[class^='svelte-']:not([class*=' ']),
          ol:not([class]),
          ol[class^='s-']:not([class*=' ']),
          ol[class^='svelte-']:not([class*=' '])
        )
        > li:where(:not([class]), [class^='s-']:not([class*=' ']), [class^='svelte-']:not([class*=' ']))
        + li:where(:not([class]), [class^='s-']:not([class*=' ']), [class^='svelte-']:not([class*=' ']))
    ) {
    margin-block-start: var(--space-400);
  }

  .rich-text
    > :global(
      :where(
        ul:not([class]),
        ul[class^='s-']:not([class*=' ']),
        ul[class^='svelte-']:not([class*=' ']),
        ol:not([class]),
        ol[class^='s-']:not([class*=' ']),
        ol[class^='svelte-']:not([class*=' '])
      )
        > li:where(:not([class]), [class^='s-']:not([class*=' ']), [class^='svelte-']:not([class*=' ']))::marker
    ),
  .rich-text
    > :global(
      :where(
        ul:not([class]),
        ul[class^='s-']:not([class*=' ']),
        ul[class^='svelte-']:not([class*=' ']),
        ol:not([class]),
        ol[class^='s-']:not([class*=' ']),
        ol[class^='svelte-']:not([class*=' '])
      )
        > li:where(:not([class]), [class^='s-']:not([class*=' ']), [class^='svelte-']:not([class*=' ']))
        > :where(
          ul:not([class]),
          ul[class^='s-']:not([class*=' ']),
          ul[class^='svelte-']:not([class*=' ']),
          ol:not([class]),
          ol[class^='s-']:not([class*=' ']),
          ol[class^='svelte-']:not([class*=' '])
        )
        > li:where(:not([class]), [class^='s-']:not([class*=' ']), [class^='svelte-']:not([class*=' ']))::marker
    ),
  .rich-text
    > :global(
      :where(
        ul:not([class]),
        ul[class^='s-']:not([class*=' ']),
        ul[class^='svelte-']:not([class*=' ']),
        ol:not([class]),
        ol[class^='s-']:not([class*=' ']),
        ol[class^='svelte-']:not([class*=' '])
      )
        > li:where(:not([class]), [class^='s-']:not([class*=' ']), [class^='svelte-']:not([class*=' ']))
        > :where(
          ul:not([class]),
          ul[class^='s-']:not([class*=' ']),
          ul[class^='svelte-']:not([class*=' ']),
          ol:not([class]),
          ol[class^='s-']:not([class*=' ']),
          ol[class^='svelte-']:not([class*=' '])
        )
        > li:where(:not([class]), [class^='s-']:not([class*=' ']), [class^='svelte-']:not([class*=' ']))
        > :where(
          ul:not([class]),
          ul[class^='s-']:not([class*=' ']),
          ul[class^='svelte-']:not([class*=' ']),
          ol:not([class]),
          ol[class^='s-']:not([class*=' ']),
          ol[class^='svelte-']:not([class*=' '])
        )
        > li:where(:not([class]), [class^='s-']:not([class*=' ']), [class^='svelte-']:not([class*=' ']))::marker
    ) {
    color: currentcolor;
  }

  .rich-text
    > :global(
      :where(
        ul:not([class]),
        ul[class^='s-']:not([class*=' ']),
        ul[class^='svelte-']:not([class*=' ']),
        ol:not([class]),
        ol[class^='s-']:not([class*=' ']),
        ol[class^='svelte-']:not([class*=' '])
      )
        > li:where(:not([class]), [class^='s-']:not([class*=' ']), [class^='svelte-']:not([class*=' ']))
        > :where(p:not([class]), p[class^='s-']:not([class*=' ']), p[class^='svelte-']:not([class*=' ']))
    ),
  .rich-text
    > :global(
      :where(
        ul:not([class]),
        ul[class^='s-']:not([class*=' ']),
        ul[class^='svelte-']:not([class*=' ']),
        ol:not([class]),
        ol[class^='s-']:not([class*=' ']),
        ol[class^='svelte-']:not([class*=' '])
      )
        > li:where(:not([class]), [class^='s-']:not([class*=' ']), [class^='svelte-']:not([class*=' ']))
        > :where(
          ul:not([class]),
          ul[class^='s-']:not([class*=' ']),
          ul[class^='svelte-']:not([class*=' ']),
          ol:not([class]),
          ol[class^='s-']:not([class*=' ']),
          ol[class^='svelte-']:not([class*=' '])
        )
        > li:where(:not([class]), [class^='s-']:not([class*=' ']), [class^='svelte-']:not([class*=' ']))
        > :where(p:not([class]), p[class^='s-']:not([class*=' ']), p[class^='svelte-']:not([class*=' ']))
    ),
  .rich-text
    > :global(
      :where(
        ul:not([class]),
        ul[class^='s-']:not([class*=' ']),
        ul[class^='svelte-']:not([class*=' ']),
        ol:not([class]),
        ol[class^='s-']:not([class*=' ']),
        ol[class^='svelte-']:not([class*=' '])
      )
        > li:where(:not([class]), [class^='s-']:not([class*=' ']), [class^='svelte-']:not([class*=' ']))
        > :where(
          ul:not([class]),
          ul[class^='s-']:not([class*=' ']),
          ul[class^='svelte-']:not([class*=' ']),
          ol:not([class]),
          ol[class^='s-']:not([class*=' ']),
          ol[class^='svelte-']:not([class*=' '])
        )
        > li:where(:not([class]), [class^='s-']:not([class*=' ']), [class^='svelte-']:not([class*=' ']))
        > :where(
          ul:not([class]),
          ul[class^='s-']:not([class*=' ']),
          ul[class^='svelte-']:not([class*=' ']),
          ol:not([class]),
          ol[class^='s-']:not([class*=' ']),
          ol[class^='svelte-']:not([class*=' '])
        )
        > li:where(:not([class]), [class^='s-']:not([class*=' ']), [class^='svelte-']:not([class*=' ']))
        > :where(p:not([class]), p[class^='s-']:not([class*=' ']), p[class^='svelte-']:not([class*=' ']))
    ) {
    margin-block: 0;
    overflow-wrap: break-word;
  }

  .rich-text
    > :global(
      :where(
        ul:not([class]),
        ul[class^='s-']:not([class*=' ']),
        ul[class^='svelte-']:not([class*=' ']),
        ol:not([class]),
        ol[class^='s-']:not([class*=' ']),
        ol[class^='svelte-']:not([class*=' '])
      )
        > li:where(:not([class]), [class^='s-']:not([class*=' ']), [class^='svelte-']:not([class*=' ']))
        > :where(p:not([class]), p[class^='s-']:not([class*=' ']), p[class^='svelte-']:not([class*=' ']))
        + :where(p:not([class]), p[class^='s-']:not([class*=' ']), p[class^='svelte-']:not([class*=' ']))
    ),
  .rich-text
    > :global(
      :where(
        ul:not([class]),
        ul[class^='s-']:not([class*=' ']),
        ul[class^='svelte-']:not([class*=' ']),
        ol:not([class]),
        ol[class^='s-']:not([class*=' ']),
        ol[class^='svelte-']:not([class*=' '])
      )
        > li:where(:not([class]), [class^='s-']:not([class*=' ']), [class^='svelte-']:not([class*=' ']))
        > :where(
          ul:not([class]),
          ul[class^='s-']:not([class*=' ']),
          ul[class^='svelte-']:not([class*=' ']),
          ol:not([class]),
          ol[class^='s-']:not([class*=' ']),
          ol[class^='svelte-']:not([class*=' '])
        )
        > li:where(:not([class]), [class^='s-']:not([class*=' ']), [class^='svelte-']:not([class*=' ']))
        > :where(p:not([class]), p[class^='s-']:not([class*=' ']), p[class^='svelte-']:not([class*=' ']))
        + :where(p:not([class]), p[class^='s-']:not([class*=' ']), p[class^='svelte-']:not([class*=' ']))
    ),
  .rich-text
    > :global(
      :where(
        ul:not([class]),
        ul[class^='s-']:not([class*=' ']),
        ul[class^='svelte-']:not([class*=' ']),
        ol:not([class]),
        ol[class^='s-']:not([class*=' ']),
        ol[class^='svelte-']:not([class*=' '])
      )
        > li:where(:not([class]), [class^='s-']:not([class*=' ']), [class^='svelte-']:not([class*=' ']))
        > :where(
          ul:not([class]),
          ul[class^='s-']:not([class*=' ']),
          ul[class^='svelte-']:not([class*=' ']),
          ol:not([class]),
          ol[class^='s-']:not([class*=' ']),
          ol[class^='svelte-']:not([class*=' '])
        )
        > li:where(:not([class]), [class^='s-']:not([class*=' ']), [class^='svelte-']:not([class*=' ']))
        > :where(
          ul:not([class]),
          ul[class^='s-']:not([class*=' ']),
          ul[class^='svelte-']:not([class*=' ']),
          ol:not([class]),
          ol[class^='s-']:not([class*=' ']),
          ol[class^='svelte-']:not([class*=' '])
        )
        > li:where(:not([class]), [class^='s-']:not([class*=' ']), [class^='svelte-']:not([class*=' ']))
        > :where(p:not([class]), p[class^='s-']:not([class*=' ']), p[class^='svelte-']:not([class*=' ']))
        + :where(p:not([class]), p[class^='s-']:not([class*=' ']), p[class^='svelte-']:not([class*=' ']))
    ) {
    margin-block-start: var(--space-200);
  }

  .rich-text
    > :global(
      :where(
        ul:not([class]),
        ul[class^='s-']:not([class*=' ']),
        ul[class^='svelte-']:not([class*=' ']),
        ol:not([class]),
        ol[class^='s-']:not([class*=' ']),
        ol[class^='svelte-']:not([class*=' '])
      )
        > li:where(:not([class]), [class^='s-']:not([class*=' ']), [class^='svelte-']:not([class*=' ']))
        > :where(
          ul:not([class]),
          ul[class^='s-']:not([class*=' ']),
          ul[class^='svelte-']:not([class*=' ']),
          ol:not([class]),
          ol[class^='s-']:not([class*=' ']),
          ol[class^='svelte-']:not([class*=' '])
        )
    ),
  .rich-text
    > :global(
      :where(
        ul:not([class]),
        ul[class^='s-']:not([class*=' ']),
        ul[class^='svelte-']:not([class*=' ']),
        ol:not([class]),
        ol[class^='s-']:not([class*=' ']),
        ol[class^='svelte-']:not([class*=' '])
      )
        > li:where(:not([class]), [class^='s-']:not([class*=' ']), [class^='svelte-']:not([class*=' ']))
        > :where(
          ul:not([class]),
          ul[class^='s-']:not([class*=' ']),
          ul[class^='svelte-']:not([class*=' ']),
          ol:not([class]),
          ol[class^='s-']:not([class*=' ']),
          ol[class^='svelte-']:not([class*=' '])
        )
        > li:where(:not([class]), [class^='s-']:not([class*=' ']), [class^='svelte-']:not([class*=' ']))
        > :where(
          ul:not([class]),
          ul[class^='s-']:not([class*=' ']),
          ul[class^='svelte-']:not([class*=' ']),
          ol:not([class]),
          ol[class^='s-']:not([class*=' ']),
          ol[class^='svelte-']:not([class*=' '])
        )
    ) {
    margin-block-start: var(--space-200);
    padding-inline-start: var(--space-600);
  }

  .rich-text
    > :global(
      :where(
        ul:not([class]),
        ul[class^='s-']:not([class*=' ']),
        ul[class^='svelte-']:not([class*=' ']),
        ol:not([class]),
        ol[class^='s-']:not([class*=' ']),
        ol[class^='svelte-']:not([class*=' '])
      )
        > li:where(:not([class]), [class^='s-']:not([class*=' ']), [class^='svelte-']:not([class*=' ']))
        > :where(ul:not([class]), ul[class^='s-']:not([class*=' ']), ul[class^='svelte-']:not([class*=' ']))
    ) {
    list-style-type: circle;
  }

  .rich-text
    > :global(
      :where(
        ul:not([class]),
        ul[class^='s-']:not([class*=' ']),
        ul[class^='svelte-']:not([class*=' ']),
        ol:not([class]),
        ol[class^='s-']:not([class*=' ']),
        ol[class^='svelte-']:not([class*=' '])
      )
        > li:where(:not([class]), [class^='s-']:not([class*=' ']), [class^='svelte-']:not([class*=' ']))
        > :where(ol:not([class]), ol[class^='s-']:not([class*=' ']), ol[class^='svelte-']:not([class*=' ']))
    ) {
    list-style-type: lower-alpha;
  }

  .rich-text
    > :global(
      :where(
        ul:not([class]),
        ul[class^='s-']:not([class*=' ']),
        ul[class^='svelte-']:not([class*=' ']),
        ol:not([class]),
        ol[class^='s-']:not([class*=' ']),
        ol[class^='svelte-']:not([class*=' '])
      )
        > li:where(:not([class]), [class^='s-']:not([class*=' ']), [class^='svelte-']:not([class*=' ']))
        > :where(
          ul:not([class]),
          ul[class^='s-']:not([class*=' ']),
          ul[class^='svelte-']:not([class*=' ']),
          ol:not([class]),
          ol[class^='s-']:not([class*=' ']),
          ol[class^='svelte-']:not([class*=' '])
        )
        > li:where(:not([class]), [class^='s-']:not([class*=' ']), [class^='svelte-']:not([class*=' ']))
        > :where(ul:not([class]), ul[class^='s-']:not([class*=' ']), ul[class^='svelte-']:not([class*=' ']))
    ) {
    list-style-type: square;
  }

  .rich-text
    > :global(
      :where(
        ul:not([class]),
        ul[class^='s-']:not([class*=' ']),
        ul[class^='svelte-']:not([class*=' ']),
        ol:not([class]),
        ol[class^='s-']:not([class*=' ']),
        ol[class^='svelte-']:not([class*=' '])
      )
        > li:where(:not([class]), [class^='s-']:not([class*=' ']), [class^='svelte-']:not([class*=' ']))
        > :where(
          ul:not([class]),
          ul[class^='s-']:not([class*=' ']),
          ul[class^='svelte-']:not([class*=' ']),
          ol:not([class]),
          ol[class^='s-']:not([class*=' ']),
          ol[class^='svelte-']:not([class*=' '])
        )
        > li:where(:not([class]), [class^='s-']:not([class*=' ']), [class^='svelte-']:not([class*=' ']))
        > :where(ol:not([class]), ol[class^='s-']:not([class*=' ']), ol[class^='svelte-']:not([class*=' ']))
    ) {
    list-style-type: lower-roman;
  }

  .rich-text
    > :global(
      :where(
        ul:not([class]),
        ul[class^='s-']:not([class*=' ']),
        ul[class^='svelte-']:not([class*=' ']),
        ol:not([class]),
        ol[class^='s-']:not([class*=' ']),
        ol[class^='svelte-']:not([class*=' '])
      )
        > li:where(:not([class]), [class^='s-']:not([class*=' ']), [class^='svelte-']:not([class*=' ']))
        > :where(p:not([class]), p[class^='s-']:not([class*=' ']), p[class^='svelte-']:not([class*=' ']))
        + :where(
          ul:not([class]),
          ul[class^='s-']:not([class*=' ']),
          ul[class^='svelte-']:not([class*=' ']),
          ol:not([class]),
          ol[class^='s-']:not([class*=' ']),
          ol[class^='svelte-']:not([class*=' '])
        )
    ),
  .rich-text
    > :global(
      :where(
        ul:not([class]),
        ul[class^='s-']:not([class*=' ']),
        ul[class^='svelte-']:not([class*=' ']),
        ol:not([class]),
        ol[class^='s-']:not([class*=' ']),
        ol[class^='svelte-']:not([class*=' '])
      )
        > li:where(:not([class]), [class^='s-']:not([class*=' ']), [class^='svelte-']:not([class*=' ']))
        > :where(
          ul:not([class]),
          ul[class^='s-']:not([class*=' ']),
          ul[class^='svelte-']:not([class*=' ']),
          ol:not([class]),
          ol[class^='s-']:not([class*=' ']),
          ol[class^='svelte-']:not([class*=' '])
        )
        > li:where(:not([class]), [class^='s-']:not([class*=' ']), [class^='svelte-']:not([class*=' ']))
        > :where(p:not([class]), p[class^='s-']:not([class*=' ']), p[class^='svelte-']:not([class*=' ']))
        + :where(
          ul:not([class]),
          ul[class^='s-']:not([class*=' ']),
          ul[class^='svelte-']:not([class*=' ']),
          ol:not([class]),
          ol[class^='s-']:not([class*=' ']),
          ol[class^='svelte-']:not([class*=' '])
        )
    ) {
    margin-block-start: var(--space-200);
  }

  @media (min-width: 1015px) {
    .rich-text
      > :global(
        :where(
          ul:not([class]),
          ul[class^='s-']:not([class*=' ']),
          ul[class^='svelte-']:not([class*=' ']),
          ol:not([class]),
          ol[class^='s-']:not([class*=' ']),
          ol[class^='svelte-']:not([class*=' '])
        )
          > li:where(:not([class]), [class^='s-']:not([class*=' ']), [class^='svelte-']:not([class*=' ']))
      ),
    .rich-text
      > :global(
        :where(
          ul:not([class]),
          ul[class^='s-']:not([class*=' ']),
          ul[class^='svelte-']:not([class*=' ']),
          ol:not([class]),
          ol[class^='s-']:not([class*=' ']),
          ol[class^='svelte-']:not([class*=' '])
        )
          > li:where(:not([class]), [class^='s-']:not([class*=' ']), [class^='svelte-']:not([class*=' ']))
          > :where(
            ul:not([class]),
            ul[class^='s-']:not([class*=' ']),
            ul[class^='svelte-']:not([class*=' ']),
            ol:not([class]),
            ol[class^='s-']:not([class*=' ']),
            ol[class^='svelte-']:not([class*=' '])
          )
          > li:where(:not([class]), [class^='s-']:not([class*=' ']), [class^='svelte-']:not([class*=' ']))
      ),
    .rich-text
      > :global(
        :where(
          ul:not([class]),
          ul[class^='s-']:not([class*=' ']),
          ul[class^='svelte-']:not([class*=' ']),
          ol:not([class]),
          ol[class^='s-']:not([class*=' ']),
          ol[class^='svelte-']:not([class*=' '])
        )
          > li:where(:not([class]), [class^='s-']:not([class*=' ']), [class^='svelte-']:not([class*=' ']))
          > :where(
            ul:not([class]),
            ul[class^='s-']:not([class*=' ']),
            ul[class^='svelte-']:not([class*=' ']),
            ol:not([class]),
            ol[class^='s-']:not([class*=' ']),
            ol[class^='svelte-']:not([class*=' '])
          )
          > li:where(:not([class]), [class^='s-']:not([class*=' ']), [class^='svelte-']:not([class*=' ']))
          > :where(
            ul:not([class]),
            ul[class^='s-']:not([class*=' ']),
            ul[class^='svelte-']:not([class*=' ']),
            ol:not([class]),
            ol[class^='s-']:not([class*=' ']),
            ol[class^='svelte-']:not([class*=' '])
          )
          > li:where(:not([class]), [class^='s-']:not([class*=' ']), [class^='svelte-']:not([class*=' ']))
      ) {
      line-height: var(--typography-body-large-line-height-tight);
    }
  }
</style>
