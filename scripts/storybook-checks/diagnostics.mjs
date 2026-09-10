export function diagnostic(code, message, file = '<repository>', node = undefined) {
  const start = node?.loc?.start ?? node?.start;
  return {
    code,
    file,
    line: typeof start?.line === 'number' ? start.line : 1,
    column: typeof start?.column === 'number' ? start.column + 1 : 1,
    message,
  };
}

export function sortDiagnostics(items) {
  return [...items].sort(
    (a, b) =>
      a.file.localeCompare(b.file) ||
      a.line - b.line ||
      a.column - b.column ||
      a.code.localeCompare(b.code)
  );
}

export function formatDiagnostic(item) {
  return `ERROR ${item.code} ${item.file}:${item.line}:${item.column} ${item.message}`;
}

export function printDiagnostics(items, label = 'Storybook source checks') {
  const sorted = sortDiagnostics(items);
  for (const item of sorted) console.error(formatDiagnostic(item));
  console.log(`${label}: ${sorted.length === 0 ? 'passed' : `failed with ${sorted.length} error(s)`}.`);
}
