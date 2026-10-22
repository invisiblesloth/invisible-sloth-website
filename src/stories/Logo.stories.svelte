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
      controls: { disable: true },
      docs: {
        description: {
          component:
            'Invisible Sloth logo primitives with system and manual theme support. `Logo` renders the standalone brand mark, while `LogoLink` renders linked brand navigation. Both share variant and size. alt and decorative belong to Logo; href, label, and the root class hook belong to LogoLink. These fixed examples document both contracts without a unified args-driven renderer. This fixed example does not consume Storybook args; controls are disabled.',
        },
      },
    },
    argTypes: {
      variant: { control: false, options: ['technical', 'standard'], description: 'Shared artwork variant; defaults to standard. Unsupported variants fall back to standard with a development warning.' },
      size: { control: false, description: 'Shared size: sm (48px), md (96px, the default), lg (160px), xl (192px), or a CSS size string. Blank sizes fall back to md.' },
      alt: { control: false, description: 'Logo-only image name when non-decorative. Blank text falls back to the default logo description with a development warning.' },
      decorative: { control: false, description: 'Logo-only flag hiding the mark from assistive technology and removing its image role and label. LogoLink always uses a decorative nested mark.' },
      href: { control: false, description: 'LogoLink-only destination. Blank values fall back to / with a development warning; use Logo for an unlinked mark.' },
      label: { control: false, description: 'LogoLink-only accessible link name. Omitted or blank values fall back to Invisible Sloth home and warn in development.' },
      class: { control: false, description: 'Optional LogoLink root class hook; standalone Logo does not expose it.' },
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
