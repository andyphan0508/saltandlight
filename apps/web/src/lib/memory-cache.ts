interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

// In-memory cache map shared across requests on the same worker isolate or Node process
const memoryStore = new Map<string, CacheEntry<any>>();

/**
 * Wraps an async fetcher with an in-memory cache and Stale-While-Revalidate fallback.
 * If the entry is fresh, returns it in 0ms without hitting the DB.
 * If the fetcher fails (e.g. transient DB timeout during rapid clicks),
 * returns the last known good value to preserve 100% uptime.
 */
export async function withMemoryCache<T>(
  key: string,
  ttlSeconds: number,
  fetcher: () => Promise<T>
): Promise<T> {
  const now = Date.now();
  const entry = memoryStore.get(key);

  if (entry && entry.expiresAt > now) {
    return entry.value;
  }

  try {
    const value = await fetcher();
    memoryStore.set(key, {
      value,
      expiresAt: now + ttlSeconds * 1000,
    });
    return value;
  } catch (err) {
    if (entry && entry.value !== undefined) {
      console.warn(`[memory-cache] Fetch failed for "${key}", serving stale cache fallback:`, err);
      return entry.value;
    }
    throw err;
  }
}

/**
 * Invalidate in-memory cache entries by prefix or clear all.
 */
export function invalidateMemoryCache(prefix?: string): void {
  if (!prefix) {
    memoryStore.clear();
    return;
  }
  for (const key of memoryStore.keys()) {
    if (key.startsWith(prefix)) {
      memoryStore.delete(key);
    }
  }
}
