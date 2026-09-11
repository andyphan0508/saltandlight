"use client";

import { useEffect, useState } from "react";
import {
  isRouterCorruptionError,
  getRetryBufferState,
  resetRetryBuffer,
  MAX_RETRY_ATTEMPTS,
} from "@/lib/error-classification";
import DashboardSubLoading from "./loading";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const isRouterCorrupted = isRouterCorruptionError(error?.message);

  const [bufferState] = useState(() => {
    if (isRouterCorrupted) return { shouldRetry: false, attempt: 0, delayMs: 0 };
    const routeKey = typeof window !== "undefined" ? window.location.pathname : "admin";
    return getRetryBufferState(routeKey);
  });

  useEffect(() => {
    console.error(error);
    // Corrupted client router (e.g. after the admin tab sat frozen in
    // bfcache) — reset() re-renders the same broken router, so only a full
    // reload fixes it.
    if (isRouterCorrupted) {
      const timer = setTimeout(() => {
        window.location.reload();
      }, 400);
      return () => clearTimeout(timer);
    }

    // If in retry buffer during service cold boot
    if (bufferState.shouldRetry) {
      const timer = setTimeout(() => {
        if (bufferState.attempt >= MAX_RETRY_ATTEMPTS) {
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

  // While in the retry buffer, keep displaying the admin loading skeleton
  if (bufferState.shouldRetry) {
    return <DashboardSubLoading />;
  }

  const handleManualRetry = () => {
    const routeKey = typeof window !== "undefined" ? window.location.pathname : "admin";
    resetRetryBuffer(routeKey);
    reset();
  };

  const handleReload = () => {
    const routeKey = typeof window !== "undefined" ? window.location.pathname : "admin";
    resetRetryBuffer(routeKey);
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-5 px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-rose-50 text-rose-600 border border-rose-200">
        <span className="text-2xl font-bold">!</span>
      </div>
      <div className="max-w-md space-y-2">
        <h1 className="text-xl font-bold uppercase text-slate-900">Đã có lỗi xảy ra</h1>
        <p className="text-sm text-slate-500">
          Không thể tải dữ liệu cho trang này. Vui lòng thử lại sau giây lát.
        </p>
        {error.digest && <p className="text-xs text-slate-400">Mã lỗi: {error.digest}</p>}
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={handleManualRetry}
          className="rounded-full bg-brand-forest px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-emerald-800 transition-colors"
        >
          Thử lại
        </button>
        <button
          onClick={handleReload}
          className="rounded-full border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-700 hover:bg-slate-50 transition-colors"
        >
          Tải lại trang
        </button>
      </div>
    </div>
  );
}
