<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import FooterLinks from '../components/FooterLinks.svelte';
  import type { FooterLinksProps } from '../components/FooterLinks.svelte';
  import type { NavigationSection } from '../lib/navigation';

  const defaultSections: NavigationSection[] = [
    {
      heading: 'Social',
      items: [
        {
          label: 'GitHub',
          href: 'https://github.com/invisiblesloth',
          target: '_blank',
        },
      ],
    },
    {
      heading: 'Legal',
      items: [
        { label: 'Privacy Policy', href: '/privacy' },
        { label: 'Terms', href: '/terms' },
      ],
    },
  ];

  const longLabelSections: NavigationSection[] = [
    {
      heading: 'Social',
      items: [
        {
          label: 'Follow Invisible Sloth development and open-source work on GitHub',
          href: '#long-phrase',
        },
      ],
    },
    {
      heading: 'Legal',
      items: [
        {
          label: 'ExtraordinarilyLongUnbrokenFooterNavigationDestination',
          href: '#long-token',
        },
      ],
    },
  ];

  const invalidSections = [
    null,
    [],
    {
      heading: 'Invalid links',
      items: [
        { label: '   ', href: '#missing-label' },
        { label: 'Missing href', href: '   ' },
        'not-an-item',
        [],
      ],
    },
    {
      heading: 42,
      items: 'not-an-array',
    },
  ] as unknown as NavigationSection[];

  const { Story } = defineMeta({
    title: 'Molecules/FooterLinks',
    component: FooterLinks,
    tags: ['autodocs'],
    parameters: {
      layout: 'fullscreen',
      controls: {
        include: ['sections', 'ariaLabel'],
      },
      docs: {
        description: {
          component:
            'Grouped footer navigation. Omitted or valid empty data renders no DOM. Present malformed data is skipped with deduplicated development warnings. The class hook lands on the nav only when valid sections remain, so it has no target in the empty state.',
        },
      },
    },
    args: {
      sections: defaultSections,
      ariaLabel: 'Footer navigation',
    },
    argTypes: {
      sections: {
        control: 'object',
        description:
          'Grouped navigation data. Valid empty data is silent; malformed present data is skipped with development warnings.',
      },
      ariaLabel: {
        control: 'text',
        description:
          'Accessible nav label. Omission uses “Footer navigation”; a present blank value warns and falls back.',
      },
      class: {
        control: false,
        table: { disable: true },
      },
    },
  });

  const emptySections: NonNullable<FooterLinksProps['sections']> = [];
</script>

<style>
  .footer-links-story__absence-check {
    inline-size: 100%;
    padding: var(--space-400);
    color: var(--color-on-background-dim);
  }

  .footer-links-story__absence-check p {
    margin: 0;
  }
</style>

<Story name="Default">
  {#snippet template(args)}
    <FooterLinks {...args} />
  {/snippet}
</Story>

<Story name="Long Labels" args={{ sections: longLabelSections }}>
  {#snippet template(args)}
    <FooterLinks {...args} />
  {/snippet}
</Story>

<Story name="Aria Label Fallback" args={{ ariaLabel: '   ' }}>
  {#snippet template(args)}
    <FooterLinks {...args} />
  {/snippet}
</Story>

<Story name="Empty" args={{ sections: emptySections }}>
  {#snippet template(args)}
    <div class="footer-links-story__absence-check" data-case="empty">
      <FooterLinks {...args} />
      <p>The story marker should contain no FooterLinks navigation.</p>
    </div>
  {/snippet}
</Story>

<Story name="Invalid Data" args={{ sections: invalidSections }}>
  {#snippet template(args)}
    <div class="footer-links-story__absence-check" data-case="invalid">
      <FooterLinks {...args} />
      <p>The story marker should contain no FooterLinks navigation.</p>
    </div>
  {/snippet}
</Story>
