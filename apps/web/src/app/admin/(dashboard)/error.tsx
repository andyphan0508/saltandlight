"use client";

import { useEffect } from "react";
import { isRouterCorruptionError } from "@/lib/error-classification";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const isRouterCorrupted = isRouterCorruptionError(error?.message);

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
  }, [error, isRouterCorrupted]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-5 px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-rose-50 text-rose-600 border border-rose-200">
        <span className="text-2xl font-black">!</span>
      </div>
      <div className="max-w-md space-y-2">
        <h1 className="text-xl font-black uppercase text-slate-900">Đã có lỗi xảy ra</h1>
        <p className="text-sm text-slate-500">
          {isRouterCorrupted
            ? "Trang đã ở chế độ chờ quá lâu. Đang tự động tải lại..."
            : "Không thể tải dữ liệu cho trang này. Vui lòng thử lại sau giây lát."}
        </p>
        {error.digest && <p className="text-xs text-slate-400">Mã lỗi: {error.digest}</p>}
      </div>
      <button
        onClick={reset}
        className="rounded-full bg-brand-forest px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-emerald-800 transition-colors"
      >
        Thử lại
      </button>
    </div>
  );
}
