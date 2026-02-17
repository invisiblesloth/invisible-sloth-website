<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import TypographyPreview from './TypographyPreview.svelte';

  const { Story } = defineMeta({
    title: 'Foundations/Typography',
    tags: ['autodocs'],
  });
</script>

<Story name="All Styles">
  <TypographyPreview />
</Story>
