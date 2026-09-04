import { createJSONStorage } from "zustand/middleware";

/**
 * SSR-safe storage adapter for Zustand persist middleware.
 * Prevents Node 22+ ExperimentalWarning: localStorage is not available.
 */
export const safeLocalStorage = createJSONStorage(() => {
  if (typeof window !== "undefined") {
    return window.localStorage;
  }
  return {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
    clear: () => {},
    key: () => null,
    length: 0,
  } as unknown as Storage;
});
