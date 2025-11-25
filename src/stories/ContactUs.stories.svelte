<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import ContactUs from '../components/ContactUs.svelte';

  const { Story } = defineMeta({
    title: 'Molecules/ContactUs',
    component: ContactUs,
    tags: ['autodocs'],
  });
</script>

<Story name="Default" />
