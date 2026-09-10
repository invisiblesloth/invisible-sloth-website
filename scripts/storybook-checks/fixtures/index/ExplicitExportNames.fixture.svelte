<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import Divider from '../../../../src/components/Divider.svelte';

  const { Story } = defineMeta({
    title: 'Fixtures/Explicit Export Names',
    component: Divider,
    tags: ['autodocs'],
  });
</script>

<Story name="Numbered export" exportName="MyStory1" />
<Story name="Acronym export" exportName="HTTPStatus" />
