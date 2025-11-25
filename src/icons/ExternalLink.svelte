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
  <path d="M18 13v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
  <path d="M15 3h6v6" />
  <path d="m10 14 11-11" />
</svg>

<style>
  svg {
    display: block;
  }
</style>
