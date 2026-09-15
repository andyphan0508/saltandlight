"use client";

import { ArrayEditor, IconSelect, TextField } from "@/components/admin/form-fields";
import type { BlockFieldsProps } from "@/interfaces/page-block";

export const ContactInfoFields = ({ content, onPatch }: BlockFieldsProps) => (
  <>
    <ArrayEditor
      label="Danh sách thông tin liên hệ"
      items={content.items || []}
      onChange={(items) => onPatch({ items })}
      newItem={() => ({ icon: "Phone", label: "", value: "", note: "" })}
      renderItem={(item, onUpdate) => (
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <IconSelect label="Biểu tượng (Icon)" value={item.icon || ""} onChange={(v) => onUpdate({ icon: v })} />
            <TextField
              label="Tên thông tin (Ví dụ: Hotline, Email, Zalo, Địa chỉ)"
              value={item.label || ""}
              onChange={(v) => onUpdate({ label: v })}
              required
            />
          </div>
          <TextField
            label="Nội dung hiển thị (Ví dụ: 0912 345 678, info@...)"
            value={item.value || ""}
            onChange={(v) => onUpdate({ value: v })}
            required
          />
          <TextField label="Ghi chú thêm (Ví dụ: Hỗ trợ 24/7)" value={item.note || ""} onChange={(v) => onUpdate({ note: v })} />
        </div>
      )}
    />
    <TextField
      label="Câu châm ngôn / Lời Chúa (Không bắt buộc)"
      value={content.quote || ""}
      onChange={(v) => onPatch({ quote: v })}
      isMultiline
    />
    <TextField label="Nguồn câu trích dẫn" value={content.quoteRef || ""} onChange={(v) => onPatch({ quoteRef: v })} />
  </>
);
