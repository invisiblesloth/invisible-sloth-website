<script lang="ts">
  import { warnOnce } from '../lib/devWarnings';

  /**
   * Email contact CTA surface.
   * Parent composition owns placement and width constraints.
   *
   * Migration note: every `<ContactUs />` usage must become
   * `<ContactUs text="..." email="..." />`.
   */
  type Props = {
    text: string;
    email: string;
  };

  let { text, email }: Props = $props();

  function normalizeRequiredString(value: unknown): string {
    return typeof value === 'string' ? value.trim() : '';
  }

  const normalizedText = $derived(normalizeRequiredString(text));
  const normalizedEmail = $derived(normalizeRequiredString(email));
  const emailHref = $derived(normalizedEmail ? `mailto:${normalizedEmail}` : undefined);

  $effect(() => {
    if (!normalizedText) {
      warnOnce(
        'contact-us:blank-text',
        '[ContactUs] `text` must resolve to a non-empty string after trimming.'
      );
    }

    if (!normalizedEmail) {
      warnOnce(
        'contact-us:blank-email',
        '[ContactUs] `email` must resolve to a non-empty string after trimming. Skipping the email link.'
      );
    }
  });
</script>

<div class="contact-us">
  <p class="contact-us__text text-body-large">
    {#if normalizedText}{normalizedText}{/if}
    {#if normalizedEmail}
      <a href={emailHref} class="contact-us__link text-link">
        <span>{normalizedEmail}</span>
      </a>
    {/if}
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
