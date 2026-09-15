"use client";

import Image from "next/image";
import { Plus, Trash2 } from "./Icons";
import type { ProductContentBlock } from "@/helpers/product-content";

const inputClass =
  "w-full rounded-xl border border-slate-200 px-3 py-2 text-xs sm:text-sm text-slate-900 focus:border-brand-forest focus:outline-none";

/** Input fields for one description block, by block type. */
export const ProductBlockFields = ({
  block,
  onChange,
}: {
  block: ProductContentBlock;
  onChange: (patch: Partial<ProductContentBlock>) => void;
}) => {
  switch (block.type) {
    case "paragraph":
      return (
        <textarea
          rows={3}
          value={block.content}
          onChange={(e) => onChange({ content: e.target.value })}
          placeholder="Nhập nội dung đoạn văn mô tả..."
          className={`${inputClass} resize-y`}
        />
      );

    case "heading":
      return (
        <div className="flex flex-col sm:flex-row gap-2">
          <select
            value={block.level}
            onChange={(e) => onChange({ level: e.target.value === "3" ? 3 : 2 })}
            className="w-36 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 bg-white focus:outline-none"
          >
            <option value={2}>Tiêu đề lớn (H2)</option>
            <option value={3}>Tiêu đề nhỏ (H3)</option>
          </select>
          <input
            value={block.text}
            onChange={(e) => onChange({ text: e.target.value })}
            placeholder="VD: Ý nghĩa thiết kế"
            className={`${inputClass} flex-1 font-bold`}
          />
        </div>
      );

    case "bullet_list":
      return <BulletListFields items={block.items} onChange={(items) => onChange({ items })} />;

    case "quote":
      return (
        <div className="space-y-2">
          <textarea
            rows={2}
            value={block.quote}
            onChange={(e) => onChange({ quote: e.target.value })}
            placeholder="Nhập câu Kinh Thánh hoặc trích dẫn ý nghĩa..."
            className={`${inputClass} font-serif italic`}
          />
          <input
            value={block.quoteRef ?? ""}
            onChange={(e) => onChange({ quoteRef: e.target.value })}
            placeholder="Nguồn trích — VD: Ma-thi-ơ 5:13-14"
            className={`${inputClass} font-semibold text-brand-forest`}
          />
        </div>
      );

    case "image":
      return (
        <div className="space-y-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <input
              value={block.url}
              onChange={(e) => onChange({ url: e.target.value })}
              placeholder="Đường dẫn ảnh (https://...)"
              className={`${inputClass} font-mono`}
            />
            <input
              value={block.caption ?? ""}
              onChange={(e) => onChange({ caption: e.target.value })}
              placeholder="Chú thích ảnh (không bắt buộc)"
              className={inputClass}
            />
          </div>
          {block.url && (
            <div className="relative h-36 w-full max-w-sm rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
              <Image src={block.url} alt={block.caption || "Ảnh"} fill className="object-cover" />
            </div>
          )}
        </div>
      );

    default:
      return null;
  }
};

const BulletListFields = ({ items, onChange }: { items: string[]; onChange: (items: string[]) => void }) => {
  return (
    <div className="space-y-2">
      {items.map((item, idx) => (
        <div key={idx} className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-brand-forest flex-shrink-0" />
          <input
            value={item}
            onChange={(e) => onChange(items.map((it, i) => (i === idx ? e.target.value : it)))}
            placeholder={`Ý thứ ${idx + 1}...`}
            className={`${inputClass} py-1.5`}
          />
          <button
            type="button"
            aria-label="Xóa dòng"
            onClick={() => {
              const next = items.filter((_, i) => i !== idx);
              onChange(next.length ? next : [""]);
            }}
            className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
          >
            <Trash2 size={13} />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...items, ""])}
        className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-forest hover:underline pt-1"
      >
        <Plus size={13} /> Thêm dòng
      </button>
    </div>
  );
};
