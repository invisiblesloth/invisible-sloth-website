<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import ProjectCard from '../components/ProjectCard.svelte';
  import type { ProjectCardProps } from '../components/ProjectCard.svelte';
  import type { ProjectBadge, ProjectButton } from '../types/project';

  const fallbackDescription =
    'In the heart of the digital jungle, there lived an invisible sloth named Sloth-Luc.';

  const headingLevelOptions = [1, 2, 3, 4, 5, 6] as const satisfies readonly NonNullable<
    ProjectCardProps['headingLevel']
  >[];
  // Exercises ProjectCard's runtime guard for non-typed callers.
  const invalidRuntimeHeadingLevel = 0 as unknown as NonNullable<
    ProjectCardProps['headingLevel']
  >;

  const defaultButton: ProjectButton = {
    label: 'Call to Action',
    href: 'https://github.com/invisiblesloth/roxy-engine',
    target: '_blank',
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
        include: ['title', 'subhead', 'description', 'headingLevel', 'badges', 'button'],
      },
      docs: {
        description: {
          component:
            'Featured project card. Parent layouts own outer width and rail behavior; the root `class` hook lands on the root div for layout/global selectors only.',
        },
      },
    },
    args: {
      title: 'Project Name',
      subhead: 'Project Subhead',
      description: fallbackDescription,
      headingLevel: 2,
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
      headingLevel: {
        control: { type: 'select' },
        options: headingLevelOptions,
        description: 'Semantic title heading level. Typography remains card-scoped.',
      },
      badges: {
        control: 'object',
        description: 'Array of badge objects with variant and label',
      },
      button: {
        control: 'object',
        description: 'Optional project CTA button',
      },
      class: {
        control: false,
        description:
          'Optional root div class hook for layout hooks, global utilities, and global selectors.',
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

<Story name="Semantic Heading Level">
  {#snippet template(args)}
    <ProjectCard {...args} headingLevel={3} />
  {/snippet}
</Story>

<Story name="Invalid Heading Level Fallback">
  {#snippet template(args)}
    <ProjectCard {...args} headingLevel={invalidRuntimeHeadingLevel} />
  {/snippet}
</Story>

<Story name="CTA Icon Policy">
  {#snippet template()}
    <div class="project-card-story-stack">
      <ProjectCard
        title="Third-Party Absolute URL"
        description="External third-party HTTP(S) links show the decorative external-link icon."
        button={{
          label: 'External Link',
          href: 'https://github.com/invisiblesloth/roxy-engine',
          target: '_blank',
        }}
        badges={defaultBadges.slice(0, 1)}
      />

      <ProjectCard
        title="First-Party Absolute URL"
        description="First-party absolute links do not show the external-link icon."
        button={{
          label: 'First-Party Link',
          href: 'https://invisiblesloth.com/projects',
        }}
        badges={defaultBadges.slice(0, 1)}
      />

      <ProjectCard
        title="Relative URL"
        description="Relative links stay internal and do not show the external-link icon."
        button={{
          label: 'Internal Link',
          href: '/projects',
        }}
        badges={defaultBadges.slice(0, 1)}
      />

      <ProjectCard
        title="Invalid Empty URL"
        description="Invalid or empty href values do not show the external-link icon; Button owns fallback rendering."
        button={{
          label: 'Invalid Link Fallback',
          href: '   ',
        }}
        badges={defaultBadges.slice(0, 1)}
      />
    </div>
  {/snippet}
</Story>

<Story
  name="Root Class Hook"
  parameters={{
    docs: {
      description: {
        story:
          'Marker-only coverage: the class lands on the root div for layout/global selectors and is not a theming API.',
      },
    },
  }}
>
  {#snippet template(args)}
    <ProjectCard {...args} class="project-card-story__root-hook" />
  {/snippet}
</Story>

<style>
  .project-card-story-stack {
    display: grid;
    gap: var(--space-gutter-loose);
  }

  :global(.project-card-story__root-hook) {
    outline: 1px dashed var(--color-outline);
    outline-offset: var(--space-100);
  }
</style>
