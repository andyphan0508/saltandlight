"use client";

import { ArrayEditor, TextField } from "@/components/admin/form-fields";
import type { BlockFieldsProps } from "@/interfaces/page-block";

export const CtaBannerFields = ({ content, onPatch }: BlockFieldsProps) => (
  <>
    <TextField label="Tiêu đề lời kêu gọi mua sắm" value={content.headline || ""} onChange={(v) => onPatch({ headline: v })} required />
    <ArrayEditor
      label="Danh sách nút hành động"
      items={content.buttons || []}
      onChange={(buttons) => onPatch({ buttons })}
      newItem={() => ({ label: "", href: "", variant: "primary" })}
      renderItem={(button, onUpdate) => (
        <div className="grid grid-cols-3 gap-2">
          <TextField label="Chữ trên nút" value={button.label || ""} onChange={(v) => onUpdate({ label: v })} required />
          <TextField label="Đường dẫn khi bấm nút" value={button.href || ""} onChange={(v) => onUpdate({ href: v })} required />
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Kiểu dáng</label>
            <select
              value={button.variant || "primary"}
              onChange={(e) => onUpdate({ variant: e.target.value })}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm bg-white focus:border-brand-forest focus:outline-none"
            >
              <option value="primary">Nổi bật (Màu chủ đạo)</option>
              <option value="outline">Đường viền trang nhã</option>
            </select>
          </div>
        </div>
      )}
    />
  </>
);
