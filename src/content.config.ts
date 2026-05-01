import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { PROJECT_BADGE_VARIANTS } from './types/project';

/**
 * Content Collections configuration for the Invisible Sloth website
 *
 * This file defines the schema for all content collections, starting with the projects collection
 * for the homepage project showcase feature.
 */

// Badge schema - validates platform and status badges
const badgeSchema = z.object({
  label: z.string().trim().min(1),
  variant: z.enum(PROJECT_BADGE_VARIANTS)
});

// Button schema - validates optional button configuration for project cards
const buttonSchema = z.object({
  label: z.string().trim().min(1),
  href: z.string().trim().min(1),
  hasTrailingIcon: z.boolean().optional(),
  target: z.string().trim().min(1).optional(),
  rel: z.string().trim().min(1).optional()
}).optional();

// Projects collection - portfolio projects displayed on homepage
const projects = defineCollection({
  loader: glob({ pattern: '**/[^_]*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string().trim().min(1),
    subhead: z.string().trim().min(1).optional(),
    description: z.string().trim().min(1).optional(),
    order: z.number(),
    badges: z.array(badgeSchema),
    button: buttonSchema
  })
});

export const collections = { projects };
