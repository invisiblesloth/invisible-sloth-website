<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import ProjectList from '../components/ProjectList.svelte';
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
    component: ProjectList,
    tags: ['autodocs'],
    parameters: {
      controls: {
        exclude: ['children', 'class'],
      },
    },
  });

  // Real project data from src/content/projects/, composed as story markup.
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
        hasTrailingIcon: true,
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
</script>

<Story name="Stacked List">
  {#snippet template()}
    <ProjectList>
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
    </ProjectList>
  {/snippet}
</Story>
