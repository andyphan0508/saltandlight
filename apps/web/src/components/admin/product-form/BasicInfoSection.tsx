"use client";

import { slugify } from "@/helpers/slugify";
import type { ProductFormState } from "@/hooks/use-product-form";
import type { ProductCategoryOption } from "@/interfaces/product-form";
import { Field, Section } from "../form-fields";
import { Package } from "../Icons";
import { ProductContentEditor } from "../ProductContentEditor";
import { CategoryMultiSelect } from "./CategoryMultiSelect";
import { inputClass } from "./classes";

interface BasicInfoSectionProps {
  form: ProductFormState;
  categories: ProductCategoryOption[];
}

export const BasicInfoSection = ({ form, categories }: BasicInfoSectionProps) => (
  <Section title="Thông tin cơ bản" icon={<Package size={16} />}>
    <div className="grid gap-5 md:grid-cols-2">
      <div className="md:col-span-2">
        <Field label="Tên sản phẩm" required>
          <input
            required
            value={form.name}
            onChange={(e) => form.onNameChange(e.target.value)}
            className={inputClass}
            placeholder="VD: Áo Thun FEARLESS"
          />
          <div className="mt-1 flex items-center justify-between text-[11px] text-ink/40 font-mono">
            <span>Đường dẫn xem sản phẩm: /san-pham/{form.slug || slugify(form.name) || "..."}</span>
            <span className="text-brand-forest font-sans font-semibold">✓ Tự động tạo</span>
          </div>
        </Field>
      </div>

      <div className="md:col-span-2">
        <CategoryMultiSelect
          categories={categories}
          selection={form.categorySelection}
          onToggle={form.onToggleCategory}
          onSetPrimary={form.onSetPrimaryCategory}
        />
      </div>
      <Field label="Trạng thái">
        <select
          value={form.status}
          onChange={(e) => form.setStatus(e.target.value as ProductFormState["status"])}
          className={inputClass}
        >
          <option value="draft">Nháp</option>
          <option value="published">Đang bán</option>
          <option value="archived">Lưu trữ</option>
        </select>
      </Field>
      <div className="md:col-span-2">
        <ProductContentEditor blocks={form.blocks} onChange={form.setBlocks} />
      </div>
      <div className="md:col-span-2 flex flex-wrap items-center gap-4 pt-1">
        <label className="flex items-center gap-2 text-sm text-ink/70 cursor-pointer">
          <input
            type="checkbox"
            checked={form.isNew}
            onChange={(e) => form.setIsNew(e.target.checked)}
            className="h-4 w-4 rounded accent-brand-forest"
          />
          Gắn nhãn &quot;NEW&quot; trên trang sản phẩm
        </label>

        <label className="flex items-center gap-2 text-xs sm:text-sm font-bold text-amber-900 bg-amber-50 border border-amber-200/80 px-3.5 py-1.5 rounded-xl cursor-pointer shadow-xs hover:bg-amber-100/70 transition-colors">
          <input
            type="checkbox"
            checked={form.isFeatured}
            onChange={(e) => form.setIsFeatured(e.target.checked)}
            className="h-4 w-4 rounded accent-amber-500"
          />
          <span>★ Sản phẩm nổi bật (Ưu tiên hiển thị trang chủ)</span>
        </label>
      </div>
    </div>
  </Section>
);
