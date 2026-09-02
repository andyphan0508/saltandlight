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
  useEffect(() => {
    console.error(error);
  }, [error]);

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
            fontFamily: "system-ui, sans-serif",
          }}
        >
          <h1 style={{ fontSize: "1.25rem", fontWeight: 800 }}>Đã có lỗi xảy ra</h1>
          <p style={{ maxWidth: "32rem", fontSize: "0.875rem", color: "#666" }}>
            {error.message || "Không thể tải trang. Vui lòng thử lại."}
          </p>
          {error.digest && (
            <p style={{ fontSize: "0.75rem", color: "#999" }}>Mã lỗi: {error.digest}</p>
          )}
          <button
            onClick={reset}
            style={{
              borderRadius: "999px",
              backgroundColor: "#18181b",
              color: "#fff",
              padding: "0.625rem 1.25rem",
              fontSize: "0.875rem",
              fontWeight: 600,
              border: "none",
              cursor: "pointer",
            }}
          >
            Thử lại
          </button>
        </div>
      </body>
    </html>
  );
}
