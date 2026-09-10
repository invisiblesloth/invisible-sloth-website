<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import Divider from '../../../../../src/components/Divider.svelte';

  const { Story } = defineMeta({
    title: 'Fixtures/Invalid CSF',
    component: Divider,
    args: { orientation: 'diagonal' },
  });
</script>

<Story name="Invalid" />
