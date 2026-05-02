export const LOGO_VARIANTS = ['standard', 'technical'] as const;

export const LOGO_NAMED_SIZES = {
  sm: '48px',
  md: '96px',
  lg: '160px',
  xl: '192px',
} as const;

export type LogoNamedSize = keyof typeof LOGO_NAMED_SIZES;
export type LogoSize = LogoNamedSize | (string & {});
export type LogoVariant = (typeof LOGO_VARIANTS)[number];

export const DEFAULT_LOGO_VARIANT: LogoVariant = 'standard';
export const DEFAULT_LOGO_SIZE: LogoNamedSize = 'md';
export const DEFAULT_LOGO_ALT = 'Invisible Sloth logo featuring Sloth-Luc, the ghost sloth';

export function isBlankString(value: string | undefined): boolean {
  return value === undefined || value.trim().length === 0;
}

export function isLogoVariant(value: string | undefined): value is LogoVariant {
  return LOGO_VARIANTS.includes(value as LogoVariant);
}

export function normalizeLogoVariant(value: string | undefined): LogoVariant {
  return isLogoVariant(value) ? value : DEFAULT_LOGO_VARIANT;
}

export function normalizeLogoAlt(value: string | undefined): string {
  const trimmedValue = value?.trim();

  return trimmedValue ? trimmedValue : DEFAULT_LOGO_ALT;
}

export function resolveLogoSize(size: LogoSize = DEFAULT_LOGO_SIZE): string {
  const normalizedSize = size.trim();

  if (!normalizedSize) {
    return LOGO_NAMED_SIZES[DEFAULT_LOGO_SIZE];
  }

  return LOGO_NAMED_SIZES[normalizedSize as LogoNamedSize] ?? normalizedSize;
}
