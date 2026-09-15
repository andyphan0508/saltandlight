"use client";

import { IconSelect, StringListEditor, TextField } from "@/components/admin/form-fields";
import type { BlockFieldsProps } from "@/interfaces/page-block";

export const PromoCtaFields = ({ content, onPatch }: BlockFieldsProps) => (
  <>
    <div className="grid grid-cols-2 gap-3">
      <TextField
        label="Huy hiệu nổi bật (Ví dụ: Ưu đãi đặc biệt, Đặt in theo yêu cầu)"
        value={content.badge || ""}
        onChange={(v) => onPatch({ badge: v })}
      />
      <IconSelect label="Biểu tượng (Icon)" value={content.icon || ""} onChange={(v) => onPatch({ icon: v })} />
    </div>
    <TextField label="Tiêu đề thông điệp" value={content.headline || ""} onChange={(v) => onPatch({ headline: v })} required />
    <TextField
      label="Nội dung mô tả chương trình"
      value={content.body || ""}
      onChange={(v) => onPatch({ body: v })}
      isMultiline
      required
    />
    <StringListEditor
      label="Các điểm nổi bật / Ưu đãi (Gạch đầu dòng)"
      values={content.bullets || []}
      onChange={(v) => onPatch({ bullets: v })}
      placeholder="Ví dụ: Hỗ trợ thiết kế demo miễn phí"
    />
    <div className="grid grid-cols-2 gap-3">
      <TextField label="Chữ trên nút bấm" value={content.ctaLabel || ""} onChange={(v) => onPatch({ ctaLabel: v })} required />
      <TextField label="Đường dẫn khi bấm nút" value={content.ctaHref || ""} onChange={(v) => onPatch({ ctaHref: v })} required />
    </div>
  </>
);
