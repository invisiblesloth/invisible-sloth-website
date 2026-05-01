import { getCollection, render, type CollectionEntry } from 'astro:content';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { trustLocalAstroContentHtml } from '../types/trustedLocalHtml';
import type { ProjectDescription, ProjectViewModel } from '../types/project';

type ProjectEntry = CollectionEntry<'projects'>;

// Server-only adapter. Do not import this module from Svelte components or Storybook.

// Preserved future guard; there is no active `this-website` entry today.
const HOMEPAGE_EXCLUDED_PROJECT_IDS = new Set(['this-website']);

const byProjectOrder = (a: ProjectEntry, b: ProjectEntry) => a.data.order - b.data.order;

const toProjectDescription = (
  renderedDescriptionHtml: string,
  fallbackDescription?: string,
): ProjectDescription | undefined => {
  if (renderedDescriptionHtml.trim().length > 0) {
    return {
      kind: 'html',
      // Trust is based on repo-authored content, not Astro rendering as sanitization.
      html: trustLocalAstroContentHtml(renderedDescriptionHtml),
    };
  }

  const plainDescription = fallbackDescription?.trim();
  if (plainDescription) {
    return {
      kind: 'text',
      text: plainDescription,
    };
  }

  return undefined;
};

const toProjectViewModel = async (
  project: ProjectEntry,
  astroContainer: AstroContainer,
): Promise<ProjectViewModel> => {
  const { Content } = await render(project);
  const renderedDescriptionHtml = await astroContainer.renderToString(Content);

  return {
    id: project.id,
    title: project.data.title,
    subhead: project.data.subhead,
    description: toProjectDescription(renderedDescriptionHtml, project.data.description),
    badges: project.data.badges,
    button: project.data.button,
  };
};

export const getHomepageProjectViewModels = async (): Promise<ProjectViewModel[]> => {
  const projects = await getCollection('projects');
  const astroContainer = await AstroContainer.create();

  return Promise.all(
    [...projects]
      .filter((project) => !HOMEPAGE_EXCLUDED_PROJECT_IDS.has(project.id))
      .sort(byProjectOrder)
      .map((project) => toProjectViewModel(project, astroContainer)),
  );
};
