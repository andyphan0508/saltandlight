"use client";

import { useState } from "react";
import { Button } from "@saltandlight/ui";
import { groupVariantsByColor } from "@/helpers/variant-groups";
import type { ProductFormState } from "@/hooks/use-product-form";
import { Section } from "../form-fields";
import { Plus, Tag } from "../Icons";
import { VariantColorGroup } from "./VariantColorGroup";

/**
 * Variants grouped by color: the swatch and name are edited once per color
 * instead of once per row, and each color's sizes sit in their own small table.
 */
export const VariantsSection = ({ form }: { form: ProductFormState }) => {
  const [isSkuShown, setIsSkuShown] = useState(false);
  const groups = groupVariantsByColor(form.variants);

  return (
    <Section
      title="Bảng giá & Biến thể sản phẩm"
      icon={<Tag size={16} />}
      badge={`${groups.length} màu · ${form.variants.length} biến thể`}
      action={
        <div className="flex items-center gap-2">
          <label className="flex cursor-pointer items-center gap-1.5 text-[11px] font-bold text-slate-500">
            <input
              type="checkbox"
              checked={isSkuShown}
              onChange={(e) => setIsSkuShown(e.target.checked)}
              className="h-3.5 w-3.5 rounded border-slate-300 accent-brand-forest"
            />
            Hiện SKU
          </label>
          <Button type="button" size="sm" variant="outline" onClick={form.onAddVariant}>
            <Plus size={14} /> Thêm màu
          </Button>
        </div>
      }
    >
      <div className="space-y-3">
        {groups.map((group) => (
          <VariantColorGroup
            key={group.rows[0]!.index}
            color={group.color}
            colorHex={group.colorHex}
            rows={group.rows}
            isSkuShown={isSkuShown}
            form={form}
          />
        ))}
        {groups.length === 0 && (
          <p className="rounded-2xl border border-dashed border-slate-200 py-10 text-center text-xs text-slate-400">
            Chưa có biến thể nào. Dùng “Tạo nhanh biến thể” ở trên hoặc bấm “Thêm màu”.
          </p>
        )}
      </div>
    </Section>
  );
};
