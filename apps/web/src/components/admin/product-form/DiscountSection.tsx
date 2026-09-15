"use client";

import { Button } from "@saltandlight/ui";
import { formatVND } from "@saltandlight/domain";
import type { ProductFormState } from "@/hooks/use-product-form";
import type { PromotionOption } from "@/interfaces/product-form";
import { Field, Section } from "../form-fields";
import { Tag } from "../Icons";
import { inputClass } from "./classes";

interface DiscountSectionProps {
  form: ProductFormState;
  promotions: PromotionOption[];
}

/** Apply a running promotion or a quick percentage discount to every variant. */
export const DiscountSection = ({ form, promotions }: DiscountSectionProps) => (
  <Section title="Áp đặt chương trình giảm giá" icon={<Tag size={16} />}>
    <p className="text-xs text-ink/60">
      Chọn chương trình khuyến mãi đang chạy hoặc áp dụng mức giảm giá trực tiếp cho toàn bộ biến thể sản phẩm.
    </p>

    {promotions.length > 0 && (
      <div className="mt-3 rounded-2xl bg-mint-50 p-4 border border-mint-200/80">
        <label className="block text-xs font-bold text-brand-forest mb-1.5">Áp dụng theo chương trình khuyến mãi:</label>
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={form.selectedPromotionId}
            onChange={(e) => form.onSelectPromotion(e.target.value)}
            className="rounded-xl border border-ink/15 bg-white px-3.5 py-2 text-xs font-semibold focus:border-brand-forest focus:outline-none min-w-[260px]"
          >
            <option value="">— Chọn chương trình để áp đặt —</option>
            {promotions.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} (
                {p.discountType === "percent" ? `Giảm ${p.discountValue}%` : `Giảm ${formatVND(Number(p.discountValue))}`})
              </option>
            ))}
          </select>
          {form.selectedPromotionId && (
            <button type="button" onClick={form.onClearPromotion} className="text-xs text-sale hover:underline font-semibold">
              Hủy áp dụng
            </button>
          )}
        </div>
      </div>
    )}

    <div className="mt-4 flex flex-wrap items-end gap-3 pt-2">
      <Field label="Hoặc nhập % giảm nhanh" className="w-36">
        <div className="relative">
          <input
            type="number"
            min={1}
            max={90}
            value={form.discountPct}
            onChange={(e) => form.setDiscountPct(Number(e.target.value))}
            className={`${inputClass} pr-7 text-xs`}
          />
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-ink/40">%</span>
        </div>
      </Field>
      <Button type="button" size="sm" variant="secondary" onClick={form.onApplyDiscount}>
        Áp dụng cho tất cả
      </Button>
      <Button type="button" size="sm" variant="ghost" onClick={form.onClearDiscount}>
        Bỏ giảm giá
      </Button>
    </div>
  </Section>
);
