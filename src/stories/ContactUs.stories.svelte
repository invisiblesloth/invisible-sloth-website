<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import ContactUs from '../components/ContactUs.svelte';
  import type { ContactUsProps } from '../components/ContactUs.svelte';

  const contactText: ContactUsProps['text'] =
    'For questions, support, or just to say hi, email us at';
  const contactEmail: ContactUsProps['email'] = 'hello@invisiblesloth.com';
  const longContactText: ContactUsProps['text'] =
    'For partnership conversations, support questions, press notes, project follow-ups, and anything else that needs a careful human response, email us at';

  const { Story } = defineMeta({
    title: 'Molecules/ContactUs',
    component: ContactUs,
    tags: ['autodocs'],
    parameters: {
      docs: {
        description: {
          component:
            'Email contact CTA surface. Parent composition owns placement and width constraints; wrap standalone usage in a rail/container when needed. `text` and `email` are required, trimmed at the boundary, and fail fast when blank; blank static values can fail the production build. Required controls remain editable, so blanking them may break the story canvas. Migration note: every `<ContactUs />` usage must become `<ContactUs text="..." email="..." />`.',
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
        description: 'Required contact CTA copy that appears before the email link.',
      },
      email: {
        control: 'text',
        description:
          'Required email address used for both the visible label and mailto link. Syntax validation is out of scope.',
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
