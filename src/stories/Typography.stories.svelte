<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import TypographyPreview from './TypographyPreview.svelte';

  // No additional module state needed

  const { Story } = defineMeta({
    title: 'Foundations/Typography'
  });
</script>

<Story name="All Styles">
  <TypographyPreview />
</Story>
