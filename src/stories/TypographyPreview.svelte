<script lang="ts">
  export let sample = 'The quick brown fox jumps over the lazy dog.';
  export let showClassNames = true;
  export let maxWidth: '640px' | '768px' | '1024px' | 'none' = '768px';
  export let rowGap = 'var(--space-400)';
  export let groupGap = 'var(--space-600)';

  const semanticViewportItems = [
    'text-display-card-title-responsive',
    'text-supporting-heading-responsive',
    'text-metadata-date-responsive',
    'text-byline-author-responsive',
  ];

  const summaryCardItems = [
    'text-summary-card-kicker',
    'text-summary-card-title',
    'text-summary-card-description',
    'text-summary-card-date',
    'text-summary-card-author',
  ];

  const summaryCardExamples = [
    {
      label: 'summary-card container width: 359px',
      width: '359px',
    },
    {
      label: 'summary-card container width: 360px',
      width: '360px',
    },
  ];

  const groups: Array<{ title: string; items: string[] }> = [
    {
      title: 'Display',
      items: [
        'text-display-extra-large',
        'text-display-large',
        'text-display-medium',
        'text-display-small',
        'text-display-extra-small',
      ],
    },
    {
      title: 'Headline',
      items: [
        'text-headline-extra-large',
        'text-headline-extra-large-prominent',
        'text-headline-large',
        'text-headline-large-prominent',
        'text-headline-medium',
        'text-headline-medium-prominent',
        'text-headline-small',
        'text-headline-small-prominent',
      ],
    },
    {
      title: 'Title',
      items: [
        'text-title-large',
        'text-title-large-prominent',
        'text-title-medium',
        'text-title-medium-prominent',
        'text-title-small',
        'text-title-small-prominent',
      ],
    },
    {
      title: 'Label',
      items: [
        'text-label-extra-large',
        'text-label-extra-large-prominent',
        'text-label-large',
        'text-label-large-prominent',
        'text-label-medium',
        'text-label-medium-prominent',
        'text-label-small',
        'text-label-small-prominent',
      ],
    },
    {
      title: 'Body',
      items: [
        'text-body-large',
        'text-body-large-tight',
        'text-body-large-prominent',
        'text-body-large-italic',
        'text-body-large-italic-prominent',
        'text-body-medium',
        'text-body-medium-tight',
        'text-body-medium-prominent',
        'text-body-medium-italic',
        'text-body-medium-italic-prominent',
        'text-body-small',
        'text-body-small-prominent',
        'text-body-responsive',
        'text-body-responsive-tight',
      ],
    },
  ];
</script>

<div style:display="grid" style:gap={groupGap}>
  {#each groups as group}
    <section>
      <h3
        class="typography-preview__heading text-title-large-prominent"
        style="margin: 0 0 var(--space-300) 0;"
      >
        {group.title}
      </h3>
      <div style:display="grid" style:gap={rowGap} style:max-width={maxWidth === 'none' ? 'none' : maxWidth}>
        {#each group.items as klass}
          <div>
            <p class={klass} style="margin: 0;">{sample}</p>
            {#if showClassNames}
              <code class="typography-preview__class-name">.{klass}</code>
            {/if}
          </div>
        {/each}
      </div>
    </section>
  {/each}

  <section>
    <h3
      class="typography-preview__heading text-title-large-prominent"
      style="margin: 0 0 var(--space-300) 0;"
    >
      Semantic
    </h3>

    <div class="typography-preview__semantic" style:gap={rowGap}>
      <div>
        <h4
          class="typography-preview__heading text-title-medium-prominent"
          style="margin: 0 0 var(--space-300) 0;"
        >
          Viewport-responsive utilities
        </h4>
        <div style:display="grid" style:gap={rowGap} style:max-width={maxWidth === 'none' ? 'none' : maxWidth}>
          {#each semanticViewportItems as klass}
            <div>
              <p class={klass} style="margin: 0;">{sample}</p>
              {#if showClassNames}
                <code class="typography-preview__class-name">.{klass}</code>
              {/if}
            </div>
          {/each}
        </div>
      </div>

      <div>
        <h4
          class="typography-preview__heading text-title-medium-prominent"
          style="margin: 0 0 var(--space-300) 0;"
        >
          Summary-card utilities by container width
        </h4>
        <p
          class="typography-preview__description text-body-small"
          style="margin: 0 0 var(--space-300) 0; max-width: 68ch;"
        >
          These examples use an ancestor with container-type: inline-size and
          container-name: summary-card. The 359px and 360px labels are container
          widths, not viewport widths.
        </p>
        <div class="typography-preview__summary-grid" style:gap={rowGap}>
          {#each summaryCardExamples as example}
            <div
              class="typography-preview__summary-card-container"
              style:inline-size={example.width}
            >
              <p
                class="typography-preview__heading text-label-large-prominent"
                style="margin: 0;"
              >
                {example.label}
              </p>
              {#each summaryCardItems as klass}
                <div>
                  <p class={klass} style="margin: 0;">{sample}</p>
                  {#if showClassNames}
                    <code class="typography-preview__class-name">.{klass}</code>
                  {/if}
                </div>
              {/each}
            </div>
          {/each}
        </div>
      </div>
    </div>
  </section>
</div>

<style>
  .typography-preview__heading,
  .typography-preview__description {
    color: var(--color-on-surface-variant);
  }

  .typography-preview__class-name {
    display: inline-block;
    margin-top: var(--space-100);
    color: var(--color-on-surface-dim);
    font-size: 12px;
  }

  .typography-preview__semantic,
  .typography-preview__summary-grid,
  .typography-preview__summary-card-container {
    display: grid;
  }

  .typography-preview__summary-grid {
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 360px), 1fr));
    justify-items: start;
  }

  .typography-preview__summary-card-container {
    box-sizing: border-box;
    max-inline-size: 100%;
    gap: var(--space-300);
    container-type: inline-size;
    container-name: summary-card;
  }
</style>
