<script lang="ts">
  import NavigationDrawer from '../components/NavigationDrawer.svelte';
  import SiteHeader from '../components/SiteHeader.svelte';
  import type { NavigationSection } from '../lib/navigation';

  const drawerId = 'storybook-navigation-drawer';
  const pageAnchors = ['home', 'blog', 'about', 'roxy', 'privacy-policy', 'terms'];

  let drawerOpen = $state(false);

  let {
    sections,
    activeHref = '#home',
  }: {
    sections: NavigationSection[];
    activeHref?: string;
  } = $props();

  function openDrawer(): void {
    drawerOpen = true;
  }

  function closeDrawer(): void {
    drawerOpen = false;
  }
</script>

<div class="navigation-demo">
  <div
    class="navigation-demo__background"
    aria-hidden={drawerOpen ? 'true' : undefined}
    inert={drawerOpen}
  >
    <SiteHeader
      showMenuButton
      menuExpanded={drawerOpen}
      menuControlsId={drawerId}
      onMenuClick={openDrawer}
      homeHref="/"
    />

    <main class="navigation-demo__page">
      <div class="navigation-demo__anchors" aria-hidden="true">
        {#each pageAnchors as anchor}
          <span id={anchor} class="navigation-demo__anchor"></span>
        {/each}
      </div>
    </main>
  </div>

  <NavigationDrawer
    id={drawerId}
    open={drawerOpen}
    {sections}
    {activeHref}
    onclose={closeDrawer}
  />
</div>

<style>
  .navigation-demo {
    min-block-size: 100dvh;
    background: var(--color-background);
  }

  .navigation-demo__page {
    position: relative;
    min-block-size: max(100dvh, 1366px);
  }

  .navigation-demo__anchors {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }

  .navigation-demo__anchor {
    position: absolute;
    inset-inline-start: 0;
    display: block;
    inline-size: 1px;
    block-size: 1px;
    scroll-margin-block-start: var(--space-section-block);
  }

  .navigation-demo__anchor:nth-child(1) {
    inset-block-start: 0;
  }

  .navigation-demo__anchor:nth-child(2) {
    inset-block-start: 20%;
  }

  .navigation-demo__anchor:nth-child(3) {
    inset-block-start: 40%;
  }

  .navigation-demo__anchor:nth-child(4) {
    inset-block-start: 60%;
  }

  .navigation-demo__anchor:nth-child(5) {
    inset-block-start: 80%;
  }

  .navigation-demo__anchor:nth-child(6) {
    inset-block-start: 90%;
  }
</style>
