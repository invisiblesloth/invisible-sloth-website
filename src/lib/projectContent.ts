import { getCollection, type CollectionEntry } from 'astro:content';

export type HomepageProjectEntry = CollectionEntry<'projects'>;

// Server-only adapter. Do not import this module from Svelte components or Storybook.
// Markdown rendering belongs to Astro page/composition components.

// Preserved future guard; there is no active `this-website` entry today.
const HOMEPAGE_EXCLUDED_PROJECT_IDS = new Set(['this-website']);

const byProjectOrder = (a: HomepageProjectEntry, b: HomepageProjectEntry) =>
  a.data.order - b.data.order;

export const getHomepageProjectEntries = async (): Promise<HomepageProjectEntry[]> => {
  const projects = await getCollection('projects');

  return [...projects]
    .filter((project) => !HOMEPAGE_EXCLUDED_PROJECT_IDS.has(project.id))
    .sort(byProjectOrder);
};
