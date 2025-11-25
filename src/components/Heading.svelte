<!--
/**
 * Heading
 * Semantic heading component with responsive typography and spacing.
 * Supports all heading levels (h1-h6) with appropriate visual hierarchy.
 *
 * @prop {string} level - Semantic heading level (h1-h6)
 * @prop {string} text - Optional heading text (use children snippet for rich content)
 * @prop {Snippet} children - Optional snippet for rich content
 */
-->
<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		level = 'h1',
		text,
		children,
	}: {
		level?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
		text?: string;
		children?: Snippet;
	} = $props();
</script>

<div class="heading" data-level={level}>
	{#if level === 'h1'}
		<h1 class="heading__title heading-h1">
			{#if text}{text}{:else if children}{@render children()}{/if}
		</h1>
	{:else if level === 'h2'}
		<h2 class="heading__title heading-h2">
			{#if text}{text}{:else if children}{@render children()}{/if}
		</h2>
	{:else if level === 'h3'}
		<h3 class="heading__title heading-h3">
			{#if text}{text}{:else if children}{@render children()}{/if}
		</h3>
	{:else if level === 'h4'}
		<h4 class="heading__title heading-h4">
			{#if text}{text}{:else if children}{@render children()}{/if}
		</h4>
	{:else if level === 'h5'}
		<h5 class="heading__title heading-h5">
			{#if text}{text}{:else if children}{@render children()}{/if}
		</h5>
	{:else if level === 'h6'}
		<h6 class="heading__title heading-h6">
			{#if text}{text}{:else if children}{@render children()}{/if}
		</h6>
	{/if}
</div>

<style>
	/* ==========================================
	   BASE STRUCTURE
	   Wrapper container with responsive padding
	   ========================================== */
	.heading {
		display: flex;
		align-items: center;
		justify-content: center;
		padding-inline: var(--space-rail-inline);
	}

	.heading__title {
		flex: 1 1 0;
		min-width: 0;
		min-height: 1px;
		margin: 0;
		color: var(--color-on-surface);
	}

	/* ==========================================
	   LAYOUT CONSTRAINTS
	   Max-width for optimal readability on large viewports
	   Typography is handled by semantic .heading-h* classes
	   ========================================== */
	@media (min-width: 1176px) {
		.heading__title {
			max-width: 840px;
		}
	}
</style>
