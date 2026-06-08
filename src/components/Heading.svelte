<!--
/**
 * Heading
 * Semantic heading typography primitive.
 *
 * Renders one h1-h6 element with the matching .heading-h* utility.
 * Global heading utilities own responsive typography scale; callers own
 * layout, width, padding, spacing, and contextual color.
 * Native-ish primitive: typed/native root attributes forward to the rendered
 * heading element, and `class` is appended for hooks/layout selectors.
 *
 * @prop {string} level - Semantic heading level (h1-h6)
 * @prop {string} visualLevel - Optional visual heading scale (defaults to level)
 * @prop {string} text - Optional heading text; defined values, including an empty string, take precedence over children
 * @prop {Snippet} children - Optional snippet for rich content
 * @prop {string} class - Additional classes for the rendered heading element
 */
-->
<script module lang="ts">
	import type { Snippet } from 'svelte';
	import type { SvelteHTMLElements } from 'svelte/elements';

	const HEADING_LEVELS = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] as const;

	type HeadingLevel = (typeof HEADING_LEVELS)[number];
	type HeadingAttributes = SvelteHTMLElements[HeadingLevel];
	export type HeadingProps = Omit<HeadingAttributes, 'class'> & {
		level?: HeadingLevel;
		visualLevel?: HeadingLevel;
		text?: string;
		children?: Snippet;
		class?: string;
	};
</script>

<script lang="ts">
	import { normalizeOptionProp } from '../lib/componentValidation';

	let {
		level = 'h1',
		visualLevel,
		text,
		children,
		class: className = '',
		...restProps
	}: HeadingProps = $props();

	const normalizedLevel = $derived(
		normalizeOptionProp({
			value: level,
			allowedValues: HEADING_LEVELS,
			fallbackValue: 'h1',
			componentName: 'Heading',
			propName: 'level',
			warningKey: 'heading:invalid-level',
		}),
	);
	const resolvedVisualLevel = $derived(
		visualLevel === undefined
			? normalizedLevel
			: normalizeOptionProp({
					value: visualLevel,
					allowedValues: HEADING_LEVELS,
					fallbackValue: normalizedLevel,
					componentName: 'Heading',
					propName: 'visualLevel',
					warningKey: 'heading:invalid-visual-level',
					fallbackLabel: 'the resolved semantic level',
				}),
	);
	const headingClasses = $derived(
		['heading', `heading-${resolvedVisualLevel}`, className].filter(Boolean).join(' '),
	);
</script>

<svelte:element this={normalizedLevel} {...restProps} class={headingClasses}>
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
