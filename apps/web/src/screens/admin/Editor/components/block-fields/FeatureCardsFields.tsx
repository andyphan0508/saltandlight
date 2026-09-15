"use client";

import { ArrayEditor, IconSelect, TextField } from "@/components/admin/form-fields";
import type { BlockFieldsProps } from "@/interfaces/page-block";

export const FeatureCardsFields = ({ content, onPatch }: BlockFieldsProps) => (
  <>
    <div>
      <label className="block text-xs font-bold text-slate-700 mb-1">Kiểu hiển thị</label>
      <select
        value={content.style || "row"}
        onChange={(e) => onPatch({ style: e.target.value })}
        className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm bg-white focus:border-brand-forest focus:outline-none"
      >
        <option value="row">Hàng ngang liền khối (Dải tiện ích cam kết mua sắm)</option>
        <option value="card">Từng thẻ riêng lẻ (Chính sách nổi bật, giới thiệu)</option>
        <option value="numbered">Thẻ đánh số thứ tự (Giá trị cốt lõi, các bước)</option>
      </select>
    </div>
    <TextField label="Tiêu đề khối (Không bắt buộc)" value={content.headline || ""} onChange={(v) => onPatch({ headline: v })} />
    <TextField label="Đoạn giới thiệu ngắn (Không bắt buộc)" value={content.subtitle || ""} onChange={(v) => onPatch({ subtitle: v })} />
    <ArrayEditor
      label="Danh sách các mục nổi bật"
      items={content.items || []}
      onChange={(items) => onPatch({ items })}
      newItem={() => ({ icon: "Sparkles", number: "", title: "", description: "" }) as Record<string, any>}
      renderItem={(item, onUpdate) => (
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <IconSelect label="Biểu tượng (Icon)" value={item.icon || ""} onChange={(v) => onUpdate({ icon: v })} />
            <TextField label="Số thứ tự (Ví dụ: 01, 02...)" value={item.number || ""} onChange={(v) => onUpdate({ number: v })} />
          </div>
          <TextField label="Tiêu đề mục" value={item.title || ""} onChange={(v) => onUpdate({ title: v })} required />
          <TextField
            label="Nội dung mô tả chi tiết"
            value={item.description || ""}
            onChange={(v) => onUpdate({ description: v })}
            isMultiline
            required
          />
        </div>
      )}
    />
  </>
);
