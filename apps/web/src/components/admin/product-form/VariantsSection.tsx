"use client";

import { Button } from "@saltandlight/ui";
import { formatVND } from "@saltandlight/domain";
import { textColorOn } from "@/helpers/color";
import type { ProductFormState } from "@/hooks/use-product-form";
import { Section } from "../form-fields";
import { Plus, Tag, Trash2 } from "../Icons";
import { cellClass } from "./classes";

/** Editable price / stock table, one row per variant. */
export const VariantsSection = ({ form }: { form: ProductFormState }) => (
  <Section
    title="Bảng giá & Biến thể sản phẩm"
    icon={<Tag size={16} />}
    badge={`${form.variants.length} biến thể`}
    action={
      <Button type="button" size="sm" variant="outline" onClick={form.onAddVariant}>
        <Plus size={14} /> Thêm dòng
      </Button>
    }
  >
    <div className="overflow-x-auto rounded-2xl border border-slate-200/80 shadow-xs">
      <table className="w-full text-xs">
        <thead className="border-b border-slate-200/80 bg-slate-50/80 text-left uppercase tracking-wider text-slate-500">
          <tr>
            <th className="px-3.5 py-3 font-bold">SKU</th>
            <th className="px-3.5 py-3 font-bold">Màu sắc</th>
            <th className="px-3.5 py-3 font-bold">Kích cỡ (Size)</th>
            <th className="px-3.5 py-3 font-bold">Giá bán thực tế</th>
            <th className="px-3.5 py-3 font-bold">Giá niêm yết (So sánh)</th>
            <th className="px-3.5 py-3 font-bold">Tồn kho</th>
            <th className="px-3.5 py-3 text-center">Xóa</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {form.variants.map((variant, i) => {
            const discount =
              variant.compareAtPrice && variant.compareAtPrice > variant.price
                ? Math.round((1 - variant.price / variant.compareAtPrice) * 100)
                : null;

            return (
              <tr key={i} className="hover:bg-slate-50/60 transition-colors">
                <td className="px-3 py-2.5">
                  <input
                    value={variant.sku}
                    onChange={(e) => form.onVariantChange(i, { sku: e.target.value })}
                    required
                    className={`${cellClass} font-mono text-xs`}
                    placeholder="SKU-XXX"
                  />
                </td>
                <td className="px-3 py-2.5">
                  <div className="flex items-center gap-1.5">
                    <input
                      type="color"
                      value={variant.colorHex || "#FFFFFF"}
                      onChange={(e) => form.onVariantChange(i, { colorHex: e.target.value.toUpperCase() })}
                      aria-label={`Mã màu cho ${variant.color || "biến thể"}`}
                      title={variant.colorHex || "Chưa đặt mã màu"}
                      className="h-8 w-8 flex-shrink-0 cursor-pointer rounded-lg border border-slate-200 bg-white p-0.5"
                    />
                    <input
                      value={variant.color}
                      onChange={(e) => form.onVariantChange(i, { color: e.target.value })}
                      className={cellClass}
                      placeholder="VD: Đen"
                      style={
                        variant.colorHex
                          ? { backgroundColor: variant.colorHex, color: textColorOn(variant.colorHex) }
                          : undefined
                      }
                    />
                  </div>
                </td>
                <td className="px-3 py-2.5">
                  <input
                    value={variant.size}
                    onChange={(e) => form.onVariantChange(i, { size: e.target.value })}
                    className={`${cellClass} font-bold`}
                    placeholder="VD: S"
                  />
                </td>
                <td className="px-3 py-2.5">
                  <input
                    type="number"
                    value={variant.price}
                    onChange={(e) => form.onVariantChange(i, { price: Number(e.target.value) })}
                    required
                    className={`${cellClass} font-bold text-slate-900`}
                  />
                  <div className="mt-1 text-[11px] font-semibold text-brand-forest">{formatVND(variant.price)}</div>
                </td>
                <td className="px-3 py-2.5">
                  <input
                    type="number"
                    value={variant.compareAtPrice ?? ""}
                    onChange={(e) =>
                      form.onVariantChange(i, { compareAtPrice: e.target.value ? Number(e.target.value) : null })
                    }
                    placeholder="Giá gốc..."
                    className={cellClass}
                  />
                  {variant.compareAtPrice ? (
                    <div className="mt-1 flex items-center gap-1.5">
                      <span className="text-[10px] text-slate-400 line-through">{formatVND(variant.compareAtPrice)}</span>
                      {discount ? (
                        <span className="rounded-full bg-rose-50 px-1.5 py-0.2 text-[9px] font-bold text-rose-600 border border-rose-200/60">
                          -{discount}%
                        </span>
                      ) : null}
                    </div>
                  ) : (
                    <div className="mt-1 text-[10px] text-slate-300 italic">Không có giá gốc</div>
                  )}
                </td>
                <td className="px-3 py-2.5">
                  <input
                    type="number"
                    value={variant.stockQuantity}
                    onChange={(e) => form.onVariantChange(i, { stockQuantity: Number(e.target.value) })}
                    required
                    className={`${cellClass} ${variant.stockQuantity <= 5 ? "text-sale font-bold" : ""}`}
                  />
                  <div className="mt-0.5 text-[10px] text-slate-400">
                    {variant.stockQuantity <= 0 ? (
                      <span className="font-bold text-rose-600">Hết hàng</span>
                    ) : variant.stockQuantity <= 5 ? (
                      <span className="font-semibold text-amber-600">Sắp hết ({variant.stockQuantity})</span>
                    ) : (
                      <span>Sẵn hàng</span>
                    )}
                  </div>
                </td>
                <td className="px-3 py-2.5 text-center">
                  {form.variants.length > 1 && (
                    <button
                      type="button"
                      onClick={() => form.onRemoveVariant(i)}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                      title="Xóa biến thể này"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  </Section>
);
