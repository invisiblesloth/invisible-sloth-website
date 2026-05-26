type RequiredStringContext = {
  componentName: string;
  propName: string;
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
