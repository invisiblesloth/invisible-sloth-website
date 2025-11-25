<script lang="ts">
  export let title: string | undefined;
</script>

<svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 24 24"
  width="1em"
  height="1em"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
  aria-hidden={title ? 'false' : 'true'}
  role="img"
>
  {#if title}<title>{title}</title>{/if}
  <line x1="18" y1="6" x2="6" y2="18" />
  <line x1="6" y1="6" x2="18" y2="18" />
</svg>

<style>
  svg {
    display: block;
  }
</style>

