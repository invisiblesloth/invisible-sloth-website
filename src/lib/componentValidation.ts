import { warnOnce } from './devWarnings';

type RequiredStringContext = {
  componentName: string;
  propName: string;
};

type OptionPropContext<TAllowedValues extends readonly (string | number)[]> = {
  value: unknown;
  allowedValues: TAllowedValues;
  fallbackValue: TAllowedValues[number];
  componentName: string;
  propName: string;
  warningKey: string;
  fallbackLabel?: string;
};

const COMPONENT_NAME_PATTERN = /^[A-Z][A-Za-z0-9]*$/;
const PROP_NAME_PATTERN = /^[a-z][A-Za-z0-9]*(\.[a-z][A-Za-z0-9]*)*$/;

function requireValidLabel(value: string, labelName: 'componentName' | 'propName'): string {
  const labelPattern =
    labelName === 'componentName' ? COMPONENT_NAME_PATTERN : PROP_NAME_PATTERN;

  if (value !== value.trim() || !labelPattern.test(value)) {
    throw new Error(
      `[componentValidation] \`${labelName}\` must be passed without brackets, backticks, or whitespace; use PascalCase component names and camelCase or dotted camelCase prop names.`
    );
  }

  return value;
}

function requireValidWarningKey(value: string): string {
  if (value !== value.trim() || value.length === 0) {
    throw new Error(
      '[componentValidation] `warningKey` must resolve to a non-empty string without surrounding whitespace.'
    );
  }

  return value;
}

function requireValidAllowedValues<TAllowedValues extends readonly (string | number)[]>(
  allowedValues: TAllowedValues
): TAllowedValues {
  if (allowedValues.length === 0) {
    throw new Error('[componentValidation] `allowedValues` must include at least one option.');
  }

  return allowedValues;
}

function requireValidFallbackValue<TAllowedValues extends readonly (string | number)[]>(
  allowedValues: TAllowedValues,
  fallbackValue: TAllowedValues[number]
): TAllowedValues[number] {
  if (!allowedValues.includes(fallbackValue)) {
    throw new Error(
      '[componentValidation] `fallbackValue` must be included in `allowedValues`.'
    );
  }

  return fallbackValue;
}

function formatFallbackMessage(fallbackValue: string | number, fallbackLabel?: string): string {
  const normalizedFallbackLabel = fallbackLabel?.trim();

  return normalizedFallbackLabel
    ? `Falling back to ${normalizedFallbackLabel}.`
    : `Falling back to "${String(fallbackValue)}".`;
}

export function requireNonEmptyString(
  value: unknown,
  { componentName, propName }: RequiredStringContext
): string {
  const normalizedComponentName = requireValidLabel(componentName, 'componentName');
  const normalizedPropName = requireValidLabel(propName, 'propName');
  const normalizedValue = typeof value === 'string' ? value.trim() : '';

  if (normalizedValue.length === 0) {
    throw new Error(
      `[${normalizedComponentName}] \`${normalizedPropName}\` must resolve to a non-empty string after trimming.`
    );
  }

  return normalizedValue;
}

export function normalizeOptionProp<const TAllowedValues extends readonly (string | number)[]>({
  value,
  allowedValues,
  fallbackValue,
  componentName,
  propName,
  warningKey,
  fallbackLabel,
}: OptionPropContext<TAllowedValues>): TAllowedValues[number] {
  const normalizedComponentName = requireValidLabel(componentName, 'componentName');
  const normalizedPropName = requireValidLabel(propName, 'propName');
  const normalizedWarningKey = requireValidWarningKey(warningKey);
  const normalizedAllowedValues = requireValidAllowedValues(allowedValues);
  const normalizedFallbackValue = requireValidFallbackValue(
    normalizedAllowedValues,
    fallbackValue
  );

  if (normalizedAllowedValues.includes(value as TAllowedValues[number])) {
    return value as TAllowedValues[number];
  }

  const allowedValueList = normalizedAllowedValues
    .map((allowedValue) => String(allowedValue))
    .join(', ');
  const fallbackMessage = formatFallbackMessage(normalizedFallbackValue, fallbackLabel);

  warnOnce(
    normalizedWarningKey,
    `[${normalizedComponentName}] \`${normalizedPropName}\` must be one of ${allowedValueList}. ${fallbackMessage}`
  );

  return normalizedFallbackValue;
}
