import { useCallback, useState } from 'react';

/** useState that survives reloads. Falls back to plain state if storage is unavailable. */
export function useLocalStorageState<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw === null ? initialValue : (JSON.parse(raw) as T);
    } catch {
      return initialValue;
    }
  });

  const update = useCallback(
    (next: T) => {
      setValue(next);
      try {
        localStorage.setItem(key, JSON.stringify(next));
      } catch {
        // Private mode / blocked storage: keep the in-memory value only
      }
    },
    [key],
  );

  return [value, update] as const;
}
