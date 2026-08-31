<script module lang="ts">
  import type { NavigationSection } from '../lib/navigation';

  export type FooterLinksProps = {
    sections?: NavigationSection[];
    ariaLabel?: string;
    class?: string;
  };
</script>

<script lang="ts">
  /**
   * Footer Links
   *
   * Data-owned footer navigation with grouped link lists. Omitted and empty
   * data render no DOM. Present malformed data is skipped with deduplicated
   * development warnings. The root class is a layout hook only.
   *
   * @prop {NavigationSection[]} sections - Optional grouped footer navigation data
   * @prop {string} ariaLabel - Accessible navigation label; defaults to "Footer navigation"
   * @prop {string} class - Additional classes appended to the root nav when it renders
   */
  import { warnOnce } from '../lib/devWarnings';
  import {
    resolveNavigationSectionsWithDiagnostics,
    type NavigationSectionDiagnostic,
  } from '../lib/navigation';

  const DEFAULT_ARIA_LABEL = 'Footer navigation';

  function resolveAriaLabel(value: unknown): { label: string; invalid: boolean } {
    if (value === undefined) {
      return { label: DEFAULT_ARIA_LABEL, invalid: false };
    }

    if (typeof value === 'string' && value.trim()) {
      return { label: value.trim(), invalid: false };
    }

    return { label: DEFAULT_ARIA_LABEL, invalid: true };
  }

  function diagnosticMessage(diagnostic: NavigationSectionDiagnostic): string {
    const propPath = `\`${diagnostic.path}\``;

    switch (diagnostic.reason) {
      case 'sections-not-array':
        return `[FooterLinks] ${propPath} must be an array when provided. Rendering without links.`;
      case 'section-not-object':
        return `[FooterLinks] ${propPath} must be an object. Skipping invalid section.`;
      case 'items-not-array':
        return `[FooterLinks] ${propPath} must be an array. Skipping invalid section.`;
      case 'heading-invalid':
        return `[FooterLinks] ${propPath} must resolve to a non-empty string when provided. Rendering the group without a heading.`;
      case 'item-not-object':
        return `[FooterLinks] ${propPath} must be an object. Skipping invalid link.`;
      case 'label-invalid':
        return `[FooterLinks] ${propPath} must resolve to a non-empty string. Skipping invalid link.`;
      case 'href-invalid':
        return `[FooterLinks] ${propPath} must resolve to a non-empty string. Skipping invalid link.`;
      case 'target-invalid':
      case 'rel-invalid':
        return `[FooterLinks] ${propPath} must resolve to a non-empty string when provided. Ignoring invalid value.`;
    }
  }

  let {
    sections = undefined,
    ariaLabel = undefined,
    class: className = '',
  }: FooterLinksProps = $props();

  const sectionResolution = $derived(resolveNavigationSectionsWithDiagnostics(sections));
  const resolvedSections = $derived(sectionResolution.sections);
  const hasSections = $derived(resolvedSections.length > 0);
  const ariaLabelResolution = $derived(resolveAriaLabel(ariaLabel));
  const normalizedClassName = $derived(
    typeof className === 'string' ? className.trim() : ''
  );
  const footerLinkClasses = $derived(
    ['footer-links', normalizedClassName].filter(Boolean).join(' ')
  );

  $effect(() => {
    if (ariaLabelResolution.invalid) {
      warnOnce(
        'footer-links:invalid-aria-label',
        `[FooterLinks] \`ariaLabel\` must resolve to a non-empty string when provided. Falling back to "${DEFAULT_ARIA_LABEL}".`
      );
    }

    for (const diagnostic of sectionResolution.diagnostics) {
      warnOnce(
        `footer-links:${diagnostic.path}:${diagnostic.reason}`,
        diagnosticMessage(diagnostic)
      );
    }
  });
</script>

{#if hasSections}
  <nav class={footerLinkClasses} aria-label={ariaLabelResolution.label}>
    <div class="footer-links__columns">
      {#each resolvedSections as section, sectionIndex (`${section.heading ?? 'group'}:${sectionIndex}`)}
        <div class="footer-links__group">
          {#if section.heading}
            <h2 class="footer-links__heading text-title-medium-prominent">
              {section.heading}
            </h2>
          {/if}

          <ul class="footer-links__list">
            {#each section.items as item, itemIndex (`${item.href}:${itemIndex}`)}
              <li class="footer-links__item">
                <a
                  class="footer-links__link text-body-medium text-link"
                  href={item.href}
                  target={item.target}
                  rel={item.rel}
                >
                  {item.label}
                </a>
              </li>
            {/each}
          </ul>
        </div>
      {/each}
    </div>
  </nav>
{/if}

<style>
  .footer-links {
    display: flex;
    justify-content: center;
    box-sizing: border-box;
    inline-size: 100%;
    padding-inline: var(--space-rail-inline-xl);

    /* Match the footer contact link's contextual underline treatment. */
    --text-link-underline: var(--color-link-underline-on-tertiary-container);
  }

  .footer-links__columns {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: var(--space-600);
    box-sizing: border-box;
    inline-size: 100%;
    max-inline-size: 33rem;
    min-inline-size: 0;
  }

  .footer-links__group {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-400);
    box-sizing: border-box;
    inline-size: 100%;
    min-inline-size: 0;
  }

  .footer-links__heading {
    inline-size: 100%;
    min-inline-size: 0;
    margin: 0;
    color: var(--color-on-background);
    overflow-wrap: anywhere;
  }

  .footer-links__list {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-200);
    box-sizing: border-box;
    inline-size: 100%;
    min-inline-size: 0;
    padding: 0;
    margin: 0;
    list-style: none;
  }

  .footer-links__item {
    box-sizing: border-box;
    inline-size: 100%;
    min-inline-size: 0;
  }

  .footer-links__link {
    box-sizing: border-box;
    min-inline-size: 0;
    max-inline-size: 100%;
    color: var(--color-tertiary);
    white-space: normal;
    overflow-wrap: anywhere;
  }
</style>
