"use client";

import { IconSelect, TextField } from "@/components/admin/form-fields";
import type { BlockFieldsProps } from "@/interfaces/page-block";

export const StoryBannerFields = ({ content, onPatch }: BlockFieldsProps) => (
  <>
    <IconSelect label="Biểu tượng (Icon)" value={content.icon || ""} onChange={(v) => onPatch({ icon: v })} />
    <TextField
      label="Câu trích dẫn hoặc thông điệp ý nghĩa"
      value={content.quote || ""}
      onChange={(v) => onPatch({ quote: v })}
      isMultiline
      required
    />
    <TextField
      label="Nguồn trích dẫn (Ví dụ: Ma-thi-ơ 5:13-14 hoặc Tác giả)"
      value={content.quoteRef || ""}
      onChange={(v) => onPatch({ quoteRef: v })}
    />
    <TextField
      label="Nội dung câu chuyện / Giới thiệu chi tiết"
      value={content.body || ""}
      onChange={(v) => onPatch({ body: v })}
      isMultiline
      required
    />
    <div className="grid grid-cols-2 gap-3">
      <TextField label="Chữ trên nút bấm (Không bắt buộc)" value={content.ctaLabel || ""} onChange={(v) => onPatch({ ctaLabel: v })} />
      <TextField label="Đường dẫn khi bấm nút (Ví dụ: /gioi-thieu)" value={content.ctaHref || ""} onChange={(v) => onPatch({ ctaHref: v })} />
    </div>
  </>
);
