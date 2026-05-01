import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/**
 * Content Collections configuration for the Invisible Sloth website
 *
 * This file defines the schema for all content collections, starting with the projects collection
 * for the homepage project showcase feature.
 */

// Badge schema - validates platform and status badges
const badgeSchema = z.object({
  label: z.string(),
  variant: z.enum(['default', 'boardgame', 'playdate', 'apple', 'error', 'web'])
});

// Button schema - validates optional button configuration for project cards
const buttonSchema = z.object({
  label: z.string(),
  href: z.string(),
  hasTrailingIcon: z.boolean().optional(),
  target: z.string().optional()
}).optional();

// Projects collection - portfolio projects displayed on homepage
const projects = defineCollection({
  loader: glob({ pattern: '**/[^_]*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    subhead: z.string().optional(),
    description: z.string().optional(),
    order: z.number(),
    badges: z.array(badgeSchema),
    button: buttonSchema,
    showButton: z.boolean().optional()
  })
});

export const collections = { projects };
