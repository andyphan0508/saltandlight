"use client";

import { useState } from "react";
import { Button } from "@saltandlight/ui";
import { X, Plus, Trash2 } from "@/components/Icons";
import { toast } from "sonner";
import { BLOCK_TYPE_LABELS, BLOCK_ICON_KEYS, type PageBlockTypeValue } from "@/lib/page-block-types";
import type { PageBlockItem } from "./BlockList";

function defaultContent(type: PageBlockTypeValue): Record<string, any> {
  switch (type) {
    case "FEATURE_CARDS":
      return { style: "row", items: [{ icon: "Sparkles", title: "", description: "" }] };
    case "FEATURED_PRODUCTS":
      return { eyebrow: "", headline: "", ctaLabel: "Xem tất cả sản phẩm", ctaHref: "/san-pham", count: 8 };
    case "STORY_BANNER":
      return { icon: "CrossIcon", quote: "", quoteRef: "", body: "", ctaLabel: "", ctaHref: "" };
    case "PROMO_CTA":
      return { badge: "", icon: "Gift", headline: "", body: "", bullets: [], ctaLabel: "", ctaHref: "" };
    case "TESTIMONIALS":
      return { eyebrow: "", headline: "", items: [{ name: "", role: "", rating: 5, product: "", comment: "" }] };
    case "PAGE_HERO":
      return { icon: "", eyebrow: "", title: "", subtitle: "", quote: "", quoteRef: "" };
    case "RICH_TEXT_SECTIONS":
      return { sections: [{ heading: "", paragraphs: [], bullets: [], cards: [] }] };
    case "CONTACT_INFO":
      return { items: [{ icon: "Phone", label: "", value: "", note: "" }], quote: "", quoteRef: "" };
    case "CTA_BANNER":
      return { headline: "", buttons: [{ label: "", href: "", variant: "primary" }] };
  }
}

