"use client";

import { formatVND } from "@saltandlight/domain";
import { DEFAULT_PRICE_NOTE } from "@/helpers/product-content";
import type { ProductFormState } from "@/hooks/use-product-form";
import { Field, Section } from "../form-fields";
import { Sparkles } from "../Icons";
import { inputClass } from "./classes";

const PRICE_NOTE_PRESETS = [
  {
    label: "✨ Thiệp Lời Chúa & Freeship 299K",
    value: DEFAULT_PRICE_NOTE,
    className: "bg-mint-50 text-brand-forest border border-mint-200/80 hover:bg-mint-100",
  },
  {
    label: "🔥 Flash Sale có hạn",
    value: "Flash Sale đặc biệt — Số lượng có hạn cho mùa lễ",
    className: "bg-amber-50 text-amber-800 border border-amber-200/80 hover:bg-amber-100",
  },
  {
    label: "🛡️ Đổi size tận nơi",
    value: "Hỗ trợ đổi size tận nơi — Kiểm tra hàng trước thanh toán",
    className: "bg-sky-50 text-sky-800 border border-sky-200/80 hover:bg-sky-100",
  },
  { label: "Ẩn dòng ưu đãi", value: "", className: "bg-slate-100 text-slate-600 hover:bg-slate-200" },
];

/** Promo line shown in the storefront price box, with presets and a live preview of the first variant's price. */
export const PriceNoteSection = ({ form }: { form: ProductFormState }) => {
  const first = form.variants[0];
  const price = first?.price || 0;
  const listPrice = first?.compareAtPrice ?? 0;
  const hasDiscount = listPrice > price;

  return (
    <Section title="Cấu hình hiển thị bảng giá & Thông điệp ưu đãi" icon={<Sparkles size={16} />}>
      <p className="text-xs text-ink/60 leading-relaxed">
        Tùy chỉnh thông điệp khuyến mãi hiển thị trực tiếp trong khung giá ở trang chi tiết sản phẩm. Bỏ trống nếu muốn ẩn
        dòng thông điệp này.
      </p>

      <div className="mt-3.5 space-y-3">
        <Field label="Dòng thông điệp ưu đãi trong khung giá">
          <div className="relative">
            <input
              value={form.priceNote}
              onChange={(e) => form.setPriceNote(e.target.value)}
              placeholder="VD: Tặng kèm thiệp Lời Chúa & Miễn phí vận chuyển cho đơn từ 299K"
              className={`${inputClass} pr-9`}
            />
            {form.priceNote && (
              <button
                type="button"
                onClick={() => form.setPriceNote("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-sale font-bold"
                title="Xóa thông điệp"
              >
                ✕
              </button>
            )}
          </div>
        </Field>

        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-[11px] font-bold text-slate-400">Gợi ý nhanh:</span>
          {PRICE_NOTE_PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => form.setPriceNote(preset.value)}
              className={`rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors ${preset.className}`}
            >
              {preset.label}
            </button>
          ))}
        </div>

        <div className="mt-4 rounded-2xl border border-mint-200/90 bg-mint-50/50 p-4">
          <div className="text-[10px] font-bold uppercase tracking-wider text-brand-forest mb-2 flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Xem trước hiển thị khung giá trên storefront</span>
          </div>
          <div className="flex flex-wrap items-baseline gap-2.5">
            <span className="text-xl sm:text-2xl font-bold text-ink">{formatVND(price)}</span>
            {hasDiscount && (
              <>
                <span className="text-xs sm:text-sm text-ink/40 line-through">{formatVND(listPrice)}</span>
                <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-700">
                  Giảm {Math.round((1 - price / listPrice) * 100)}%
                </span>
              </>
            )}
          </div>
          {hasDiscount && (
            <p className="mt-1 text-[11px] font-semibold text-rose-600">
              Tiết kiệm {formatVND(listPrice - price)} so với giá niêm yết
            </p>
          )}
          {form.priceNote.trim().length > 0 ? (
            <div className="mt-2.5 flex items-start gap-2 text-xs text-brand-forest">
              <Sparkles size={14} className="flex-shrink-0 mt-0.5 text-amber-500" />
              <span className="leading-snug font-medium">{form.priceNote}</span>
            </div>
          ) : (
            <div className="mt-2 text-[11px] italic text-slate-400">(Đang ẩn dòng thông điệp ưu đãi)</div>
          )}
        </div>
      </div>
    </Section>
  );
};
