import { warnOnce } from './devWarnings';

export const BUTTON_VARIANTS = ['filled-primary', 'filled-secondary', 'filled-tertiary'] as const;
export type ButtonVariant = (typeof BUTTON_VARIANTS)[number];

export const DEFAULT_BUTTON_VARIANT: ButtonVariant = 'filled-primary';

export const BUTTON_TYPES = ['button', 'submit', 'reset'] as const;
export type ButtonType = (typeof BUTTON_TYPES)[number];

export const DEFAULT_BUTTON_TYPE: ButtonType = 'button';

const BUTTON_VARIANT_SET = new Set<string>(BUTTON_VARIANTS);
const BUTTON_TYPE_SET = new Set<string>(BUTTON_TYPES);

export function isButtonVariant(value: unknown): value is ButtonVariant {
  return typeof value === 'string' && BUTTON_VARIANT_SET.has(value);
}

export function normalizeButtonVariant(value: unknown): ButtonVariant {
  if (isButtonVariant(value)) {
    return value;
  }

  warnOnce(
    'button:invalid-variant',
    `[Button] Invalid variant "${String(value)}". Falling back to "${DEFAULT_BUTTON_VARIANT}".`
  );

  return DEFAULT_BUTTON_VARIANT;
}

export function isButtonType(value: unknown): value is ButtonType {
  return typeof value === 'string' && BUTTON_TYPE_SET.has(value);
}

export function normalizeButtonType(value: unknown): ButtonType {
  if (isButtonType(value)) {
    return value;
  }

  warnOnce(
    'button:invalid-type',
    `[Button] Invalid type "${String(value)}". Falling back to "${DEFAULT_BUTTON_TYPE}".`
  );

  return DEFAULT_BUTTON_TYPE;
}
