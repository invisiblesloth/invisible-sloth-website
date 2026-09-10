<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import Divider from '../../../../../src/components/Divider.svelte';
  import type { DividerProps } from '../../../../../src/components/Divider.svelte';

  const malformed = 'diagonal' as unknown as DividerProps['orientation'];
  const { Story } = defineMeta({
    title: 'Fixtures/Asserted Runtime',
    component: Divider,
    args: { orientation: malformed },
  });
</script>

<Story name="Asserted" />
