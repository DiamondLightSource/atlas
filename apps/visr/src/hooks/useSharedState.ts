import { useCallback, useMemo, useSyncExternalStore } from "react";

// The `storage` event only fires in *other* tabs, so same-tab
// subscribers are notified through this map instead.
const listeners = new Map<string, Set<() => void>>();

/**
 * Like useState, but persisted to localStorage and kept in sync
 * across every open tab on the same origin.
 */
export function useSharedState<T>(key: string, initial: T) {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const onStorage = (e: StorageEvent) => {
        if (e.key === key) onChange();
      };
      window.addEventListener("storage", onStorage);

      const set = listeners.get(key) ?? new Set();
      listeners.set(key, set);
      set.add(onChange);

      return () => {
        window.removeEventListener("storage", onStorage);
        set.delete(onChange);
      };
    },
    [key],
  );

  const getSnapshot = () => {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  };

  const raw = useSyncExternalStore(subscribe, getSnapshot, () => null);

  const value = useMemo<T>(() => {
    if (raw === null) return initial;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return initial;
    }
    // `initial` is only a fallback; re-parse when the stored value changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [raw]);

  const setValue = useCallback(
    (next: T | ((prev: T) => T)) => {
      let prev = initial;
      try {
        const current = localStorage.getItem(key);
        if (current !== null) prev = JSON.parse(current) as T;
      } catch {
        /* fall back to initial */
      }
      const resolved =
        typeof next === "function" ? (next as (p: T) => T)(prev) : next;
      try {
        localStorage.setItem(key, JSON.stringify(resolved));
      } catch {
        /* storage full or blocked; ignore */
      }
      listeners.get(key)?.forEach(l => l());
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [key],
  );

  return [value, setValue] as const;
}
