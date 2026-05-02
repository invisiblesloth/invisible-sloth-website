<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import ProjectCard from '../components/ProjectCard.svelte';
  import type { ProjectBadge, ProjectButton } from '../types/project';

  const fallbackDescription =
    'In the heart of the digital jungle, there lived an invisible sloth named Sloth-Luc.';

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
    parameters: {
      controls: {
        include: ['title', 'subhead', 'description', 'badges', 'button'],
      },
    },
    args: {
      title: 'Project Name',
      subhead: 'Project Subhead',
      description: fallbackDescription,
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
        control: 'text',
        description: 'Plain text fallback when no rich description slot is provided',
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

<Story name="Default">
  {#snippet template(args)}
    <ProjectCard {...args}>
      <p>
        Slotted Markdown-style content wins over the plain description fallback and can include
        <strong>semantic emphasis</strong> inside the project-card description wrapper.
      </p>
    </ProjectCard>
  {/snippet}
</Story>

<Story name="Plain Description Fallback">
  {#snippet template(args)}
    <ProjectCard {...args} />
  {/snippet}
</Story>
