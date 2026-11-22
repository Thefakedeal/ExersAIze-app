import { useEffect, useState } from 'react';

/**
 * Returns a debounced copy of the provided value.
 *
 * Useful when an expensive derived calculation should only run after rapid
 * state changes have settled, while lightweight UI state (e.g. selection
 * highlights) remains immediate.
 */
export function useDebounce<T>(value: T, delayMs: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delayMs);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delayMs]);

  return debouncedValue;
}
