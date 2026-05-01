<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import ProjectCard from '../components/ProjectCard.svelte';
  import type { ProjectBadge, ProjectButton, ProjectDescription } from '../types/project';

  const defaultDescription: ProjectDescription = {
    kind: 'text',
    text: 'In the heart of the digital jungle, there lived an invisible sloth named Sloth-Luc.',
  };

  const defaultButton: ProjectButton = {
    label: 'Call to Action',
    href: '/projects/example',
    hasTrailingIcon: true,
  };

  const defaultBadges: ProjectBadge[] = [
    { variant: 'default', label: 'Badge 1' },
    { variant: 'default', label: 'Badge 2' },
    { variant: 'default', label: 'Badge 3' },
    { variant: 'default', label: 'Badge 4' },
  ];

  const { Story } = defineMeta({
    title: 'Organisms/ProjectCard',
    component: ProjectCard,
    tags: ['autodocs'],
    args: {
      title: 'Project Name',
      subhead: 'Project Subhead',
      description: defaultDescription,
      button: defaultButton,
      badges: defaultBadges,
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
        control: 'object',
        description: 'Project description display content',
      },
      badges: {
        control: 'object',
        description: 'Array of badge objects with variant and label',
      },
      button: {
        control: 'object',
        description: 'Optional project CTA button',
      },
    },
  });
</script>

<Story name="Default" />
