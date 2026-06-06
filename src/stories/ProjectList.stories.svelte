<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import ProjectListSurface from '../components/ProjectListSurface.svelte';
  import ProjectCard from '../components/ProjectCard.svelte';
  import Divider from '../components/Divider.svelte';
  import type { ProjectBadge, ProjectButton } from '../types/project';

  type StoryProject = {
    id: string;
    title: string;
    subhead?: string;
    description: string;
    badges: ProjectBadge[];
    button?: ProjectButton;
  };

  const { Story } = defineMeta({
    title: 'Organisms/ProjectList',
    component: ProjectListSurface,
    tags: ['autodocs'],
    parameters: {
      controls: {
        exclude: ['children'],
      },
      docs: {
        description: {
          component:
            'Single-column project list surface. The root `class` hook lands on the outer `.project-list` wrapper for layout/global selectors only.',
        },
      },
    },
    argTypes: {
      class: {
        control: false,
        description:
          'Optional outer `.project-list` root class hook for layout hooks, global utilities, and global selectors.',
      },
    },
  });

  // Representative visual snapshot based on current project-card content, not synchronized live data.
  const sampleProjects: StoryProject[] = [
    {
      id: 'tracer',
      title: 'Tracer',
      subhead: 'Simple, On-Device Time Tracking',
      description:
        'Tracer is a minimal time tracker with no sign-up or accounts, and everything runs on your device. Create activities and start tracking. Track one thing or everything, edit entries whenever you need. Tracer helps you build habits and gives you a clear picture of how you spend your time.',
      badges: [
        { variant: 'apple', label: 'Apple Platforms' },
        { variant: 'default', label: 'In Progress' },
      ],
    },
    {
      id: 'roxy-engine',
      title: 'Roxy',
      subhead: 'A Fast and Capable Playdate Game Engine',
      description:
        "Roxy is a fast, open-source Playdate game engine built for developers wanting solid performance and practical features. It's in pre-release, and the API is still changing, so it's not ready for production yet. Roxy includes C-level optimizations, asset pooling and caching, scene stacking and transitions, a flexible camera with parallax, sprite and actor systems with state machines, particle emitters, and support for orthogonal, isometric, and staggered isometric tilemaps. We're using Roxy in our own Playdate project. Roxy is free under the MIT License.",
      badges: [
        { variant: 'playdate', label: 'Playdate' },
        { variant: 'default', label: 'In Pre-Release' },
      ],
      button: {
        label: 'Check Roxy out on GitHub',
        href: 'https://github.com/invisiblesloth/roxy-engine',
        target: '_blank',
      },
    },
    {
      id: 'upcoming-playdate-title',
      title: 'Super Secret Playdate Game',
      description:
        'We built Roxy for ourselves first. Our goal has always been to make a Playdate game, and that project is underway. More to share later.',
      badges: [
        { variant: 'playdate', label: 'Playdate' },
        { variant: 'default', label: 'In Progress' },
      ],
    },
    {
      id: 'drawing-zoo',
      title: 'Drawing Zoo',
      subhead: 'A Collaborative Drawing Game',
      description:
        "Drawing Zoo is a relaxed, collaborative drawing game. It isn't about skill or winning - just doodling together and having fun. The game is currently in play testing as we refine the rules and board design. It supports one to six players and works for a wide range of ages. Our plan is to produce an inexpensive, portable dry-erase board that's easy to bring to parties or take traveling. Once the design is final, we'll launch a crowdfunding campaign.",
      badges: [
        { variant: 'boardgame', label: 'Boardgame' },
        { variant: 'default', label: 'In Playtesting' },
      ],
    },
  ];

  const rootHookProject = sampleProjects[0];
</script>

<style>
  :global(.project-list-story__root-hook) {
    outline: 1px dashed var(--color-outline);
    outline-offset: var(--space-100);
  }
</style>

<Story name="Stacked List">
  {#snippet template()}
    <ProjectListSurface>
      {#each sampleProjects as project, index (project.id)}
        <ProjectCard
          title={project.title}
          subhead={project.subhead}
          button={project.button}
          badges={project.badges}
        >
          {#if project.id === 'roxy-engine'}
            <p>
              Roxy is a fast, open-source Playdate game engine built for developers wanting solid
              performance and practical features.
              <strong>
                It's in pre-release, and the API is still changing, so it's not ready for production
                yet.
              </strong>
              Roxy includes C-level optimizations, asset pooling and caching, scene stacking and
              transitions, a flexible camera with parallax, sprite and actor systems with state
              machines, particle emitters, and support for orthogonal, isometric, and staggered
              isometric tilemaps. We're using Roxy in our own Playdate project. Roxy is free under
              the MIT License.
            </p>
          {:else}
            <p>{project.description}</p>
          {/if}
        </ProjectCard>
        {#if index < sampleProjects.length - 1}
          <Divider thickness="Double" ariaHidden />
        {/if}
      {/each}
    </ProjectListSurface>
  {/snippet}
</Story>

<Story
  name="Root Class Hook"
  parameters={{
    docs: {
      description: {
        story:
          'Marker-only coverage: the class lands on the outer `.project-list` root for layout/global selectors and is not a theming API.',
      },
    },
  }}
>
  {#snippet template()}
    <ProjectListSurface class="project-list-story__root-hook">
      <ProjectCard
        title={rootHookProject.title}
        subhead={rootHookProject.subhead}
        badges={rootHookProject.badges}
      >
        <p>{rootHookProject.description}</p>
      </ProjectCard>
    </ProjectListSurface>
  {/snippet}
</Story>