export function BlockEditForm({
  page,
  block,
  defaultType,
  onClose,
  onSaved,
}: {
  page: string;
  block: PageBlockItem | null;
  defaultType: PageBlockTypeValue;
  onClose: () => void;
  onSaved: (block: PageBlockItem) => void;
}) {
  const type = block?.type ?? defaultType;
  const [content, setContent] = useState<Record<string, any>>(block?.content ?? defaultContent(type));
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set(patch: Record<string, any>) {
    setContent((prev) => ({ ...prev, ...patch }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    try {
      const url = block ? `/api/admin/page-blocks/${block.id}` : "/api/admin/page-blocks";
      const method = block ? "PATCH" : "POST";
      const body = block ? { content } : { page, type, content };
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Lưu thất bại");
      toast.success(block ? "Cập nhật block thành công!" : "Tạo block mới thành công!");
      onSaved(data.block);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Có lỗi xảy ra";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden my-8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <h3 className="font-bold text-slate-900 text-sm">
            {block ? "Chỉnh sửa" : "Thêm"} — {BLOCK_TYPE_LABELS[type]}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              {error}
            </div>
          )}

          <ContentFields type={type} content={content} set={set} />

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={onClose} className="rounded-xl px-4 py-2 text-xs font-semibold">
              Hủy bỏ
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
              className="rounded-xl px-5 py-2 text-xs font-bold !bg-brand-forest hover:!bg-brand-forest/90 !text-white shadow-xs"
            >
              {isSaving ? "Đang lưu..." : block ? "Cập nhật" : "Tạo block"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ContentFields({
  type,
  content,
  set,
}: {
  type: PageBlockTypeValue;
  content: Record<string, any>;
  set: (patch: Record<string, any>) => void;
}) {
  switch (type) {
    case "FEATURE_CARDS":
      return (
        <>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Kiểu hiển thị</label>
            <select
              value={content.style || "row"}
              onChange={(e) => set({ style: e.target.value })}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm bg-white focus:border-brand-forest focus:outline-none"
            >
              <option value="row">Hàng ngang trong 1 khung chung (VD: dải tiện ích trang chủ)</option>
              <option value="card">Card đứng riêng lẻ (VD: card chính sách, giới thiệu)</option>
              <option value="numbered">Card đánh số trong khung nền (VD: giá trị cốt lõi)</option>
            </select>
          </div>
          <TextField label="Tiêu đề (tùy chọn)" value={content.headline || ""} onChange={(v) => set({ headline: v })} />
          <TextField label="Mô tả phụ (tùy chọn)" value={content.subtitle || ""} onChange={(v) => set({ subtitle: v })} />
          <ArrayEditor
            label="Danh sách thẻ"
            items={content.items || []}
            onChange={(items) => set({ items })}
            newItem={() => ({ icon: "Sparkles", number: "", title: "", description: "" }) as Record<string, any>}
            renderItem={(item, update) => (
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <IconSelect label="Icon" value={item.icon || ""} onChange={(v) => update({ icon: v })} />
                  <TextField label="Số thứ tự (VD: 01.)" value={item.number || ""} onChange={(v) => update({ number: v })} />
                </div>
                <TextField label="Tiêu đề" value={item.title || ""} onChange={(v) => update({ title: v })} required />
                <TextField label="Mô tả" value={item.description || ""} onChange={(v) => update({ description: v })} multiline required />
              </div>
            )}
          />
        </>
      );

    case "FEATURED_PRODUCTS":
      return (
        <>
          <TextField label="Nhãn nhỏ phía trên" value={content.eyebrow || ""} onChange={(v) => set({ eyebrow: v })} />
          <TextField label="Tiêu đề" value={content.headline || ""} onChange={(v) => set({ headline: v })} required />
          <div className="grid grid-cols-2 gap-3">
            <TextField label="Nhãn nút" value={content.ctaLabel || ""} onChange={(v) => set({ ctaLabel: v })} required />
            <TextField label="Đường dẫn nút" value={content.ctaHref || ""} onChange={(v) => set({ ctaHref: v })} required />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Số sản phẩm hiển thị</label>
            <input
              type="number"
              min={1}
              max={24}
              value={content.count ?? 8}
              onChange={(e) => set({ count: Number(e.target.value) })}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm focus:border-brand-forest focus:outline-none"
            />
          </div>
        </>
      );

    case "STORY_BANNER":
      return (
        <>
          <IconSelect label="Icon" value={content.icon || ""} onChange={(v) => set({ icon: v })} />
          <TextField label="Câu trích dẫn" value={content.quote || ""} onChange={(v) => set({ quote: v })} multiline required />
          <TextField label="Nguồn trích dẫn (VD: Ma-thi-ơ 5:13-14)" value={content.quoteRef || ""} onChange={(v) => set({ quoteRef: v })} />
          <TextField label="Nội dung" value={content.body || ""} onChange={(v) => set({ body: v })} multiline required />
          <div className="grid grid-cols-2 gap-3">
            <TextField label="Nhãn nút (tùy chọn)" value={content.ctaLabel || ""} onChange={(v) => set({ ctaLabel: v })} />
            <TextField label="Đường dẫn nút" value={content.ctaHref || ""} onChange={(v) => set({ ctaHref: v })} />
          </div>
        </>
      );

    case "PROMO_CTA":
      return (
        <>
          <div className="grid grid-cols-2 gap-3">
            <TextField label="Nhãn huy hiệu (badge)" value={content.badge || ""} onChange={(v) => set({ badge: v })} />
            <IconSelect label="Icon" value={content.icon || ""} onChange={(v) => set({ icon: v })} />
          </div>
          <TextField label="Tiêu đề" value={content.headline || ""} onChange={(v) => set({ headline: v })} required />
          <TextField label="Nội dung" value={content.body || ""} onChange={(v) => set({ body: v })} multiline required />
          <StringListEditor
            label="Danh sách gạch đầu dòng"
            values={content.bullets || []}
            onChange={(v) => set({ bullets: v })}
            placeholder="VD: Hỗ trợ thiết kế demo miễn phí"
          />
          <div className="grid grid-cols-2 gap-3">
            <TextField label="Nhãn nút" value={content.ctaLabel || ""} onChange={(v) => set({ ctaLabel: v })} required />
            <TextField label="Đường dẫn nút" value={content.ctaHref || ""} onChange={(v) => set({ ctaHref: v })} required />
          </div>
        </>
      );

    case "TESTIMONIALS":
      return (
        <>
          <TextField label="Nhãn nhỏ phía trên" value={content.eyebrow || ""} onChange={(v) => set({ eyebrow: v })} />
          <TextField label="Tiêu đề" value={content.headline || ""} onChange={(v) => set({ headline: v })} required />
          <ArrayEditor
            label="Đánh giá"
            items={content.items || []}
            onChange={(items) => set({ items })}
            newItem={() => ({ name: "", role: "", rating: 5, product: "", comment: "" })}
            renderItem={(item, update) => (
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <TextField label="Tên khách hàng" value={item.name || ""} onChange={(v) => update({ name: v })} required />
                  <TextField label="Vai trò / địa điểm" value={item.role || ""} onChange={(v) => update({ role: v })} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <TextField label="Sản phẩm đã mua" value={item.product || ""} onChange={(v) => update({ product: v })} />
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Số sao (1-5)</label>
                    <input
                      type="number"
                      min={1}
                      max={5}
                      value={item.rating ?? 5}
                      onChange={(e) => update({ rating: Number(e.target.value) })}
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm focus:border-brand-forest focus:outline-none"
                    />
                  </div>
                </div>
                <TextField label="Nội dung đánh giá" value={item.comment || ""} onChange={(v) => update({ comment: v })} multiline required />
              </div>
            )}
          />
        </>
      );

    case "PAGE_HERO":
      return (
        <>
          <div className="grid grid-cols-2 gap-3">
            <IconSelect label="Icon (tùy chọn)" value={content.icon || ""} onChange={(v) => set({ icon: v })} />
            <TextField label="Nhãn nhỏ phía trên" value={content.eyebrow || ""} onChange={(v) => set({ eyebrow: v })} />
          </div>
          <TextField label="Tiêu đề" value={content.title || ""} onChange={(v) => set({ title: v })} required />
          <TextField label="Mô tả phụ" value={content.subtitle || ""} onChange={(v) => set({ subtitle: v })} multiline />
          <TextField label="Câu trích dẫn (tùy chọn)" value={content.quote || ""} onChange={(v) => set({ quote: v })} multiline />
          <TextField label="Nguồn trích dẫn" value={content.quoteRef || ""} onChange={(v) => set({ quoteRef: v })} />
        </>
      );

    case "RICH_TEXT_SECTIONS":
      return (
        <ArrayEditor
          label="Các mục nội dung"
          items={content.sections || []}
          onChange={(sections) => set({ sections })}
          newItem={() => ({ heading: "", paragraphs: [], bullets: [], cards: [] }) as Record<string, any>}
          renderItem={(section, update) => (
            <div className="space-y-3">
              <TextField label="Tiêu đề mục" value={section.heading || ""} onChange={(v) => update({ heading: v })} required />
              <StringListEditor label="Đoạn văn" values={section.paragraphs || []} onChange={(v) => update({ paragraphs: v })} />
              <StringListEditor label="Gạch đầu dòng" values={section.bullets || []} onChange={(v) => update({ bullets: v })} />
              <ArrayEditor
                label="Thẻ nhỏ (tùy chọn)"
                items={section.cards || []}
                onChange={(cards) => update({ cards })}
                newItem={() => ({ title: "", description: "" })}
                renderItem={(card, updateCard) => (
                  <div className="grid grid-cols-2 gap-2">
                    <TextField label="Tiêu đề thẻ" value={card.title || ""} onChange={(v) => updateCard({ title: v })} />
                    <TextField label="Mô tả thẻ" value={card.description || ""} onChange={(v) => updateCard({ description: v })} />
                  </div>
                )}
              />
            </div>
          )}
        />
      );

    case "CONTACT_INFO":
      return (
        <>
          <ArrayEditor
            label="Thông tin liên hệ"
            items={content.items || []}
            onChange={(items) => set({ items })}
            newItem={() => ({ icon: "Phone", label: "", value: "", note: "" })}
            renderItem={(item, update) => (
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <IconSelect label="Icon" value={item.icon || ""} onChange={(v) => update({ icon: v })} />
                  <TextField label="Nhãn" value={item.label || ""} onChange={(v) => update({ label: v })} required />
                </div>
                <TextField label="Giá trị" value={item.value || ""} onChange={(v) => update({ value: v })} required />
                <TextField label="Ghi chú (tùy chọn)" value={item.note || ""} onChange={(v) => update({ note: v })} />
              </div>
            )}
          />
          <TextField label="Câu trích dẫn (tùy chọn)" value={content.quote || ""} onChange={(v) => set({ quote: v })} multiline />
          <TextField label="Nguồn trích dẫn" value={content.quoteRef || ""} onChange={(v) => set({ quoteRef: v })} />
        </>
      );

    case "CTA_BANNER":
      return (
        <>
          <TextField label="Tiêu đề" value={content.headline || ""} onChange={(v) => set({ headline: v })} required />
          <ArrayEditor
            label="Nút bấm"
            items={content.buttons || []}
            onChange={(buttons) => set({ buttons })}
            newItem={() => ({ label: "", href: "", variant: "primary" })}
            renderItem={(btn, update) => (
              <div className="grid grid-cols-3 gap-2">
                <TextField label="Nhãn" value={btn.label || ""} onChange={(v) => update({ label: v })} required />
                <TextField label="Đường dẫn" value={btn.href || ""} onChange={(v) => update({ href: v })} required />
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Kiểu</label>
                  <select
                    value={btn.variant || "primary"}
                    onChange={(e) => update({ variant: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm bg-white focus:border-brand-forest focus:outline-none"
                  >
                    <option value="primary">Chính (primary)</option>
                    <option value="outline">Viền (outline)</option>
                  </select>
                </div>
              </div>
            )}
          />
        </>
      );
  }
}

function TextField({
  label,
  value,
  onChange,
  multiline,
  placeholder,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs font-bold text-slate-700 mb-1">
        {label}
        {required && <span className="text-rose-500"> *</span>}
      </label>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
          className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm focus:border-brand-forest focus:outline-none"
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm focus:border-brand-forest focus:outline-none"
        />
      )}
    </div>
  );
}

function IconSelect({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-xs font-bold text-slate-700 mb-1">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm focus:border-brand-forest focus:outline-none bg-white"
      >
        <option value="">— Không chọn —</option>
        {BLOCK_ICON_KEYS.map((k) => (
          <option key={k} value={k}>
            {k}
          </option>
        ))}
      </select>
    </div>
  );
}

function StringListEditor({
  label,
  values,
  onChange,
  placeholder,
}: {
  label: string;
  values: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
}) {
  function update(i: number, v: string) {
    onChange(values.map((x, idx) => (idx === i ? v : x)));
  }
  function remove(i: number) {
    onChange(values.filter((_, idx) => idx !== i));
  }
  function add() {
    onChange([...values, ""]);
  }
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="block text-xs font-bold text-slate-700">{label}</label>
        <button type="button" onClick={add} className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-forest hover:underline">
          <Plus size={12} /> Thêm dòng
        </button>
      </div>
      <div className="space-y-2">
        {values.map((v, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              value={v}
              onChange={(e) => update(i, e.target.value)}
              placeholder={placeholder}
              className="flex-1 rounded-xl border border-slate-200 px-3 py-1.5 text-xs focus:border-brand-forest focus:outline-none"
            />
            <button type="button" onClick={() => remove(i)} className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50">
              <Trash2 size={13} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function ArrayEditor<T extends Record<string, any>>({
  label,
  items,
  onChange,
  newItem,
  renderItem,
}: {
  label: string;
  items: T[];
  onChange: (items: T[]) => void;
  newItem: () => T;
  renderItem: (item: T, update: (patch: Partial<T>) => void, index: number) => React.ReactNode;
}) {
  function update(index: number, patch: Partial<T>) {
    onChange(items.map((it, i) => (i === index ? { ...it, ...patch } : it)));
  }
  function remove(index: number) {
    onChange(items.filter((_, i) => i !== index));
  }
  function add() {
    onChange([...items, newItem()]);
  }
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="block text-xs font-bold text-slate-700">{label}</label>
        <button type="button" onClick={add} className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-forest hover:underline">
          <Plus size={12} /> Thêm mục
        </button>
      </div>
      <div className="space-y-3">
        {items.map((item, i) => (
          <div key={i} className="relative rounded-xl border border-slate-200 p-3 bg-slate-50/50">
            <button
              type="button"
              onClick={() => remove(i)}
              className="absolute top-2 right-2 p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
            >
              <Trash2 size={13} />
            </button>
            {renderItem(item, (patch) => update(i, patch), i)}
          </div>
        ))}
        {items.length === 0 && <p className="text-[11px] text-slate-400 italic">Chưa có mục nào.</p>}
      </div>
    </div>
  );
}
