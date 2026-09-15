"use client";

import { Button } from "@saltandlight/ui";
import { Modal } from "./Modal";
import { X } from "./Icons";
import { GuideTable } from "./ProductGuides";
import type { ProductGuide } from "@/lib/product-guides";

/** Size chart dialog opened from the buy box; `charts` are the category's table-layout guides. */
export const SizeChartModal = ({ charts, onClose }: { charts: ProductGuide[]; onClose: () => void }) => (
  <Modal
    isOpen
    onClose={onClose}
    isDismissable
    labelledBy="size-chart-title"
    className="bg-white max-w-lg rounded-3xl p-5 sm:p-6 max-h-[90vh] overflow-y-auto border border-ink/10"
  >
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
          {charts.length > 1 && <h4 className="text-xs font-bold uppercase tracking-wide text-ink/70">{chart.title}</h4>}
          {chart.subtitle && <p className="text-[11px] text-ink/50">{chart.subtitle}</p>}
          <GuideTable items={chart.items} />
        </div>
      ))}

      <div className="rounded-2xl bg-cream p-4 text-xs text-ink/70 border border-ink/5">
        <p className="font-bold text-ink">💡 Bạn còn phân vân chưa chắc chắn về size?</p>
        <p className="mt-1 leading-relaxed">
          Hãy liên hệ ngay hotline/Zalo <strong>0847 25 2025</strong>, đội ngũ tư vấn sẽ hỗ trợ bạn chọn size chuẩn và
          vừa vặn nhất!
        </p>
      </div>
    </div>

    <div className="mt-6 pt-3 border-t border-ink/10 flex justify-end">
      <Button type="button" variant="outline" onClick={onClose} className="rounded-xl px-5 py-2 text-xs font-bold">
        Đã hiểu &amp; Đóng
      </Button>
    </div>
  </Modal>
);
