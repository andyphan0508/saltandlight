"use client";

import { useEffect } from "react";

// Catches errors thrown from the root layout itself (e.g. the DB call in
// RootLayout) — a plain error.tsx can't catch those since it renders
// *inside* the layout. Must render its own <html>/<body>.
export default function GlobalError({
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
    console.error("[GlobalError]", error);
    // If it's a transient connection drop, auto-retry after 1.2s to smoothly recover
    if (isConnectionError) {
      const timer = setTimeout(() => {
        reset();
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [error, isConnectionError, reset]);

  return (
    <html lang="vi">
      <body>
        <div
          style={{
            display: "flex",
            minHeight: "100vh",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "1rem",
            padding: "1.5rem",
            textAlign: "center",
            fontFamily: "system-ui, -apple-system, sans-serif",
            backgroundColor: "#FAF7F2",
            color: "#18181b",
          }}
        >
          <div
            style={{
              width: "3.5rem",
              height: "3.5rem",
              borderRadius: "1rem",
              backgroundColor: "#FEF3C7",
              color: "#D97706",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.75rem",
              fontWeight: 900,
              marginBottom: "0.5rem",
            }}
          >
            !
          </div>
          <h1 style={{ fontSize: "1.35rem", fontWeight: 800, margin: 0 }}>Đã có lỗi xảy ra</h1>
          <p style={{ maxWidth: "32rem", fontSize: "0.875rem", color: "#666", margin: 0, lineHeight: 1.6 }}>
            {isConnectionError
              ? "Kết nối đến máy chủ tạm thời bị gián đoạn. Hệ thống đang tự động kết nối lại..."
              : error.message || "Không thể tải trang lúc này. Vui lòng thử lại sau giây lát."}
          </p>
          {error.digest && (
            <p style={{ fontSize: "0.75rem", color: "#999", margin: 0 }}>Mã tra cứu: {error.digest}</p>
          )}
          <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
            <button
              onClick={() => reset()}
              style={{
                borderRadius: "999px",
                backgroundColor: "#2E7559",
                color: "#fff",
                padding: "0.625rem 1.35rem",
                fontSize: "0.875rem",
                fontWeight: 600,
                border: "none",
                cursor: "pointer",
              }}
            >
              Thử lại
            </button>
            <button
              onClick={() => {
                if (typeof window !== "undefined") window.location.reload();
              }}
              style={{
                borderRadius: "999px",
                backgroundColor: "#fff",
                color: "#18181b",
                border: "1px solid #e2e8f0",
                padding: "0.625rem 1.35rem",
                fontSize: "0.875rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Tải lại trang
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
