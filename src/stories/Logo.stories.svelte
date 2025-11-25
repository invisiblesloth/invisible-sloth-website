<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import LogoTechnical from '../components/LogoTechnical.svelte';
  import LogoStandard from '../components/LogoStandard.svelte';

  const { Story } = defineMeta({
    title: 'Brand/Logo',
    tags: ['autodocs'],
    parameters: {
      docs: {
        description: {
          component:
            'Invisible Sloth logo components with automatic dark mode support. Two variants available: Technical (simplified for headers at 96px) and Standard (full design for footers at 160px). Both use CSS-based theme switching with no JavaScript required. Toggle dark mode in the toolbar to see theme switching in action.',
        },
      },
    },
  });
</script>

<Story
  name="Technical (Header)"
  parameters={{
    docs: {
      description: {
        story:
          'Simplified technical logo designed for headers. Features a cleaner, more compact design optimized for navigation bars and small spaces. Displayed at 96px.',
      },
    },
  }}
>
  <LogoTechnical size="96px" alt="Invisible Sloth" />
</Story>

<Story
  name="Standard (Footer)"
  parameters={{
    docs: {
      description: {
        story:
          'Full standard logo designed for footers and brand showcases. Features the complete sloth illustration with more detail. Displayed at 160px.',
      },
    },
  }}
>
  <LogoStandard size="160px" alt="Invisible Sloth" />
</Story>

<Story name="Size Comparison">
  <div style="display: flex; flex-direction: column; gap: 3rem; align-items: flex-start;">
    <div>
      <h3 style="margin: 0 0 1rem 0; font-size: 1.25rem; font-weight: 600;">Technical Logo</h3>
      <div style="display: flex; gap: 2rem; align-items: flex-end;">
        <div style="text-align: center;">
          <LogoTechnical size="sm" alt="Invisible Sloth" />
          <p style="margin: 0.5rem 0 0 0; font-size: 0.875rem; color: #666;">sm (48px)</p>
        </div>
        <div style="text-align: center;">
          <LogoTechnical size="md" alt="Invisible Sloth" />
          <p style="margin: 0.5rem 0 0 0; font-size: 0.875rem; color: #666;">md (96px)</p>
        </div>
        <div style="text-align: center;">
          <LogoTechnical size="lg" alt="Invisible Sloth" />
          <p style="margin: 0.5rem 0 0 0; font-size: 0.875rem; color: #666;">lg (160px)</p>
        </div>
        <div style="text-align: center;">
          <LogoTechnical size="xl" alt="Invisible Sloth" />
          <p style="margin: 0.5rem 0 0 0; font-size: 0.875rem; color: #666;">xl (192px)</p>
        </div>
      </div>
    </div>

    <div>
      <h3 style="margin: 0 0 1rem 0; font-size: 1.25rem; font-weight: 600;">Standard Logo</h3>
      <div style="display: flex; gap: 2rem; align-items: flex-end;">
        <div style="text-align: center;">
          <LogoStandard size="sm" alt="Invisible Sloth" />
          <p style="margin: 0.5rem 0 0 0; font-size: 0.875rem; color: #666;">sm (48px)</p>
        </div>
        <div style="text-align: center;">
          <LogoStandard size="md" alt="Invisible Sloth" />
          <p style="margin: 0.5rem 0 0 0; font-size: 0.875rem; color: #666;">md (96px)</p>
        </div>
        <div style="text-align: center;">
          <LogoStandard size="lg" alt="Invisible Sloth" />
          <p style="margin: 0.5rem 0 0 0; font-size: 0.875rem; color: #666;">lg (160px)</p>
        </div>
        <div style="text-align: center;">
          <LogoStandard size="xl" alt="Invisible Sloth" />
          <p style="margin: 0.5rem 0 0 0; font-size: 0.875rem; color: #666;">xl (192px)</p>
        </div>
      </div>
    </div>
  </div>
</Story>
