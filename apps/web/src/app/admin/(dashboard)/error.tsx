"use client";

import { useErrorRecovery } from "@/lib/use-error-recovery";
import DashboardSubLoading from "./loading";

interface AdminErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

const AdminError = ({ error, reset }: AdminErrorProps) => {
  const { isRetrying, onRetry, onReload } = useErrorRecovery(
    error,
    reset,
    typeof window !== "undefined" ? window.location.pathname : "admin",
  );

  // While silently retrying (e.g. Worker cold boot), keep showing the admin loading skeleton.
  if (isRetrying) return <DashboardSubLoading />;

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
          onClick={onRetry}
          className="rounded-full bg-brand-forest px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-emerald-800 transition-colors"
        >
          Thử lại
        </button>
        <button
          onClick={onReload}
          className="rounded-full border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-700 hover:bg-slate-50 transition-colors"
        >
          Tải lại trang
        </button>
      </div>
    </div>
  );
};

export default AdminError;
