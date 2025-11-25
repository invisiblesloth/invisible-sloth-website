<script lang="ts">
  export let sample = 'The quick brown fox jumps over the lazy dog.';
  export let showClassNames = true;
  export let maxWidth: '640px' | '768px' | '1024px' | 'none' = '768px';
  export let rowGap = 'var(--space-400)';
  export let groupGap = 'var(--space-600)';

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
        'text-body-large-prominent',
        'text-body-large-italic',
        'text-body-large-italic-prominent',
        'text-body-medium',
        'text-body-medium-prominent',
        'text-body-medium-italic',
        'text-body-medium-italic-prominent',
        'text-body-small',
        'text-body-small-prominent',
      ],
    },
  ];
</script>

<div style:display="grid" style:gap={groupGap}>
  {#each groups as group}
    <section>
      <h3 class="text-title-large-prominent" style="margin: 0 0 var(--space-300) 0;">
        {group.title}
      </h3>
      <div style:display="grid" style:gap={rowGap} style:max-width={maxWidth === 'none' ? 'none' : maxWidth}>
        {#each group.items as klass}
          <div>
            <p class={klass} style="margin: 0;">{sample}</p>
            {#if showClassNames}
              <code style="display: inline-block; opacity: 0.7; font-size: 12px; margin-top: var(--space-100);">.{klass}</code>
            {/if}
          </div>
        {/each}
      </div>
    </section>
  {/each}
  
</div>

