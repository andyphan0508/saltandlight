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
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-5 px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-amber-50 text-amber-600 border border-amber-200">
        <span className="text-2xl font-black">!</span>
      </div>
      <div className="space-y-2 max-w-md">
        <h1 className="font-display text-2xl font-black uppercase text-ink">Đã có lỗi xảy ra</h1>
        <p className="text-sm text-ink/70">
          Không thể kết nối hoặc tải dữ liệu từ máy chủ. Vui lòng kiểm tra lại kết nối mạng hoặc thử lại sau giây lát.
        </p>
        {error.digest && <p className="text-xs text-ink/40">Mã lỗi: {error.digest}</p>}
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button onClick={reset} variant="primary" size="md">
          Thử lại
        </Button>
        <Link href="/">
          <Button variant="secondary" size="md">
            Về trang chủ
          </Button>
        </Link>
      </div>
    </div>
  );
}
