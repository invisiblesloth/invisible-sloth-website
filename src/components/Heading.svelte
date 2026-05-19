<!--
/**
 * Heading
 * Semantic heading typography primitive.
 *
 * Renders one h1-h6 element with the matching .heading-h* utility.
 * Global heading utilities own responsive typography scale; callers own
 * layout, width, padding, spacing, and contextual color.
 *
 * @prop {string} level - Semantic heading level (h1-h6)
 * @prop {string} visualLevel - Optional visual heading scale (defaults to level)
 * @prop {string} text - Optional heading text; defined values, including an empty string, take precedence over children
 * @prop {Snippet} children - Optional snippet for rich content
 * @prop {string} class - Additional classes for the rendered heading element
 */
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { SvelteHTMLElements } from 'svelte/elements';

	type HeadingLevel = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
	type HeadingAttributes = SvelteHTMLElements[HeadingLevel];
	type HeadingProps = Omit<HeadingAttributes, 'class'> & {
		level?: HeadingLevel;
		visualLevel?: HeadingLevel;
		text?: string;
		children?: Snippet;
		class?: string;
	};

	let {
		level = 'h1',
		visualLevel,
		text,
		children,
		class: className = '',
		...restProps
	}: HeadingProps = $props();

	const resolvedVisualLevel = $derived(visualLevel ?? level);
	const headingClasses = $derived(
		['heading', `heading-${resolvedVisualLevel}`, className].filter(Boolean).join(' '),
	);
</script>

<svelte:element this={level} {...restProps} class={headingClasses}>
	{#if text !== undefined}{text}{:else if children}{@render children()}{/if}
</svelte:element>

<style>
	.heading {
		min-width: 0;
		margin: 0;
		color: inherit;
		overflow-wrap: break-word;
	}
</style>
