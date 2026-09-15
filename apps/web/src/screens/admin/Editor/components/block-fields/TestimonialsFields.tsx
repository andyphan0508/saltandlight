"use client";

import { ArrayEditor, TextField } from "@/components/admin/form-fields";
import type { BlockFieldsProps } from "@/interfaces/page-block";

export const TestimonialsFields = ({ content, onPatch }: BlockFieldsProps) => (
  <>
    <TextField
      label="Dòng chữ nhỏ trên tiêu đề (Ví dụ: Khách hàng nói gì về chúng tôi)"
      value={content.eyebrow || ""}
      onChange={(v) => onPatch({ eyebrow: v })}
    />
    <TextField label="Tiêu đề chính" value={content.headline || ""} onChange={(v) => onPatch({ headline: v })} required />
    <ArrayEditor
      label="Danh sách cảm nhận của khách hàng"
      items={content.items || []}
      onChange={(items) => onPatch({ items })}
      newItem={() => ({ name: "", role: "", rating: 5, product: "", comment: "" })}
      renderItem={(item, onUpdate) => (
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <TextField label="Họ và tên khách hàng" value={item.name || ""} onChange={(v) => onUpdate({ name: v })} required />
            <TextField
              label="Nơi ở hoặc chức vụ (Ví dụ: Hà Nội, Hội thánh...)"
              value={item.role || ""}
              onChange={(v) => onUpdate({ role: v })}
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <TextField
              label="Sản phẩm khách đã mua (Không bắt buộc)"
              value={item.product || ""}
              onChange={(v) => onUpdate({ product: v })}
            />
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Đánh giá số sao (Từ 1 đến 5 sao)</label>
              <input
                type="number"
                min={1}
                max={5}
                value={item.rating ?? 5}
                onChange={(e) => onUpdate({ rating: Number(e.target.value) })}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm focus:border-brand-forest focus:outline-none"
              />
            </div>
          </div>
          <TextField
            label="Lời nhận xét chi tiết của khách hàng"
            value={item.comment || ""}
            onChange={(v) => onUpdate({ comment: v })}
            isMultiline
            required
          />
        </div>
      )}
    />
  </>
);
