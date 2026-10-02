"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { adminFetch } from "@/api/admin-fetch";
import { Modal } from "@/components/Modal";
import { ProductChecklist } from "@/components/admin/ProductChecklist";
import { Gift, X } from "@/components/admin/Icons";
import { sanitizeCouponPrefix, type CouponRule } from "@/helpers/coupon";
import type { PromotionProductOption } from "@/interfaces/promotion";

const TYPES: { id: CouponRule["discountType"]; label: string }[] = [
  { id: "percent", label: "Giảm theo %" },
  { id: "fixed", label: "Giảm số tiền" },
  { id: "free_shipping", label: "Miễn phí ship" },
];

const INPUT = "w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-base sm:text-sm focus:border-brand-forest focus:outline-none";

const Field = ({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) => (
  <label className="block">
    <span className="mb-1 block text-xs font-bold text-slate-700">{label}</span>
    {children}
    {hint && <span className="mt-1 block text-[11px] text-slate-500">{hint}</span>}
  </label>
);

/** A date picked in Vietnam, as the instant that day starts or ends there. */
const vietnamDayBound = (day: string, edge: "start" | "end") => (day ? `${day}T${edge === "start" ? "00:00:00" : "23:59:59"}+07:00` : null);

const toNumber = (value: string) => Number(value.replace(/\D/g, "")) || 0;

/** New campaign: the discount rule, where it applies, when, and how many codes to issue now. */
export const CampaignFormModal = ({ products, onClose }: { products: PromotionProductOption[]; onClose: () => void }) => {
  const router = useRouter();
  const [name, setName] = useState("");
  const [discountType, setDiscountType] = useState<CouponRule["discountType"]>("percent");
  const [discountValue, setDiscountValue] = useState("");
  const [maxDiscount, setMaxDiscount] = useState("");
  const [minOrderTotal, setMinOrderTotal] = useState("");
  const [productIds, setProductIds] = useState<string[]>([]);
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [quantity, setQuantity] = useState("50");
  const [prefix, setPrefix] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const cleanPrefix = sanitizeCouponPrefix(prefix);
  const sampleCode = `${cleanPrefix ? `${cleanPrefix}-` : ""}K7QX9MPA`;

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSaving(true);
    try {
      const { id } = await adminFetch<{ id: string }>("/api/admin/coupons", {
        method: "POST",
        body: {
          name,
          discountType,
          discountValue: discountType === "free_shipping" ? 0 : toNumber(discountValue),
          maxDiscount: discountType === "percent" && maxDiscount ? toNumber(maxDiscount) : null,
          minOrderTotal: toNumber(minOrderTotal),
          productIds,
          startsAt: vietnamDayBound(startsAt, "start"),
          endsAt: vietnamDayBound(endsAt, "end"),
          quantity: toNumber(quantity),
          prefix: cleanPrefix,
        },
      });
      toast.success(`Đã tạo ${toNumber(quantity)} mã`);
      router.push(`/admin/coupons/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tạo đợt mã");
      setIsSaving(false);
    }
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      labelledBy="coupon-form-title"
      className="flex max-h-[92vh] max-w-2xl flex-col overflow-hidden rounded-3xl border border-ink/10 bg-white"
    >
      <div className="flex items-center justify-between border-b border-ink/10 px-5 py-4 sm:px-6">
        <h3 id="coupon-form-title" className="flex items-center gap-2 text-base font-bold text-ink">
          <Gift size={18} className="text-brand-forest" />
          Tạo đợt mã giảm giá
        </h3>
        <button type="button" onClick={onClose} aria-label="Đóng" className="flex h-10 w-10 items-center justify-center rounded-full text-ink/60 hover:bg-ink/5">
          <X size={18} />
        </button>
      </div>

      <form onSubmit={onSubmit} className="flex-1 space-y-5 overflow-y-auto p-5 sm:p-6">
        {error && <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3.5 text-xs font-semibold text-rose-700">{error}</div>}

        <Field label="Tên đợt (chỉ admin thấy)">
          <input value={name} onChange={(e) => setName(e.target.value)} required maxLength={200} placeholder="Ví dụ: Tri ân khách tháng 10" className={INPUT} />
        </Field>

        <div>
          <span className="mb-1 block text-xs font-bold text-slate-700">Loại giảm</span>
          <div role="radiogroup" aria-label="Loại giảm" className="grid grid-cols-3 gap-1 rounded-2xl bg-slate-100 p-1">
            {TYPES.map((t) => (
              <button
                key={t.id}
                type="button"
                role="radio"
                aria-checked={discountType === t.id}
                onClick={() => setDiscountType(t.id)}
                className={`rounded-xl px-2 py-2 text-xs font-semibold transition-colors ${
                  discountType === t.id ? "bg-white text-slate-900 shadow-sm" : "text-slate-600"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {discountType !== "free_shipping" && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={discountType === "percent" ? "Phần trăm giảm (%)" : "Số tiền giảm (₫)"}>
              <input
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                inputMode="numeric"
                required
                placeholder={discountType === "percent" ? "10" : "30000"}
                className={INPUT}
              />
            </Field>
            {discountType === "percent" && (
              <Field label="Giảm tối đa (₫)" hint="Để trống nếu không giới hạn">
                <input value={maxDiscount} onChange={(e) => setMaxDiscount(e.target.value)} inputMode="numeric" placeholder="50000" className={INPUT} />
              </Field>
            )}
          </div>
        )}

        <Field label="Đơn tối thiểu (₫)" hint="Tính trên tiền hàng, chưa gồm phí ship. Để trống nếu không yêu cầu.">
          <input value={minOrderTotal} onChange={(e) => setMinOrderTotal(e.target.value)} inputMode="numeric" placeholder="0" className={INPUT} />
        </Field>

        <div className="space-y-1">
          <ProductChecklist products={products} selectedIds={productIds} onChange={setProductIds} />
          <p className="text-[11px] text-slate-500">
            {productIds.length === 0 ? "Chưa chọn sản phẩm nào: mã áp dụng cho cả đơn hàng." : "Mã chỉ giảm trên tiền của các sản phẩm đã chọn."}
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Bắt đầu từ ngày" hint="Để trống: dùng được ngay">
            <input type="date" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} className={INPUT} />
          </Field>
          <Field label="Hết hạn sau ngày" hint="Dùng được hết ngày này (giờ Việt Nam)">
            <input type="date" value={endsAt} min={startsAt || undefined} onChange={(e) => setEndsAt(e.target.value)} className={INPUT} />
          </Field>
        </div>

        <div className="grid gap-4 rounded-2xl bg-slate-50 p-4 sm:grid-cols-2">
          <Field label="Số lượng mã" hint="Tối đa 1.000 mỗi lần; tạo thêm sau được">
            <input value={quantity} onChange={(e) => setQuantity(e.target.value)} inputMode="numeric" required className={INPUT} />
          </Field>
          <Field label="Tiền tố (tuỳ chọn)" hint={`Mã sẽ có dạng ${sampleCode}`}>
            <input value={prefix} onChange={(e) => setPrefix(e.target.value)} maxLength={20} placeholder="TET2026" className={`${INPUT} uppercase`} />
          </Field>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="min-h-11 w-full rounded-full bg-brand-forest text-sm font-bold text-white transition-transform active:scale-[0.99] disabled:opacity-60"
        >
          {isSaving ? "Đang tạo mã…" : `Tạo ${toNumber(quantity) || 0} mã`}
        </button>
      </form>
    </Modal>
  );
};
