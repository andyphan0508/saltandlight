"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@saltandlight/ui";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const isConnectionError =
    /connection closed|closed the connection|connection terminated|can't reach database|terminating connection|broken pipe|econnreset|etimedout|57P01|P1001|P1002|P1017/i.test(
      error?.message || "",
    );

  useEffect(() => {
    console.error("[StorefrontError]", error);
    // If it's a transient connection drop, auto-retry after 1s
    if (isConnectionError) {
      const timer = setTimeout(() => {
        reset();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [error, isConnectionError, reset]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-5 px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-amber-50 text-amber-600 border border-amber-200">
        <span className="text-2xl font-black">!</span>
      </div>
      <div className="space-y-2 max-w-md">
        <h1 className="font-display text-2xl font-black uppercase text-ink">Đã có lỗi xảy ra</h1>
        <p className="text-sm text-ink/70">
          {isConnectionError
            ? "Kết nối đến máy chủ tạm thời bị gián đoạn. Hệ thống đang tự động kết nối lại..."
            : "Không thể kết nối hoặc tải dữ liệu từ máy chủ. Vui lòng kiểm tra lại kết nối mạng hoặc thử lại sau giây lát."}
        </p>
        {error.digest && <p className="text-xs text-ink/40">Mã lỗi: {error.digest}</p>}
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button onClick={reset} variant="primary" size="md">
          Thử lại
        </Button>
        <Button
          onClick={() => {
            if (typeof window !== "undefined") window.location.reload();
          }}
          variant="secondary"
          size="md"
        >
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
}
