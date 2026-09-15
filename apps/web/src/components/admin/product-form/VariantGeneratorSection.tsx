"use client";

import { Button } from "@saltandlight/ui";
import type { ProductFormState } from "@/hooks/use-product-form";
import { Field, Section } from "../form-fields";
import { Plus, Tag } from "../Icons";
import { inputClass } from "./classes";

/** Generates one variant per color × size with a shared price and stock. */
export const VariantGeneratorSection = ({ form }: { form: ProductFormState }) => (
  <Section title="Tạo nhanh biến thể" icon={<Tag size={16} />}>
    <p className="text-xs text-ink/45">
      Nhập danh sách màu và size (cách nhau bằng dấu phẩy) để tự sinh toàn bộ tổ hợp biến thể. Size được tự động đảo ngược và
      sắp xếp chuẩn từ nhỏ đến lớn.
    </p>
    <div className="mt-3 grid gap-3 sm:grid-cols-4">
      <Field label="Màu sắc" className="sm:col-span-1">
        <input
          value={form.quickColors}
          onChange={(e) => form.setQuickColors(e.target.value)}
          placeholder="Đen, Trắng"
          className={inputClass}
        />
      </Field>
      <Field label="Size (thứ tự nhỏ đến lớn)" className="sm:col-span-1">
        <input
          value={form.quickSizes}
          onChange={(e) => form.setQuickSizes(e.target.value)}
          placeholder="XS, S, M, L, XL"
          className={inputClass}
        />
      </Field>
      <Field label="Giá bán" className="sm:col-span-1">
        <input
          type="number"
          value={form.quickPrice}
          onChange={(e) => form.setQuickPrice(Number(e.target.value))}
          className={inputClass}
        />
      </Field>
      <Field label="Tồn kho mỗi biến thể" className="sm:col-span-1">
        <input
          type="number"
          value={form.quickStock}
          onChange={(e) => form.setQuickStock(Number(e.target.value))}
          className={inputClass}
        />
      </Field>
    </div>
    <Button type="button" size="sm" className="mt-3" onClick={form.onGenerateVariants}>
      <Plus size={14} /> Tạo biến thể
    </Button>
  </Section>
);
