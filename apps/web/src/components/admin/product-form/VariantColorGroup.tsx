"use client";

import { useState } from "react";
import { formatVND } from "@saltandlight/domain";
import { textColorOn } from "@/helpers/color";
import type { ProductFormState } from "@/hooks/use-product-form";
import { Plus, Trash2 } from "../Icons";
import { cellClass } from "./classes";

export interface VariantGroupRow {
  index: number;
  sku: string;
  size: string;
  price: number;
  compareAtPrice: number | null;
  stockQuantity: number;
}

interface VariantColorGroupProps {
  color: string;
  colorHex: string;
  rows: VariantGroupRow[];
  isSkuShown: boolean;
  form: ProductFormState;
}

const emptyFill = { price: "", compareAtPrice: "", stockQuantity: "" };

/** One color of a product: the swatch and name edited once, its sizes listed underneath. */
export const VariantColorGroup = ({ color, colorHex, rows, isSkuShown, form }: VariantColorGroupProps) => {
  const [fill, setFill] = useState(emptyFill);

  const prices = rows.map((r) => r.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const totalStock = rows.reduce((sum, r) => sum + r.stockQuantity, 0);

  const onApplyFill = () => {
    const patch: Record<string, number | null> = {};
    if (fill.price !== "") patch.price = Number(fill.price);
    if (fill.compareAtPrice !== "") patch.compareAtPrice = Number(fill.compareAtPrice) || null;
    if (fill.stockQuantity !== "") patch.stockQuantity = Number(fill.stockQuantity);
    if (Object.keys(patch).length === 0) return;
    form.onGroupChange(color, patch);
    setFill(emptyFill);
  };

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white shadow-xs">
      {/* Header: the color itself, edited once for every size below */}
      <div className="flex flex-wrap items-center gap-2.5 border-b border-slate-100 p-3.5">
        <input
          type="color"
          value={colorHex || "#FFFFFF"}
          onChange={(e) => form.onGroupChange(color, { colorHex: e.target.value.toUpperCase() })}
          aria-label={`Mã màu của ${color || "nhóm chưa đặt tên"}`}
          title={colorHex || "Chưa đặt mã màu"}
          className="h-9 w-9 flex-shrink-0 cursor-pointer rounded-xl border border-slate-200 bg-white p-0.5"
        />
        <input
          value={color}
          onChange={(e) => form.onGroupChange(color, { color: e.target.value })}
          placeholder="Tên màu, VD: Đen"
          aria-label="Tên màu"
          className="w-40 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold focus:border-brand-forest focus:outline-none"
          style={colorHex ? { backgroundColor: colorHex, color: textColorOn(colorHex) } : undefined}
        />
        <span className="text-[11px] font-semibold text-slate-500">
          {rows.length} size · {minPrice === maxPrice ? formatVND(minPrice) : `${formatVND(minPrice)} – ${formatVND(maxPrice)}`} ·{" "}
          {totalStock} cái
        </span>
        <button
          type="button"
          onClick={() => form.onRemoveGroup(color)}
          className="ml-auto inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-[11px] font-bold text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
          title={`Xóa toàn bộ ${rows.length} biến thể màu này`}
        >
          <Trash2 size={14} /> Xóa màu
        </button>
      </div>

      {/* Fill once instead of retyping the same number on every size */}
      <div className="flex flex-wrap items-end gap-2 border-b border-slate-100 bg-slate-50/60 px-3.5 py-2.5">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Điền nhanh</span>
        {(
          [
            ["price", "Giá bán"],
            ["compareAtPrice", "Giá niêm yết"],
            ["stockQuantity", "Tồn kho"],
          ] as const
        ).map(([key, label]) => (
          <label key={key} className="flex flex-col gap-1">
            <span className="text-[10px] font-semibold text-slate-400">{label}</span>
            <input
              type="number"
              value={fill[key]}
              onChange={(e) => setFill((prev) => ({ ...prev, [key]: e.target.value }))}
              placeholder="—"
              className="w-28 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs focus:border-brand-forest focus:outline-none"
            />
          </label>
        ))}
        <button
          type="button"
          onClick={onApplyFill}
          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-bold text-ink hover:border-brand-forest hover:text-brand-forest transition-colors"
        >
          Áp dụng cho {rows.length} size
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="border-b border-slate-100 text-left text-[10px] uppercase tracking-wider text-slate-400">
            <tr>
              <th className="px-3.5 py-2 font-bold">Size</th>
              <th className="px-3.5 py-2 font-bold">Giá bán</th>
              <th className="px-3.5 py-2 font-bold">Giá niêm yết</th>
              <th className="px-3.5 py-2 font-bold">Tồn kho</th>
              {isSkuShown && <th className="px-3.5 py-2 font-bold">SKU</th>}
              <th className="px-3.5 py-2" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row) => {
              const discount =
                row.compareAtPrice && row.compareAtPrice > row.price
                  ? Math.round((1 - row.price / row.compareAtPrice) * 100)
                  : null;

              return (
                <tr key={row.index} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-3 py-2">
                    <input
                      value={row.size}
                      onChange={(e) => form.onVariantChange(row.index, { size: e.target.value })}
                      aria-label="Kích cỡ"
                      placeholder="VD: M"
                      className={`${cellClass} w-20 font-bold`}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      value={row.price}
                      onChange={(e) => form.onVariantChange(row.index, { price: Number(e.target.value) })}
                      required
                      aria-label={`Giá bán size ${row.size || "chưa đặt"}`}
                      className={`${cellClass} w-28 font-bold text-slate-900`}
                    />
                    <div className="mt-0.5 text-[10px] font-semibold text-brand-forest">{formatVND(row.price)}</div>
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      value={row.compareAtPrice ?? ""}
                      onChange={(e) =>
                        form.onVariantChange(row.index, {
                          compareAtPrice: e.target.value ? Number(e.target.value) : null,
                        })
                      }
                      placeholder="Giá gốc…"
                      aria-label={`Giá niêm yết size ${row.size || "chưa đặt"}`}
                      className={`${cellClass} w-28`}
                    />
                    {row.compareAtPrice ? (
                      <div className="mt-0.5 flex items-center gap-1.5">
                        <span className="text-[10px] text-slate-400 line-through">{formatVND(row.compareAtPrice)}</span>
                        {discount ? (
                          <span className="rounded-full border border-rose-200/60 bg-rose-50 px-1.5 text-[9px] font-bold text-rose-600">
                            -{discount}%
                          </span>
                        ) : null}
                      </div>
                    ) : (
                      <div className="mt-0.5 text-[10px] italic text-slate-300">Không có giá gốc</div>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      value={row.stockQuantity}
                      onChange={(e) => form.onVariantChange(row.index, { stockQuantity: Number(e.target.value) })}
                      required
                      aria-label={`Tồn kho size ${row.size || "chưa đặt"}`}
                      className={`${cellClass} w-24 ${row.stockQuantity <= 5 ? "font-bold text-sale" : ""}`}
                    />
                    <div className="mt-0.5 text-[10px] text-slate-400">
                      {row.stockQuantity <= 0 ? (
                        <span className="font-bold text-rose-600">Hết hàng</span>
                      ) : row.stockQuantity <= 5 ? (
                        <span className="font-semibold text-amber-600">Sắp hết</span>
                      ) : (
                        <span>Sẵn hàng</span>
                      )}
                    </div>
                  </td>
                  {isSkuShown && (
                    <td className="px-3 py-2">
                      <input
                        value={row.sku}
                        onChange={(e) => form.onVariantChange(row.index, { sku: e.target.value })}
                        aria-label="Mã SKU"
                        placeholder="Tự sinh khi lưu"
                        className={`${cellClass} min-w-[200px] font-mono`}
                      />
                    </td>
                  )}
                  <td className="px-3 py-2 text-right">
                    <button
                      type="button"
                      onClick={() => form.onRemoveVariant(row.index)}
                      className="rounded-lg p-1.5 text-slate-300 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                      title="Xóa size này"
                      aria-label={`Xóa size ${row.size || "chưa đặt"} của màu ${color || "chưa đặt tên"}`}
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <button
        type="button"
        onClick={() => form.onAddVariantToGroup(color, colorHex)}
        className="flex w-full items-center justify-center gap-1.5 rounded-b-2xl border-t border-slate-100 py-2.5 text-[11px] font-bold text-slate-500 hover:bg-slate-50 hover:text-brand-forest transition-colors"
      >
        <Plus size={13} /> Thêm size cho màu này
      </button>
    </div>
  );
};
