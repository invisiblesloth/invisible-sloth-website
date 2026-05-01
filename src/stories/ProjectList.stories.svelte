<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import ProjectList from '../components/ProjectList.svelte';
  import { trustLocalAstroContentHtml } from '../types/trustedLocalHtml';
  import type { ProjectViewModel } from '../types/project';

  const { Story } = defineMeta({
    title: 'Organisms/ProjectList',
    component: ProjectList,
    tags: ['autodocs'],
    parameters: {
      controls: {
        exclude: ['projects', 'class'],
      },
    },
  });

  // Real project data from src/content/projects/
  const sampleProjects: ProjectViewModel[] = [
    {
      id: 'tracer',
      title: 'Tracer',
      subhead: 'Simple, On-Device Time Tracking',
      description: {
        kind: 'html',
        html: trustLocalAstroContentHtml(
          '<p>Tracer is a minimal time tracker with no sign-up or accounts, and everything runs on your device. Create activities and start tracking. Track one thing or everything, edit entries whenever you need. Tracer helps you build habits and gives you a clear picture of how you spend your time.</p>',
        ),
      },
      badges: [
        { variant: 'apple', label: 'Apple Platforms' },
        { variant: 'default', label: 'In Progress' },
      ],
    },
    {
      id: 'roxy-engine',
      title: 'Roxy',
      subhead: 'A Fast and Capable Playdate Game Engine',
      description: {
        kind: 'html',
        html: trustLocalAstroContentHtml(
          '<p>Roxy is a fast, open-source Playdate game engine built for developers wanting solid performance and practical features. It\'s in pre-release, and the API is still changing, so it\'s not ready for production yet. Roxy includes C-level optimizations, asset pooling and caching, scene stacking and transitions, a flexible camera with parallax, sprite and actor systems with state machines, particle emitters, and support for orthogonal, isometric, and staggered isometric tilemaps. We\'re using Roxy in our own Playdate project. Roxy is free under the MIT License.</p>',
        ),
      },
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
      description: {
        kind: 'html',
        html: trustLocalAstroContentHtml(
          '<p>We built Roxy for ourselves first. Our goal has always been to make a Playdate game, and that project is underway. More to share later.</p>',
        ),
      },
      badges: [
        { variant: 'playdate', label: 'Playdate' },
        { variant: 'default', label: 'In Progress' },
      ],
    },
    {
      id: 'drawing-zoo',
      title: 'Drawing Zoo',
      subhead: 'A Collaborative Drawing Game',
      description: {
        kind: 'html',
        html: trustLocalAstroContentHtml(
          '<p>Drawing Zoo is a relaxed, collaborative drawing game. It isn\'t about skill or winning – just doodling together and having fun. The game is currently in play testing as we refine the rules and board design. It supports one to six players and works for a wide range of ages. Our plan is to produce an inexpensive, portable dry-erase board that\'s easy to bring to parties or take traveling. Once the design is final, we\'ll launch a crowdfunding campaign.</p>',
        ),
      },
      badges: [
        { variant: 'boardgame', label: 'Boardgame' },
        { variant: 'default', label: 'In Playtesting' },
      ],
    },
  ];
</script>

<Story name="Stacked List" args={{ projects: sampleProjects }} />
