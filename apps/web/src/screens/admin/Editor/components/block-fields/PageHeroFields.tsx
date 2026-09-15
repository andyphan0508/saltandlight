"use client";

import { IconSelect, TextField } from "@/components/admin/form-fields";
import type { BlockFieldsProps } from "@/interfaces/page-block";

export const PageHeroFields = ({ content, onPatch }: BlockFieldsProps) => (
  <>
    <div className="grid grid-cols-2 gap-3">
      <IconSelect label="Biểu tượng (Không bắt buộc)" value={content.icon || ""} onChange={(v) => onPatch({ icon: v })} />
      <TextField
        label="Dòng chữ nhỏ trên tiêu đề (Không bắt buộc)"
        value={content.eyebrow || ""}
        onChange={(v) => onPatch({ eyebrow: v })}
      />
    </div>
    <TextField label="Tiêu đề lớn của trang" value={content.title || ""} onChange={(v) => onPatch({ title: v })} required />
    <TextField label="Đoạn giới thiệu mở đầu" value={content.subtitle || ""} onChange={(v) => onPatch({ subtitle: v })} isMultiline />
    <TextField
      label="Câu trích dẫn ý nghĩa (Không bắt buộc)"
      value={content.quote || ""}
      onChange={(v) => onPatch({ quote: v })}
      isMultiline
    />
    <TextField label="Nguồn câu trích dẫn" value={content.quoteRef || ""} onChange={(v) => onPatch({ quoteRef: v })} />
  </>
);
