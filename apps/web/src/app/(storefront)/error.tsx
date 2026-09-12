"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@saltandlight/ui";
import {
  isRouterCorruptionError,
  getRetryBufferState,
  resetRetryBuffer,
  MAX_RETRY_ATTEMPTS,
} from "@/lib/error-classification";
import StorefrontLoading from "./loading";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

const ErrorPage = ({
  error,
  reset,
}: ErrorProps) => {
  const isRouterCorrupted = isRouterCorruptionError(error?.message);

  const [bufferState] = useState(() => {
    if (isRouterCorrupted) return { shouldRetry: false, attempt: 0, delayMs: 0 };
    const routeKey = typeof window !== "undefined" ? window.location.pathname : "storefront";
    return getRetryBufferState(routeKey);
  });

  useEffect(() => {
    console.error("[StorefrontError]", error);

    // Corrupted client router (e.g. after the tab sat frozen in bfcache) —
    // reset() re-renders the same broken router, so only a full reload fixes it.
    if (isRouterCorrupted) {
      const timer = setTimeout(() => {
        window.location.reload();
      }, 400);
      return () => clearTimeout(timer);
    }

    // If we are within the retry buffer window (service cold boot / transient failure)
    if (bufferState.shouldRetry) {
      const timer = setTimeout(() => {
        if (bufferState.attempt >= MAX_RETRY_ATTEMPTS) {
          // On the final retry attempt in the buffer, do a full reload to clear stale worker/browser state
          if (typeof window !== "undefined") {
            window.location.reload();
          } else {
            reset();
          }
        } else {
          reset();
        }
      }, bufferState.delayMs);

      return () => clearTimeout(timer);
    }
  }, [error, isRouterCorrupted, bufferState, reset]);

  // While in the retry buffer, keep displaying the clean loading skeleton!
  // The user only sees "Loading...", giving the backend service time to cold-boot.
  if (bufferState.shouldRetry) {
    return <StorefrontLoading />;
  }

  const onManualRetry = () => {
    const routeKey = typeof window !== "undefined" ? window.location.pathname : "storefront";
    resetRetryBuffer(routeKey);
    reset();
  };

  const onReload = () => {
    const routeKey = typeof window !== "undefined" ? window.location.pathname : "storefront";
    resetRetryBuffer(routeKey);
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-5 px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-amber-50 text-amber-600 border border-amber-200">
        <span className="text-2xl font-bold">!</span>
      </div>
      <div className="space-y-2 max-w-md">
        <h1 className="font-display text-2xl font-bold uppercase text-ink">Đã có lỗi xảy ra</h1>
        <p className="text-sm text-ink/70">
          Không thể kết nối hoặc tải dữ liệu từ máy chủ. Vui lòng kiểm tra lại kết nối mạng hoặc thử lại sau giây lát.
        </p>
        {error.digest && <p className="text-xs text-ink/40">Mã lỗi: {error.digest}</p>}
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button onClick={onManualRetry} variant="primary" size="md">
          Thử lại
        </Button>
        <Button onClick={onReload} variant="secondary" size="md">
          Tải lại trang
        </Button>
        <Link href="/">
          <Button variant="ghost" size="md">
            Về trang chủ
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default ErrorPage;
