// Errors a soft reset() can't recover from, because it re-renders the same
// broken client state — only a full reload does:
// - `parallelRoutes` / missing bootstrap script: a router tree restored stale
//   from the back-forward cache.
// - "Connection closed" and reading `get` off null: the RSC payload stream for
//   a navigation was cut mid-flight (Cloudflare terminating a Worker isolate
//   that went over its CPU limit kills every request in it), leaving the
//   router with a half-applied tree.
// - Chunk load failures: the tab still runs the previous deploy's JS.
const ROUTER_CORRUPTION_PATTERN =
  /parallelRoutes|missing bootstrap script|connection closed|reading 'get'|failed to fetch rsc payload|chunkloaderror|loading chunk [\w-]+ failed/i;

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

const AUTO_RELOAD_KEY = "sl-auto-reloads";
const AUTO_RELOAD_WINDOW_MS = 60_000;
export const MAX_AUTO_RELOADS = 2;

/**
 * Whether another automatic full reload is allowed, given the timestamps of
 * recent ones. Caps reloads so a real, persistent error shows the error page
 * instead of reloading forever. Pure — the caller persists `history`.
 */
export const nextAutoReload = (previous: number[], now: number) => {
  const recent = previous.filter((t) => now - t < AUTO_RELOAD_WINDOW_MS);
  const isAllowed = recent.length < MAX_AUTO_RELOADS;
  return { isAllowed, history: isAllowed ? [...recent, now] : recent };
};

/** Records and permits an automatic reload, remembered across the reload in sessionStorage. */
export const claimAutoReload = (): boolean => {
  try {
    const stored = JSON.parse(sessionStorage.getItem(AUTO_RELOAD_KEY) || "[]");
    const { isAllowed, history } = nextAutoReload(Array.isArray(stored) ? stored : [], Date.now());
    sessionStorage.setItem(AUTO_RELOAD_KEY, JSON.stringify(history));
    return isAllowed;
  } catch {
    // Storage blocked: the history can't survive a reload, so allow none rather than risk a loop
    return false;
  }
};
