// Next.js's client router keeps a `parallelRoutes` Map per route-tree node in
// memory. After a tab is frozen in the browser's back-forward cache (bfcache)
// for a while and then restored, that tree can come back stale/torn — any
// navigation then throws reading `.parallelRoutes` off a null node. A soft
// reset() re-renders the same broken router, so only a full reload recovers.
const ROUTER_CORRUPTION_PATTERN = /parallelRoutes|missing bootstrap script/i;

export const isRouterCorruptionError = (message: string | undefined | null): boolean => {
  return ROUTER_CORRUPTION_PATTERN.test(message || "");
};

interface RetryBufferEntry {
  count: number;
  firstAttemptAt: number;
  lastAttemptAt: number;
}

const retryBufferMap = new Map<string, RetryBufferEntry>();

export const MAX_RETRY_ATTEMPTS = 3;
export const RETRY_WINDOW_MS = 14000; // 14s buffer window for cold boots

export const getRetryBufferState = (key: string = "default"): {
  shouldRetry: boolean;
  attempt: number;
  delayMs: number;
} => {
  if (typeof window === "undefined") {
    return { shouldRetry: false, attempt: 0, delayMs: 0 };
  }

  const now = Date.now();
  let entry = retryBufferMap.get(key);

  // If new or last attempt was over 20s ago (fresh session/page visit)
  if (!entry || now - entry.lastAttemptAt > 20000) {
    entry = { count: 1, firstAttemptAt: now, lastAttemptAt: now };
    retryBufferMap.set(key, entry);
    return { shouldRetry: true, attempt: 1, delayMs: 1200 };
  }

  if (entry.count < MAX_RETRY_ATTEMPTS && now - entry.firstAttemptAt < RETRY_WINDOW_MS) {
    entry.count += 1;
    entry.lastAttemptAt = now;
    const delayMs = entry.count === 2 ? 2000 : 3000;
    return { shouldRetry: true, attempt: entry.count, delayMs };
  }

  return { shouldRetry: false, attempt: entry.count, delayMs: 0 };
};

export const resetRetryBuffer = (key?: string): void => {
  if (key) {
    retryBufferMap.delete(key);
  } else {
    retryBufferMap.clear();
  }
};
