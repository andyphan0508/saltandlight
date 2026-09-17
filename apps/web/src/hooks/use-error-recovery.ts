import { useEffect, useState } from "react";
import {
  claimAutoReload,
  getRetryBufferState,
  isRouterCorruptionError,
  MAX_RETRY_ATTEMPTS,
  resetRetryBuffer,
} from "@/helpers/error-classification";

/**
 * Shared recovery for error boundaries. A corrupted client router (e.g. a tab
 * restored from bfcache) forces a full reload; transient failures such as a
 * Worker cold boot retry silently a few times before the error UI shows.
 */
export const useErrorRecovery = (error: Error, reset: () => void, bufferKey: string) => {
  const isRouterCorrupted = isRouterCorruptionError(error?.message);
  // Decided once per mount: a reload is only claimed if the recent-reload cap allows it
  const [willReload] = useState(() => isRouterCorrupted && typeof window !== "undefined" && claimAutoReload());
  const [bufferState] = useState(() =>
    isRouterCorrupted ? { shouldRetry: false, attempt: 0, delayMs: 0 } : getRetryBufferState(bufferKey),
  );

  useEffect(() => {
    console.error(error);
    if (willReload) {
      const timer = setTimeout(() => window.location.reload(), 400);
      return () => clearTimeout(timer);
    }
    if (isRouterCorrupted) return; // reload cap reached: show the error page instead of looping
    if (!bufferState.shouldRetry) return;
    const timer = setTimeout(() => {
      // Last attempt in the buffer: reload to clear stale Worker/browser state
      if (bufferState.attempt >= MAX_RETRY_ATTEMPTS) window.location.reload();
      else reset();
    }, bufferState.delayMs);
    return () => clearTimeout(timer);
  }, [error, isRouterCorrupted, willReload, bufferState, reset]);

  const onRetry = () => {
    resetRetryBuffer(bufferKey);
    reset();
  };

  const onReload = () => {
    resetRetryBuffer(bufferKey);
    window.location.reload();
  };

  // A pending automatic reload looks like loading, not like an error
  return { isRetrying: bufferState.shouldRetry || willReload, onRetry, onReload };
};
