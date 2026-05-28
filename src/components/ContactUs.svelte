<script module lang="ts">
  export type ContactUsProps = {
    text: string;
    email: string;
    class?: string;
  };
</script>

<script lang="ts">
  import { requireNonEmptyString } from '../lib/componentValidation';

  /**
   * Email contact CTA surface.
   * Parent composition owns placement and width constraints.
   * Blank text or email values fail fast during SSR/build/render.
   * Root-hook component: `class` is appended to the root <div> for
   * layout hooks, global utilities, and global selectors.
   *
   * Migration note: every `<ContactUs />` usage must become
   * `<ContactUs text="..." email="..." />`.
   */
  let {
    text,
    email,
    class: className = '',
  }: ContactUsProps = $props();

  const normalizedText = $derived(
    requireNonEmptyString(text, { componentName: 'ContactUs', propName: 'text' })
  );
  const normalizedEmail = $derived(
    requireNonEmptyString(email, { componentName: 'ContactUs', propName: 'email' })
  );
  const emailHref = $derived(`mailto:${normalizedEmail}`);
  const normalizedClassName = $derived(String(className ?? '').trim());
  const contactUsClasses = $derived(
    ['contact-us', normalizedClassName].filter(Boolean).join(' ')
  );
</script>

<div class={contactUsClasses}>
  <p class="contact-us__text text-body-large">
    {normalizedText}
    <a href={emailHref} class="contact-us__link text-link">
      <span>{normalizedEmail}</span>
    </a>
  </p>
</div>

<style>
  .contact-us {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    background-color: var(--color-tertiary-container);
    border-radius: var(--radius-xl);
    padding: var(--space-section-block) var(--space-rail-inline);

    /* Override link underline color for this surface */
    --text-link-underline: var(--color-link-underline-on-tertiary-container);
  }

  .contact-us__text {
    /* Component-specific overrides only */
    color: var(--color-on-tertiary-container);
    text-align: center;
    margin: 0;
  }

  .contact-us__link {
    /* Component-specific overrides only */
    color: inherit;
  }

  @media (min-width: 1176px) {
    .contact-us {
      padding: var(--space-section-block) var(--space-rail-inline-lg);
    }
  }
</style>
