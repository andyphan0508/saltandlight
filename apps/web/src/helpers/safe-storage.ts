import { createJSONStorage } from "zustand/middleware";

/**
 * SSR and browser-privacy safe storage adapter for Zustand persist middleware.
 * Prevents Node 22+ ExperimentalWarning: localStorage is not available,
 * and guards against Firefox DOMException: "The operation is insecure."
 * when storage or cookies are blocked.
 */
export const safeLocalStorage = createJSONStorage(() => {
  if (typeof window !== "undefined") {
    try {
      const testKey = "__sl_test__";
      window.localStorage.setItem(testKey, "1");
      window.localStorage.removeItem(testKey);
      return window.localStorage;
    } catch {
      // Firefox SecurityError or privacy mode: fallback to memory storage
    }
  }

  const memory = new Map<string, string>();
  return {
    getItem: (key: string) => memory.get(key) ?? null,
    setItem: (key: string, value: string) => {
      memory.set(key, value);
    },
    removeItem: (key: string) => {
      memory.delete(key);
    },
    clear: () => {
      memory.clear();
    },
    key: (index: number) => Array.from(memory.keys())[index] ?? null,
    get length() {
      return memory.size;
    },
  } as unknown as Storage;
});
