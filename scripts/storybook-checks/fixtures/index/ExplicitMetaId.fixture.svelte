<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import Divider from '../../../../src/components/Divider.svelte';

  const { Story } = defineMeta({
    id: 'fixture-explicit-meta',
    title: 'Fixtures/Explicit Meta ID',
    component: Divider,
    tags: ['autodocs'],
  });
</script>

<Story name="Default" exportName="DefaultState" />
