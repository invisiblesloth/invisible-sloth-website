<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import ProjectCard from '../components/ProjectCard.svelte';

  const { Story } = defineMeta({
    title: 'Organisms/ProjectCard',
    component: ProjectCard,
    tags: ['autodocs'],
    args: {
      title: 'Project Name',
      subhead: 'Project Subhead',
      description: 'In the heart of the digital jungle, there lived an invisible sloth named Sloth-Luc.',
      ctaLabel: 'Call to Action',
      showButton: true,
      ctaHasTrailingIcon: true,
      badges: [
        { variant: 'default', label: 'Badge 1' },
        { variant: 'default', label: 'Badge 2' },
        { variant: 'default', label: 'Badge 3' },
        { variant: 'default', label: 'Badge 4' },
      ],
    },
    argTypes: {
      title: {
        control: 'text',
        description: 'Project name/title',
      },
      subhead: {
        control: 'text',
        description: 'Project subheading',
      },
      description: {
        control: 'text',
        description: 'Project description text',
      },
      ctaLabel: {
        control: 'text',
        description: 'Call-to-action button text',
      },
      badges: {
        control: 'object',
        description: 'Array of badge objects with variant and label',
      },
      showButton: {
        control: 'boolean',
        description: 'Toggle visibility of the CTA button',
      },
      ctaHasTrailingIcon: {
        control: 'boolean',
        description: 'Display the trailing icon on the CTA button',
      },
    },
  });
</script>

<Story name="Default" />
