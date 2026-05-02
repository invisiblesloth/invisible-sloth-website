const WARNING_CACHE_KEY = '__invisible_sloth_dev_warning_cache__';

export function warnOnce(key: string, message: string): void {
  if (!import.meta.env.DEV || typeof window === 'undefined') {
    return;
  }

  const scopedWindow = window as typeof window & {
    [WARNING_CACHE_KEY]?: Set<string>;
  };

  if (!(scopedWindow[WARNING_CACHE_KEY] instanceof Set)) {
    scopedWindow[WARNING_CACHE_KEY] = new Set<string>();
  }

  const warnedKeys = scopedWindow[WARNING_CACHE_KEY];

  if (warnedKeys.has(key)) {
    return;
  }

  warnedKeys.add(key);
  console.warn(message);
}
