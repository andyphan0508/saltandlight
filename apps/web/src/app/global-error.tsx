"use client";

import { useErrorRecovery } from "@/hooks/use-error-recovery";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

const pageStyle = {
  display: "flex",
  minHeight: "100vh",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: "1.5rem",
  textAlign: "center",
  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
} as const;

// Catches errors thrown from the root layout itself (e.g. the DB call in
// RootLayout) — a plain error.tsx can't catch those since it renders
// *inside* the layout. Must render its own <html>/<body>.
const GlobalError = ({ error, reset }: GlobalErrorProps) => {
  const { isRetrying, onRetry, onReload } = useErrorRecovery(error, reset, "global");

  if (isRetrying) {
    return (
      <html lang="vi">
        <body style={{ margin: 0, backgroundColor: "#FAF7F2" }}>
          <div style={{ ...pageStyle, gap: "1.25rem" }}>
            <div
              style={{
                width: "4rem",
                height: "4rem",
                borderRadius: "9999px",
                backgroundColor: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05)",
                border: "1px solid rgba(46, 117, 89, 0.2)",
              }}
            >
              <img
                src="/images/logo-emblem.webp"
                alt="Salt & Light"
                style={{ width: "2.5rem", height: "2.5rem", objectFit: "contain" }}
              />
            </div>
            <div style={{ color: "#2E7559", fontSize: "0.875rem", fontWeight: 600 }}>
              Đang kết nối đến hệ thống...
            </div>
          </div>
        </body>
      </html>
    );
  }

  return (
    <html lang="vi">
      <body style={{ margin: 0, backgroundColor: "#FAF7F2" }}>
        <div style={{ ...pageStyle, gap: "1rem", backgroundColor: "#FAF7F2", color: "#18181b" }}>
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
            Không thể tải trang lúc này. Vui lòng kiểm tra lại kết nối mạng hoặc thử lại sau giây lát.
          </p>
          {error.digest && (
            <p style={{ fontSize: "0.75rem", color: "#999", margin: 0 }}>Mã tra cứu: {error.digest}</p>
          )}
          <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
            <button
              onClick={onRetry}
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
              onClick={onReload}
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
};

export default GlobalError;
