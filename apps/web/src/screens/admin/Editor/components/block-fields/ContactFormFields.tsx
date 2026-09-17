"use client";

import { StringListEditor, TextField } from "@/components/admin/form-fields";
import type { BlockFieldsProps } from "@/interfaces/page-block";
import { ContactInfoFields } from "./ContactInfoFields";

const choiceClass = (isSelected: boolean) =>
  `rounded-lg border px-3 py-2 text-xs font-bold transition-all ${
    isSelected ? "border-brand-forest bg-brand-forest text-white" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
  }`;

const ASIDES = [
  { id: "none", label: "Chỉ có form" },
  { id: "checklist", label: "Kèm danh sách cam kết" },
  { id: "contact_info", label: "Kèm thông tin liên hệ" },
] as const;

export const ContactFormFields = ({ content, onPatch }: BlockFieldsProps) => {
  const aside = content.aside || "none";

  return (
    <>
      <TextField label="Tiêu đề của form" value={content.headline || ""} onChange={(v) => onPatch({ headline: v })} required />

      <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3.5 space-y-2">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">Khách gửi form này để</label>
        <div className="grid grid-cols-2 gap-2">
          <button type="button" onClick={() => onPatch({ formType: "contact" })} className={choiceClass(content.formType !== "custom_order")}>
            Liên hệ / hỏi đáp
          </button>
          <button type="button" onClick={() => onPatch({ formType: "custom_order" })} className={choiceClass(content.formType === "custom_order")}>
            Yêu cầu báo giá đặt may
          </button>
        </div>
        <p className="text-[11px] text-slate-500">Quyết định yêu cầu được xếp vào nhóm nào trong mục Yêu cầu liên hệ.</p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3.5 space-y-3">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">Cột bên cạnh form</label>
        <div className="grid grid-cols-3 gap-2">
          {ASIDES.map((option) => (
            <button key={option.id} type="button" onClick={() => onPatch({ aside: option.id })} className={choiceClass(aside === option.id)}>
              {option.label}
            </button>
          ))}
        </div>

        {aside === "checklist" && (
          <div className="space-y-3 border-t border-slate-200/80 pt-3">
            <TextField label="Tiêu đề cột" value={content.asideTitle || ""} onChange={(v) => onPatch({ asideTitle: v })} />
            <StringListEditor
              label="Các dòng cam kết"
              values={content.asideItems || []}
              onChange={(asideItems) => onPatch({ asideItems })}
              placeholder="VD: Thiết kế demo miễn phí"
            />
            <label className="flex items-center gap-2 text-xs font-bold text-slate-700">
              <input
                type="checkbox"
                checked={Boolean(content.isHotlineShown)}
                onChange={(e) => onPatch({ isHotlineShown: e.target.checked })}
                className="h-4 w-4 rounded accent-brand-forest"
              />
              Hiện dòng &quot;Tư vấn trực tiếp&quot; kèm số hotline
            </label>
            <p className="text-[11px] text-slate-500">Số hotline lấy từ Cài đặt › Liên hệ, không cần gõ lại ở đây.</p>
          </div>
        )}

        {aside === "contact_info" && (
          <div className="space-y-3 border-t border-slate-200/80 pt-3">
            <ContactInfoFields
              content={{ items: content.contactItems || [], quote: content.quote, quoteRef: content.quoteRef }}
              onPatch={({ items, ...rest }) => onPatch({ ...rest, ...(items !== undefined ? { contactItems: items } : {}) })}
            />
          </div>
        )}
      </div>
    </>
  );
};
