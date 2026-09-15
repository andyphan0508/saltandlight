"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { Button } from "@saltandlight/ui";
import { X } from "./Icons";
import { GuideTable } from "./ProductGuides";
import type { ProductGuide } from "@/lib/product-guides";

/** Size chart dialog opened from the buy box; `charts` are the category's table-layout guides. */
export function SizeChartModal({ charts, onClose }: { charts: ProductGuide[]; onClose: () => void }) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  return createPortal(
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="size-chart-title"
    >
      <div
        className="fixed inset-0 bg-ink/50 backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative w-full max-w-lg rounded-3xl bg-white p-5 sm:p-6 shadow-2xl z-10 my-auto max-h-[90vh] overflow-y-auto animate-pop-in border border-ink/10">
        <div className="flex items-center justify-between border-b border-ink/10 pb-4">
          <h3 id="size-chart-title" className="font-display text-lg font-bold uppercase text-ink">
            📏 Bảng Thông Số &amp; Quy Đổi Size
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-ink/50 hover:bg-ink/5 hover:text-ink transition-colors"
            title="Đóng (ESC)"
            aria-label="Đóng"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mt-4 space-y-4">
          {charts.map((chart) => (
            <div key={chart.id} className="space-y-2">
              {charts.length > 1 && (
                <h4 className="text-xs font-bold uppercase tracking-wide text-ink/70">{chart.title}</h4>
              )}
              {chart.subtitle && <p className="text-[11px] text-ink/50">{chart.subtitle}</p>}
              <GuideTable items={chart.items} />
            </div>
          ))}

          <div className="rounded-2xl bg-cream p-4 text-xs text-ink/70 border border-ink/5">
            <p className="font-bold text-ink">💡 Bạn còn phân vân chưa chắc chắn về size?</p>
            <p className="mt-1 leading-relaxed">
              Hãy liên hệ ngay hotline/Zalo <strong>0847 25 2025</strong>, đội ngũ tư vấn sẽ hỗ trợ bạn chọn size
              chuẩn và vừa vặn nhất!
            </p>
          </div>
        </div>

        <div className="mt-6 pt-3 border-t border-ink/10 flex justify-end">
          <Button type="button" variant="outline" onClick={onClose} className="rounded-xl px-5 py-2 text-xs font-bold">
            Đã hiểu &amp; Đóng
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
