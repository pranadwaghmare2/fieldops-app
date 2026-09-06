import { useEffect, useState } from 'react';

/**
 * Returns `value` delayed by `delayMs`.
 * Used by the search bar so the ViewModel only sees settled query text.
 */
export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(id);
  }, [value, delayMs]);

  return debounced;
}
