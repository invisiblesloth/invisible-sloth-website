<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Heading from '../components/Heading.svelte';

	const { Story } = defineMeta({
		title: 'Molecules/Heading',
		component: Heading,
		tags: ['autodocs'],
		argTypes: {
			level: {
				control: 'select',
				options: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
				description: 'Semantic heading level (h1-h6)',
				table: {
					type: { summary: 'string' },
					defaultValue: { summary: 'h1' },
				},
			},
			text: {
				control: 'text',
				description: 'Heading text content (use slot for rich content)',
				table: {
					type: { summary: 'string' },
					defaultValue: { summary: 'undefined' },
				},
			},
		},
	});
</script>

<!-- H1 Story -->
<Story
	name="H1"
	args={{
		level: 'h1',
		text: 'H1 - Primary Heading',
	}}
/>

<!-- H2 Story -->
<Story
	name="H2"
	args={{
		level: 'h2',
		text: 'H2 - Secondary Heading',
	}}
/>

<!-- H3 Story -->
<Story
	name="H3"
	args={{
		level: 'h3',
		text: 'H3 - Tertiary Heading',
	}}
/>

<!-- H4 Story -->
<Story
	name="H4"
	args={{
		level: 'h4',
		text: 'H4 - Section Heading',
	}}
/>

<!-- H5 Story -->
<Story
	name="H5"
	args={{
		level: 'h5',
		text: 'H5 - Subsection Heading',
	}}
/>

<!-- H6 Story -->
<Story
	name="H6"
	args={{
		level: 'h6',
		text: 'H6 - Minor Heading',
	}}
/>

<!-- All Levels Comparison -->
<Story name="All Levels" args={{ level: 'h1' }}>
	<div style="display: flex; flex-direction: column; gap: 0;">
		<Heading level="h1" text="H1 - Primary Heading" />
		<Heading level="h2" text="H2 - Secondary Heading" />
		<Heading level="h3" text="H3 - Tertiary Heading" />
		<Heading level="h4" text="H4 - Section Heading" />
		<Heading level="h5" text="H5 - Subsection Heading" />
		<Heading level="h6" text="H6 - Minor Heading" />
	</div>
</Story>
