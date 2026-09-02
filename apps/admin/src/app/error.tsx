"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="font-display text-xl font-black uppercase">Đã có lỗi xảy ra</h1>
      <p className="max-w-md text-sm text-ink/60">
        {error.message || "Không thể tải trang. Vui lòng thử lại."}
      </p>
      {error.digest && <p className="text-xs text-ink/40">Mã lỗi: {error.digest}</p>}
      <button
        onClick={reset}
        className="rounded-pill bg-ink px-5 py-2.5 text-sm font-semibold text-white"
      >
        Thử lại
      </button>
    </div>
  );
}
