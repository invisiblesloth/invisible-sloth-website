<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import ContactUs from '../components/ContactUs.svelte';

  const contactText = 'For questions, support, or just to say hi, email us at';
  const contactEmail = 'hello@invisiblesloth.com';
  const longContactText =
    'For partnership conversations, support questions, press notes, project follow-ups, and anything else that needs a careful human response, email us at';

  const { Story } = defineMeta({
    title: 'Molecules/ContactUs',
    component: ContactUs,
    tags: ['autodocs'],
    parameters: {
      docs: {
        description: {
          component:
            'Email contact CTA surface. Parent composition owns placement and width constraints; wrap standalone usage in a rail/container when needed. `text` and `email` are trimmed at the boundary, and blank runtime values emit dev-only warnings. Migration note: every `<ContactUs />` usage must become `<ContactUs text="..." email="..." />`.',
        },
      },
      controls: {
        include: ['text', 'email'],
      },
    },
    args: {
      text: contactText,
      email: contactEmail,
    },
    argTypes: {
      text: {
        control: 'text',
        description: 'Contact CTA copy that appears before the email link.',
      },
      email: {
        control: 'text',
        description: 'Email address used for both the visible label and mailto link.',
      },
    },
  });
</script>

<Story name="Default">
  {#snippet template(args)}
    <div class="rail rail--md rail--padded">
      <ContactUs {...args} />
    </div>
  {/snippet}
</Story>

<Story
  name="Long Copy"
  args={{
    text: longContactText,
    email: contactEmail,
  }}
>
  {#snippet template(args)}
    <div class="rail rail--md rail--padded">
      <ContactUs {...args} />
    </div>
  {/snippet}
</Story>

<Story
  name="Whitespace Trim"
  args={{
    text: `  ${contactText}  `,
    email: `  ${contactEmail}  `,
  }}
>
  {#snippet template(args)}
    <div class="rail rail--md rail--padded">
      <ContactUs {...args} />
    </div>
  {/snippet}
</Story>
