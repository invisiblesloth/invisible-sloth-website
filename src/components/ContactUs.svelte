<script lang="ts">
  import { requireNonEmptyString } from '../lib/componentValidation';

  /**
   * Email contact CTA surface.
   * Parent composition owns placement and width constraints.
   * Blank text or email values fail fast during SSR/build/render.
   *
   * Migration note: every `<ContactUs />` usage must become
   * `<ContactUs text="..." email="..." />`.
   */
  type Props = {
    text: string;
    email: string;
  };

  let { text, email }: Props = $props();

  const normalizedText = $derived(
    requireNonEmptyString(text, { componentName: 'ContactUs', propName: 'text' })
  );
  const normalizedEmail = $derived(
    requireNonEmptyString(email, { componentName: 'ContactUs', propName: 'email' })
  );
  const emailHref = $derived(`mailto:${normalizedEmail}`);
</script>

<div class="contact-us">
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
