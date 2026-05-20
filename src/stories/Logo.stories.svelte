<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import Logo from '../components/Logo.svelte';
  import LogoLink from '../components/LogoLink.svelte';
  import { DEFAULT_LOGO_LINK_LABEL } from '../lib/logo';

  const defaultLogoAlt = 'Invisible Sloth logo featuring Sloth-Luc, the ghost sloth';

  const { Story } = defineMeta({
    title: 'Brand/Logo',
    tags: ['autodocs'],
    parameters: {
      docs: {
        description: {
          component:
            'Invisible Sloth logo primitives with system and manual theme support. `Logo` renders the standalone brand mark, while `LogoLink` renders linked brand navigation.',
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
        story: 'Simplified technical mark used by the site header.',
      },
    },
  }}
>
  <Logo variant="technical" size="96px" alt={defaultLogoAlt} />
</Story>

<Story
  name="Standard (Footer)"
  parameters={{
    docs: {
      description: {
        story: 'Full standard mark used by the site footer and larger brand surfaces.',
      },
    },
  }}
>
  <Logo variant="standard" size="160px" alt={defaultLogoAlt} />
</Story>

<Story
  name="Linked LogoLink"
  parameters={{
    docs: {
      description: {
        story:
          'LogoLink uses the anchor accessible name and renders the nested logo as decorative.',
      },
    },
  }}
>
  <LogoLink
    href="/"
    variant="technical"
    size="96px"
    label={DEFAULT_LOGO_LINK_LABEL}
  />
</Story>

<Story
  name="Standalone Logo"
  parameters={{
    docs: {
      description: {
        story:
          'Use Logo directly for non-link brand marks. The mark carries the accessible image name.',
      },
    },
  }}
>
  <Logo variant="standard" size="160px" alt={defaultLogoAlt} />
</Story>

<Story
  name="LogoLink Blank Href Fallback"
  parameters={{
    docs: {
      description: {
        story:
          'Blank LogoLink href values are invalid, fall back to the home URL, and warn in development.',
      },
    },
  }}
>
  <LogoLink href="" variant="technical" size="96px" label={DEFAULT_LOGO_LINK_LABEL} />
</Story>

<Story
  name="LogoLink Blank Label Fallback"
  parameters={{
    docs: {
      description: {
        story:
          'Blank LogoLink labels are invalid, fall back to the default home link label, and warn in development.',
      },
    },
  }}
>
  <LogoLink href="/" variant="technical" size="96px" label="" />
</Story>

<Story name="Size Comparison">
  <div style="display: flex; flex-direction: column; gap: 3rem; align-items: flex-start;">
    <div>
      <h3 style="margin: 0 0 1rem 0; font-size: 1.25rem; font-weight: 600;">Technical Logo</h3>
      <div style="display: flex; gap: 2rem; align-items: flex-end;">
        <div style="text-align: center;">
          <Logo variant="technical" size="sm" alt={defaultLogoAlt} />
          <p style="margin: 0.5rem 0 0 0; font-size: 0.875rem; color: #666;">sm (48px)</p>
        </div>
        <div style="text-align: center;">
          <Logo variant="technical" size="md" alt={defaultLogoAlt} />
          <p style="margin: 0.5rem 0 0 0; font-size: 0.875rem; color: #666;">md (96px)</p>
        </div>
        <div style="text-align: center;">
          <Logo variant="technical" size="lg" alt={defaultLogoAlt} />
          <p style="margin: 0.5rem 0 0 0; font-size: 0.875rem; color: #666;">lg (160px)</p>
        </div>
        <div style="text-align: center;">
          <Logo variant="technical" size="xl" alt={defaultLogoAlt} />
          <p style="margin: 0.5rem 0 0 0; font-size: 0.875rem; color: #666;">xl (192px)</p>
        </div>
      </div>
    </div>

    <div>
      <h3 style="margin: 0 0 1rem 0; font-size: 1.25rem; font-weight: 600;">Standard Logo</h3>
      <div style="display: flex; gap: 2rem; align-items: flex-end;">
        <div style="text-align: center;">
          <Logo variant="standard" size="sm" alt={defaultLogoAlt} />
          <p style="margin: 0.5rem 0 0 0; font-size: 0.875rem; color: #666;">sm (48px)</p>
        </div>
        <div style="text-align: center;">
          <Logo variant="standard" size="md" alt={defaultLogoAlt} />
          <p style="margin: 0.5rem 0 0 0; font-size: 0.875rem; color: #666;">md (96px)</p>
        </div>
        <div style="text-align: center;">
          <Logo variant="standard" size="lg" alt={defaultLogoAlt} />
          <p style="margin: 0.5rem 0 0 0; font-size: 0.875rem; color: #666;">lg (160px)</p>
        </div>
        <div style="text-align: center;">
          <Logo variant="standard" size="xl" alt={defaultLogoAlt} />
          <p style="margin: 0.5rem 0 0 0; font-size: 0.875rem; color: #666;">xl (192px)</p>
        </div>
      </div>
    </div>
  </div>
</Story>
