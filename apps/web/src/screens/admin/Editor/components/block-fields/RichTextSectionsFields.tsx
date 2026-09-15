"use client";

import { ArrayEditor, StringListEditor, TextField } from "@/components/admin/form-fields";
import type { BlockFieldsProps } from "@/interfaces/page-block";

export const RichTextSectionsFields = ({ content, onPatch }: BlockFieldsProps) => (
  <ArrayEditor
    label="Danh sách các phần nội dung"
    items={content.sections || []}
    onChange={(sections) => onPatch({ sections })}
    newItem={() => ({ heading: "", paragraphs: [], bullets: [], cards: [] }) as Record<string, any>}
    renderItem={(section, onUpdate) => (
      <div className="space-y-3">
        <TextField label="Tiêu đề của phần này" value={section.heading || ""} onChange={(v) => onUpdate({ heading: v })} required />
        <StringListEditor label="Các đoạn văn bản" values={section.paragraphs || []} onChange={(v) => onUpdate({ paragraphs: v })} />
        <StringListEditor label="Các ý gạch đầu dòng" values={section.bullets || []} onChange={(v) => onUpdate({ bullets: v })} />
        <ArrayEditor
          label="Các ô thông tin phụ (Không bắt buộc)"
          items={section.cards || []}
          onChange={(cards) => onUpdate({ cards })}
          newItem={() => ({ title: "", description: "" })}
          renderItem={(card, onUpdateCard) => (
            <div className="grid grid-cols-2 gap-2">
              <TextField label="Tiêu đề ô" value={card.title || ""} onChange={(v) => onUpdateCard({ title: v })} />
              <TextField label="Mô tả ô" value={card.description || ""} onChange={(v) => onUpdateCard({ description: v })} />
            </div>
          )}
        />
      </div>
    )}
  />
);
