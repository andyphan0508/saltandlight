"use client";

import { TextField, ArrayEditor } from "@/components/admin/form-fields";
import type { GuideLayout, ProductGuide, ProductGuideItem } from "@/lib/product-guides";

export interface CategoryOption {
  id: string;
  name: string;
}

export const LAYOUT_LABELS: Record<GuideLayout, string> = {
  cards: "Thẻ có biểu tượng",
  list: "Danh sách gạch đầu dòng",
  table: "Bảng 2 cột",
};

const LAYOUT_HINTS: Record<GuideLayout, string> = {
  cards: "Hợp với hướng dẫn giặt, bảo quản, sử dụng.",
  list: "Hợp với điểm nổi bật của dòng sản phẩm.",
  table: "Hợp với bảng size — trang sản phẩm có thêm nút “Bảng size” cạnh ô chọn size.",
};

const selectClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm focus:border-brand-forest focus:outline-none";

/** Form for one guide: details, target categories and content rows. */
export function GuideEditor({
  guide,
  categories,
  onChange,
}: {
  guide: ProductGuide;
  categories: CategoryOption[];
  onChange: (patch: Partial<ProductGuide>) => void;
}) {
  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2">
        <TextField
          label="Tiêu đề"
          required
          value={guide.title}
          onChange={(title) => onChange({ title })}
          placeholder="VD: Hướng dẫn giặt & bảo quản áo"
        />
        <TextField
          label="Mô tả ngắn"
          value={guide.subtitle}
          onChange={(subtitle) => onChange({ subtitle })}
          placeholder="Không bắt buộc"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-bold text-slate-700">Kiểu hiển thị</label>
          <select
            value={guide.layout}
            onChange={(e) => onChange({ layout: e.target.value as GuideLayout })}
            className={selectClass}
          >
            {(Object.keys(LAYOUT_LABELS) as GuideLayout[]).map((layout) => (
              <option key={layout} value={layout}>
                {LAYOUT_LABELS[layout]}
              </option>
            ))}
          </select>
          <p className="mt-1 text-[11px] text-slate-500">{LAYOUT_HINTS[guide.layout]}</p>
        </div>
        <label className="flex cursor-pointer items-center gap-2 self-start text-sm font-semibold text-slate-700 sm:mt-7">
          <input
            type="checkbox"
            checked={guide.isActive}
            onChange={(e) => onChange({ isActive: e.target.checked })}
            className="h-4 w-4 rounded accent-brand-forest"
          />
          Hiển thị trên trang sản phẩm
        </label>
      </div>

      <CategoryChecklist
        categories={categories}
        selectedIds={guide.categoryIds}
        onChange={(categoryIds) => onChange({ categoryIds })}
      />

      <ArrayEditor<ProductGuideItem>
        label="Nội dung"
        items={guide.items}
        onChange={(items) => onChange({ items })}
        newItem={() => ({ icon: guide.layout === "cards" ? "✨" : "", title: "", content: "" })}
        renderItem={(item, update) => <GuideItemFields layout={guide.layout} item={item} update={update} />}
      />
    </div>
  );
}

function CategoryChecklist({
  categories,
  selectedIds,
  onChange,
}: {
  categories: CategoryOption[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}) {
  function toggle(id: string, checked: boolean) {
    onChange(checked ? [...selectedIds, id] : selectedIds.filter((selected) => selected !== id));
  }

  return (
    <fieldset>
      <legend className="mb-1 block text-xs font-bold text-slate-700">Áp dụng cho danh mục</legend>
      <p className="mb-2 text-[11px] text-slate-500">
        Mọi sản phẩm thuộc danh mục được chọn (kể cả danh mục con) sẽ hiển thị hướng dẫn này.
      </p>
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => {
          const checked = selectedIds.includes(category.id);
          return (
            <label
              key={category.id}
              className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-colors ${
                checked
                  ? "border-brand-forest bg-mint-50 text-brand-forest"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
              }`}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={(e) => toggle(category.id, e.target.checked)}
                className="h-3.5 w-3.5 accent-brand-forest"
              />
              {category.name}
            </label>
          );
        })}
        {categories.length === 0 && <p className="text-[11px] italic text-slate-400">Chưa có danh mục nào.</p>}
      </div>
    </fieldset>
  );
}

/** Row fields differ by layout: list uses content only, table uses title/content as its two columns. */
function GuideItemFields({
  layout,
  item,
  update,
}: {
  layout: GuideLayout;
  item: ProductGuideItem;
  update: (patch: Partial<ProductGuideItem>) => void;
}) {
  if (layout === "list") {
    return (
      <div className="pr-6">
        <TextField
          label="Ý chính"
          value={item.content}
          onChange={(content) => update({ content })}
          placeholder="VD: Chất liệu 100% Cotton thoáng mát"
        />
      </div>
    );
  }

  if (layout === "table") {
    return (
      <div className="grid grid-cols-1 gap-2 pr-6 sm:grid-cols-[1fr_2fr]">
        <TextField label="Cột trái" value={item.title} onChange={(title) => update({ title })} placeholder="VD: Size M" />
        <TextField
          label="Cột phải"
          value={item.content}
          onChange={(content) => update({ content })}
          placeholder="VD: 1m60 - 1m70 | 53 - 62 kg"
        />
      </div>
    );
  }

  return (
    <div className="space-y-2 pr-6">
      <div className="grid grid-cols-[5rem_1fr] gap-2">
        <TextField label="Biểu tượng" value={item.icon} onChange={(icon) => update({ icon })} placeholder="🧼" />
        <TextField
          label="Tiêu đề"
          value={item.title}
          onChange={(title) => update({ title })}
          placeholder="VD: Giặt áo đúng cách"
        />
      </div>
      <TextField label="Nội dung" multiline value={item.content} onChange={(content) => update({ content })} />
    </div>
  );
}
