const CONNECTION_ERROR_PATTERN =
  /connection closed|closed the connection|connection terminated|can't reach database|terminating connection|broken pipe|econnreset|etimedout|57P01|P1001|P1002|P1017/i;

// Next.js's client router keeps a `parallelRoutes` Map per route-tree node in
// memory. After a tab is frozen in the browser's back-forward cache (bfcache)
// for a while and then restored, that tree can come back stale/torn — any
// navigation then throws reading `.parallelRoutes` off a null node. A soft
// reset() re-renders the same broken router, so only a full reload recovers.
const ROUTER_CORRUPTION_PATTERN = /parallelRoutes|missing bootstrap script/i;

export function isConnectionError(message: string | undefined | null): boolean {
  return CONNECTION_ERROR_PATTERN.test(message || "");
}

export function isRouterCorruptionError(message: string | undefined | null): boolean {
  return ROUTER_CORRUPTION_PATTERN.test(message || "");
}
