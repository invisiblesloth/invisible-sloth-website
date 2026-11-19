<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import AppStoreBadge from '../components/AppStoreBadge.svelte';

  const { Story } = defineMeta({
    title: 'Atoms/AppStoreBadge',
    component: AppStoreBadge,
    tags: ['autodocs'],
    parameters: {
      layout: 'centered',
      controls: { include: ['href'] },
      docs: {
        description: {
          component:
            'Unmodified official Apple artwork, 48px high with 12px clear space. Accepts only an absolute HTTPS apps.apple.com product URL ending in /id followed by a positive numeric ID, with optional country, app slug, query, and fragment. Missing href silently renders a noninteractive image. Blank, non-string, and invalid values render the same pending image and warn once in browser development. No attribute forwarding, class hook, animation, or hydration is required. Linked uses an inert example destination, not Tracer’s unreleased listing.',
        },
      },
    },
    argTypes: {
      href: {
        control: 'text',
        description:
          'Optional App Store product URL. Trimmed before use; malformed values fall back to the pending image. Valid destinations open in the same tab.',
      },
    },
  });
</script>

<Story name="Pending" />
<Story name="Linked" args={{ href: 'https://apps.apple.com/app/id123456789' }} />
<Story name="Blank URL Fallback" args={{ href: '   ' }} />
<Story name="Invalid URL Fallback" args={{ href: 'https://example.com/app/id123456789' }} />
<Story name="Non-string URL Fallback" args={{ href: 42 as unknown as string }} />
