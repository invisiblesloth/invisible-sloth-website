<script lang="ts">
  import { warnOnce } from '../lib/devWarnings';
  import { normalizeHref, normalizeRelForTarget, normalizeTarget } from '../lib/linkBehavior';

  type TagMode = 'link' | 'button';

  type Props = {
    label?: string;
    href?: string;
    target?: string;
    rel?: string;
    type?: 'button' | 'submit' | 'reset';
    onclick?: (event: MouseEvent) => void;
    class?: string;
    [key: string]: unknown;
  };

  const GLOBAL_ATTRIBUTES = new Set([
    'id',
    'style',
    'title',
    'role',
    'tabindex',
    'lang',
    'dir',
    'slot',
    'hidden',
    'inert',
    'draggable',
    'translate',
    'accesskey',
    'contenteditable',
    'spellcheck',
    'autocapitalize',
    'autocorrect',
    'inputmode',
    'part',
  ]);

  const LINK_ATTRIBUTES = new Set([
    'download',
    'hreflang',
    'ping',
    'referrerpolicy',
  ]);

  const BUTTON_ATTRIBUTES = new Set([
    'name',
    'value',
    'form',
    'formaction',
    'formenctype',
    'formmethod',
    'formnovalidate',
    'formtarget',
    'autofocus',
  ]);

  let {
    label = 'Label',
    href,
    target,
    rel,
    type = 'button',
    onclick,
    class: className = '',
    ...restProps
  }: Props = $props();

  const normalizedHref = $derived(normalizeHref(href));
  const hasHrefProp = $derived(href !== undefined && href !== null);
  const normalizedTarget = $derived<string | undefined>(normalizeTarget(target));
  const isLink = $derived(Boolean(normalizedHref));
  const mode = $derived<TagMode>(isLink ? 'link' : 'button');

  const tagClasses = $derived(['tag', className].filter(Boolean).join(' '));

  function isAriaOrDataAttribute(name: string): boolean {
    return name.startsWith('aria-') || name.startsWith('data-');
  }

  function isEventAttribute(name: string): boolean {
    return name.startsWith('on') && name.length > 2;
  }

  function isAllowedAttribute(attributeMode: TagMode, name: string): boolean {
    if (isAriaOrDataAttribute(name) || isEventAttribute(name) || GLOBAL_ATTRIBUTES.has(name)) {
      return true;
    }

    return attributeMode === 'link' ? LINK_ATTRIBUTES.has(name) : BUTTON_ATTRIBUTES.has(name);
  }

  function filterForwardedAttributes(attributeMode: TagMode, source: Record<string, unknown>): Record<string, unknown> {
    const filtered: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(source)) {
      if (key === 'disabled' || key === 'aria-disabled') {
        continue;
      }

      if (isAllowedAttribute(attributeMode, key)) {
        filtered[key] = value;
      }
    }

    return filtered;
  }

  const anchorAttributes = $derived(filterForwardedAttributes('link', restProps));
  const buttonAttributes = $derived(filterForwardedAttributes('button', restProps));
  const secureRel = $derived(normalizeRelForTarget(normalizedTarget, rel));

  $effect(() => {
    if (hasHrefProp && !normalizedHref) {
      warnOnce(
        'tag:invalid-href',
        '[Tag] `href` must resolve to a non-empty string after trimming. Rendering as <button> fallback.'
      );
    }

    if (Object.prototype.hasOwnProperty.call(restProps, 'disabled')) {
      warnOnce(
        `tag:invalid-disabled:${mode}`,
        '[Tag] `disabled` is not supported and will be ignored. Remove it from usage.'
      );
    }

    if (Object.prototype.hasOwnProperty.call(restProps, 'aria-disabled')) {
      warnOnce(
        `tag:invalid-aria-disabled:${mode}`,
        '[Tag] `aria-disabled` is not supported and will be ignored. Remove it from usage.'
      );
    }
  });

  function handleClick(event: MouseEvent): void {
    onclick?.(event);
  }
</script>

{#if isLink}
  <a
    class={tagClasses}
    href={normalizedHref}
    target={normalizedTarget}
    rel={secureRel}
    onclick={handleClick}
    {...anchorAttributes}
  >
    <span class="tag__surface">
      <span class="tag__label text-label-small-prominent">{label}</span>
    </span>
  </a>
{:else}
  <button
    class={tagClasses}
    {type}
    onclick={handleClick}
    {...buttonAttributes}
  >
    <span class="tag__surface">
      <span class="tag__label text-label-small-prominent">{label}</span>
    </span>
  </button>
{/if}

<style>
  .tag {
    --tag-transition: var(--animation-duration-extra-fast) var(--animation-easing-standard);

    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;

    min-inline-size: 0;
    max-inline-size: 100%;
    block-size: var(--space-800);
    padding: 0;
    margin: 0;

    border: none;
    border-radius: var(--radius-full);
    background: transparent;
    color: var(--color-on-surface-dim);
    text-decoration: none;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
  }

  .tag:visited {
    color: var(--color-on-surface-dim);
  }

  .tag__surface {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;

    min-inline-size: 0;
    max-inline-size: 100%;
    inline-size: 100%;
    block-size: 100%;
    padding-inline: var(--space-400);

    border: 1px solid var(--color-outline);
    border-radius: inherit;
    overflow: hidden;
    /* Keep transform composition stable to prevent text jitter during hover in/out. */
    transform: translate3d(0, 0, 0);
    will-change: transform;
    transition: transform var(--tag-transition), box-shadow var(--tag-transition);
  }

  .tag__surface::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background-color: var(--color-state-on-surface-08);
    opacity: 0;
    z-index: 0;
    transition: opacity var(--tag-transition), background-color var(--tag-transition);
    pointer-events: none;
  }

  .tag__label {
    position: relative;
    z-index: 1;
    display: block;
    min-inline-size: 0;
    max-inline-size: 100%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  @media (hover: hover) and (pointer: fine) {
    .tag:hover .tag__surface {
      transform: translate3d(-1px, -2px, 0);
      box-shadow:
        1px 1px 4px rgba(0, 0, 0, 0.25),
        3px 3px 3px rgba(0, 0, 0, 0.05);
    }

    .tag:hover .tag__surface::before {
      opacity: 1;
    }
  }

  .tag:active .tag__surface {
    transform: translate3d(0, 0, 0);
    transition-duration: 50ms;
    box-shadow: none;
  }

  .tag:active .tag__surface::before {
    background-color: var(--color-state-on-surface-12);
    opacity: 1;
    transition-duration: 50ms;
  }

  .tag:focus-visible {
    outline: var(--focus-outline-width) solid var(--color-focus);
  }

  .tag:focus-visible .tag__surface {
    transform: translate3d(0, 0, 0);
    border-color: transparent;
    box-shadow: none;
  }

  .tag:focus-visible .tag__surface::before {
    opacity: 1;
  }

  .tag:focus-visible .tag__surface::after {
    content: '';
    position: absolute;
    inset: 0;
    border: var(--focus-ring-width) solid var(--color-on-focus);
    border-radius: inherit;
    z-index: 2;
    pointer-events: none;
  }

  @media (prefers-reduced-motion: reduce) {
    .tag__surface,
    .tag__surface::before {
      transition: none;
    }

    .tag:hover .tag__surface,
    .tag:active .tag__surface,
    .tag:focus-visible .tag__surface {
      transform: none;
      box-shadow: none;
    }
  }
</style>
