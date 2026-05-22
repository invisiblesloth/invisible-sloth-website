import { warnOnce } from './devWarnings';

export const BUTTON_VARIANTS = [
  'filled-primary',
  'filled-inverse-primary',
  'filled-secondary',
  'filled-inverse-secondary',
  'filled-tertiary',
  'filled-inverse-tertiary',
  'outline',
  'text',
  'filled-error',
  'filled-inverse-error',
  'outline-error',
  'text-error',
] as const;
export type ButtonVariant = (typeof BUTTON_VARIANTS)[number];

export const DEFAULT_BUTTON_VARIANT: ButtonVariant = 'filled-primary';

export const BUTTON_SHAPES = ['label', 'icon'] as const;
export type ButtonShape = (typeof BUTTON_SHAPES)[number];

export const DEFAULT_BUTTON_SHAPE: ButtonShape = 'label';

export const BUTTON_TYPES = ['button', 'submit', 'reset'] as const;
export type ButtonType = (typeof BUTTON_TYPES)[number];

export const DEFAULT_BUTTON_TYPE: ButtonType = 'button';

const BUTTON_VARIANT_SET = new Set<string>(BUTTON_VARIANTS);
const BUTTON_SHAPE_SET = new Set<string>(BUTTON_SHAPES);
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

export function isButtonShape(value: unknown): value is ButtonShape {
  return typeof value === 'string' && BUTTON_SHAPE_SET.has(value);
}

export function normalizeButtonShape(value: unknown): ButtonShape {
  if (isButtonShape(value)) {
    return value;
  }

  warnOnce(
    'button:invalid-shape',
    `[Button] Invalid shape "${String(value)}". Falling back to "${DEFAULT_BUTTON_SHAPE}".`
  );

  return DEFAULT_BUTTON_SHAPE;
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
