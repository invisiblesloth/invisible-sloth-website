<script lang="ts">
  let {
    text = "For questions, support, or just to say hi, email us at",
    email = "hello@invisiblesloth.com"
  } = $props();
</script>

<div class="contact-us">
  <div class="contact-us__surface">
    <p class="contact-us__text text-body-large">
      {text}
      <a href="mailto:{email}" class="contact-us__link text-link">
        <span>{email}</span>
      </a>
    </p>
  </div>
</div>

<style>
  .contact-us {
    /* Outer container: structural layout */
    display: flex;
    justify-content: center;
  }

  .contact-us__surface {
    /* Surface: visual styling + responsive padding */
    display: flex;
    flex-direction: column;
    align-items: center;
    align-self: stretch;
    width: 100%;
    max-width: var(--size-rail-md);
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
    .contact-us__surface {
      padding: var(--space-section-block) var(--space-rail-inline-lg)
    }
  }
</style>
