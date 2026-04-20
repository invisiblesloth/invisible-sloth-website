declare const trustedLocalHtmlBrand: unique symbol;

export type TrustedLocalHtml = string & {
  readonly [trustedLocalHtmlBrand]: 'TrustedLocalHtml';
};

/**
 * Marks repo-authored Astro content collection HTML as locally trusted.
 *
 * This is a TypeScript affordance only. It is not the browser TrustedHTML
 * type, does not sanitize or validate, and offers no runtime protection. Any
 * JavaScript caller, `any`, or deliberate cast can bypass it.
 *
 * Use only for repository-authored content collection Markdown that has been
 * reviewed as part of the codebase. Sanitize CMS, user-provided, or external
 * HTML before converting it to TrustedLocalHtml.
 */
export const trustLocalAstroContentHtml = (html: string): TrustedLocalHtml =>
  html as TrustedLocalHtml;
