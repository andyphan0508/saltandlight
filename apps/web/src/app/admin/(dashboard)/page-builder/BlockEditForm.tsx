"use client";

import { useState, useEffect } from "react";
import { Button } from "@saltandlight/ui";
import {
  X,
  Plus,
  Trash2,
  Truck,
  ShieldCheck,
  RefreshCw,
  Heart,
  Sparkles,
  CrossIcon,
  Star,
  Gift,
  Phone,
  Mail,
  MapPin,
  Check,
} from "@/components/admin/Icons";
import { toast } from "sonner";
import { BLOCK_TYPE_LABELS, BLOCK_ICON_KEYS, type PageBlockTypeValue } from "@/lib/admin/page-block-types";
import { TextField, ArrayEditor } from "@/components/admin/form-fields";
import { ProductPickerModal } from "@/components/admin/ProductPickerModal";
import type { PageBlockItem } from "./BlockList";

function defaultContent(type: PageBlockTypeValue): Record<string, any> {
  switch (type) {
    case "FEATURE_CARDS":
      return { style: "row", items: [{ icon: "Sparkles", title: "", description: "" }] };
    case "FEATURED_PRODUCTS":
      return {
        eyebrow: "Bán chạy nhất",
        headline: "Sản phẩm nổi bật",
        ctaLabel: "Xem tất cả",
        ctaHref: "/san-pham",
        count: 8,
        sourceType: "all",
        categoryId: null,
        categorySlug: "",
        categoryName: "",
        productIds: [],
        displayMode: "grid",
        allowViewAll: true,
        viewAllMode: "link",
      };
    case "PRODUCT_LIST":
      return {
        eyebrow: "Bộ sưu tập",
        headline: "Danh sách sản phẩm",
        ctaLabel: "Xem tất cả sản phẩm",
        ctaHref: "/san-pham",
        count: 8,
        sourceType: "category",
        categoryId: null,
        categorySlug: "",
        categoryName: "",
        productIds: [],
        displayMode: "grid",
        allowViewAll: true,
        viewAllMode: "modal",
      };
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
  embedded = false,
  onChangePreview,
}: {
  page: string;
  block: PageBlockItem | null;
  defaultType: PageBlockTypeValue;
  onClose: () => void;
  onSaved: (block: PageBlockItem) => void;
  embedded?: boolean;
  onChangePreview?: (content: Record<string, any>) => void;
}) {
  const type = block?.type ?? defaultType;
  const [content, setContent] = useState<Record<string, any>>(block?.content ?? defaultContent(type));
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (block) {
      setContent(block.content ?? defaultContent(block.type));
    }
  }, [block?.id, block?.type]);

  function set(patch: Record<string, any>) {
    setContent((prev) => {
      const next = { ...prev, ...patch };
      if (onChangePreview) {
        onChangePreview(next);
      }
      return next;
    });
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
      toast.success(block ? "Cập nhật khối thành công!" : "Tạo khối mới thành công!");
      onSaved(data.block);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Có lỗi xảy ra";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  }

  if (embedded) {
    return (
      <div className="flex flex-col h-full bg-white">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-slate-50/80 shrink-0">
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-forest">
              Chỉnh sửa khối
            </span>
            <h3 className="font-bold text-slate-900 text-xs truncate">
              {BLOCK_TYPE_LABELS[type]}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            title="Đóng bảng chỉnh sửa"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              {error}
            </div>
          )}

          <ContentFields type={type} content={content} set={set} />

          <div className="sticky bottom-0 bg-white/95 backdrop-blur-xs pt-3 pb-1 border-t border-slate-100 flex items-center justify-between gap-2">
            <Button type="button" variant="outline" onClick={onClose} className="rounded-xl px-3 py-1.5 text-xs font-semibold">
              Quay lại
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
              className="rounded-xl px-4 py-1.5 text-xs font-bold !bg-brand-forest hover:!bg-brand-forest/90 !text-white shadow-xs"
            >
              {isSaving ? "Đang lưu..." : block ? "Lưu khối" : "Tạo khối"}
            </Button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden my-8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <h3 className="font-bold text-slate-900 text-sm">
            {block ? "Chỉnh sửa khối" : "Thêm mới"} — {BLOCK_TYPE_LABELS[type]}
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
              {isSaving ? "Đang lưu..." : block ? "Lưu thay đổi" : "Tạo khối mới"}
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
              <option value="row">Hàng ngang liền khối (Dải tiện ích cam kết mua sắm)</option>
              <option value="card">Từng thẻ riêng lẻ (Chính sách nổi bật, giới thiệu)</option>
              <option value="numbered">Thẻ đánh số thứ tự (Giá trị cốt lõi, các bước)</option>
            </select>
          </div>
          <TextField label="Tiêu đề khối (Không bắt buộc)" value={content.headline || ""} onChange={(v) => set({ headline: v })} />
          <TextField label="Đoạn giới thiệu ngắn (Không bắt buộc)" value={content.subtitle || ""} onChange={(v) => set({ subtitle: v })} />
          <ArrayEditor
            label="Danh sách các mục nổi bật"
            items={content.items || []}
            onChange={(items) => set({ items })}
            newItem={() => ({ icon: "Sparkles", number: "", title: "", description: "" }) as Record<string, any>}
            renderItem={(item, update) => (
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <IconSelect label="Biểu tượng (Icon)" value={item.icon || ""} onChange={(v) => update({ icon: v })} />
                  <TextField label="Số thứ tự (Ví dụ: 01, 02...)" value={item.number || ""} onChange={(v) => update({ number: v })} />
                </div>
                <TextField label="Tiêu đề mục" value={item.title || ""} onChange={(v) => update({ title: v })} required />
                <TextField label="Nội dung mô tả chi tiết" value={item.description || ""} onChange={(v) => update({ description: v })} multiline required />
              </div>
            )}
          />
        </>
      );

    case "FEATURED_PRODUCTS":
    case "PRODUCT_LIST":
      return <FeaturedProductsEditor content={content} set={set} isProductList={type === "PRODUCT_LIST"} />;

    case "STORY_BANNER":
      return (
        <>
          <IconSelect label="Biểu tượng (Icon)" value={content.icon || ""} onChange={(v) => set({ icon: v })} />
          <TextField label="Câu trích dẫn hoặc thông điệp ý nghĩa" value={content.quote || ""} onChange={(v) => set({ quote: v })} multiline required />
          <TextField label="Nguồn trích dẫn (Ví dụ: Ma-thi-ơ 5:13-14 hoặc Tác giả)" value={content.quoteRef || ""} onChange={(v) => set({ quoteRef: v })} />
          <TextField label="Nội dung câu chuyện / Giới thiệu chi tiết" value={content.body || ""} onChange={(v) => set({ body: v })} multiline required />
          <div className="grid grid-cols-2 gap-3">
            <TextField label="Chữ trên nút bấm (Không bắt buộc)" value={content.ctaLabel || ""} onChange={(v) => set({ ctaLabel: v })} />
            <TextField label="Đường dẫn khi bấm nút (Ví dụ: /gioi-thieu)" value={content.ctaHref || ""} onChange={(v) => set({ ctaHref: v })} />
          </div>
        </>
      );

    case "PROMO_CTA":
      return (
        <>
          <div className="grid grid-cols-2 gap-3">
            <TextField label="Huy hiệu nổi bật (Ví dụ: Ưu đãi đặc biệt, Đặt in theo yêu cầu)" value={content.badge || ""} onChange={(v) => set({ badge: v })} />
            <IconSelect label="Biểu tượng (Icon)" value={content.icon || ""} onChange={(v) => set({ icon: v })} />
          </div>
          <TextField label="Tiêu đề thông điệp" value={content.headline || ""} onChange={(v) => set({ headline: v })} required />
          <TextField label="Nội dung mô tả chương trình" value={content.body || ""} onChange={(v) => set({ body: v })} multiline required />
          <StringListEditor
            label="Các điểm nổi bật / Ưu đãi (Gạch đầu dòng)"
            values={content.bullets || []}
            onChange={(v) => set({ bullets: v })}
            placeholder="Ví dụ: Hỗ trợ thiết kế demo miễn phí"
          />
          <div className="grid grid-cols-2 gap-3">
            <TextField label="Chữ trên nút bấm" value={content.ctaLabel || ""} onChange={(v) => set({ ctaLabel: v })} required />
            <TextField label="Đường dẫn khi bấm nút" value={content.ctaHref || ""} onChange={(v) => set({ ctaHref: v })} required />
          </div>
        </>
      );

    case "TESTIMONIALS":
      return (
        <>
          <TextField label="Dòng chữ nhỏ trên tiêu đề (Ví dụ: Khách hàng nói gì về chúng tôi)" value={content.eyebrow || ""} onChange={(v) => set({ eyebrow: v })} />
          <TextField label="Tiêu đề chính" value={content.headline || ""} onChange={(v) => set({ headline: v })} required />
          <ArrayEditor
            label="Danh sách cảm nhận của khách hàng"
            items={content.items || []}
            onChange={(items) => set({ items })}
            newItem={() => ({ name: "", role: "", rating: 5, product: "", comment: "" })}
            renderItem={(item, update) => (
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <TextField label="Họ và tên khách hàng" value={item.name || ""} onChange={(v) => update({ name: v })} required />
                  <TextField label="Nơi ở hoặc chức vụ (Ví dụ: Hà Nội, Hội thánh...)" value={item.role || ""} onChange={(v) => update({ role: v })} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <TextField label="Sản phẩm khách đã mua (Không bắt buộc)" value={item.product || ""} onChange={(v) => update({ product: v })} />
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Đánh giá số sao (Từ 1 đến 5 sao)</label>
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
                <TextField label="Lời nhận xét chi tiết của khách hàng" value={item.comment || ""} onChange={(v) => update({ comment: v })} multiline required />
              </div>
            )}
          />
        </>
      );

    case "PAGE_HERO":
      return (
        <>
          <div className="grid grid-cols-2 gap-3">
            <IconSelect label="Biểu tượng (Không bắt buộc)" value={content.icon || ""} onChange={(v) => set({ icon: v })} />
            <TextField label="Dòng chữ nhỏ trên tiêu đề (Không bắt buộc)" value={content.eyebrow || ""} onChange={(v) => set({ eyebrow: v })} />
          </div>
          <TextField label="Tiêu đề lớn của trang" value={content.title || ""} onChange={(v) => set({ title: v })} required />
          <TextField label="Đoạn giới thiệu mở đầu" value={content.subtitle || ""} onChange={(v) => set({ subtitle: v })} multiline />
          <TextField label="Câu trích dẫn ý nghĩa (Không bắt buộc)" value={content.quote || ""} onChange={(v) => set({ quote: v })} multiline />
          <TextField label="Nguồn câu trích dẫn" value={content.quoteRef || ""} onChange={(v) => set({ quoteRef: v })} />
        </>
      );

    case "RICH_TEXT_SECTIONS":
      return (
        <ArrayEditor
          label="Danh sách các phần nội dung"
          items={content.sections || []}
          onChange={(sections) => set({ sections })}
          newItem={() => ({ heading: "", paragraphs: [], bullets: [], cards: [] }) as Record<string, any>}
          renderItem={(section, update) => (
            <div className="space-y-3">
              <TextField label="Tiêu đề của phần này" value={section.heading || ""} onChange={(v) => update({ heading: v })} required />
              <StringListEditor label="Các đoạn văn bản" values={section.paragraphs || []} onChange={(v) => update({ paragraphs: v })} />
              <StringListEditor label="Các ý gạch đầu dòng" values={section.bullets || []} onChange={(v) => update({ bullets: v })} />
              <ArrayEditor
                label="Các ô thông tin phụ (Không bắt buộc)"
                items={section.cards || []}
                onChange={(cards) => update({ cards })}
                newItem={() => ({ title: "", description: "" })}
                renderItem={(card, updateCard) => (
                  <div className="grid grid-cols-2 gap-2">
                    <TextField label="Tiêu đề ô" value={card.title || ""} onChange={(v) => updateCard({ title: v })} />
                    <TextField label="Mô tả ô" value={card.description || ""} onChange={(v) => updateCard({ description: v })} />
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
            label="Danh sách thông tin liên hệ"
            items={content.items || []}
            onChange={(items) => set({ items })}
            newItem={() => ({ icon: "Phone", label: "", value: "", note: "" })}
            renderItem={(item, update) => (
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <IconSelect label="Biểu tượng (Icon)" value={item.icon || ""} onChange={(v) => update({ icon: v })} />
                  <TextField label="Tên thông tin (Ví dụ: Hotline, Email, Zalo, Địa chỉ)" value={item.label || ""} onChange={(v) => update({ label: v })} required />
                </div>
                <TextField label="Nội dung hiển thị (Ví dụ: 0912 345 678, info@...)" value={item.value || ""} onChange={(v) => update({ value: v })} required />
                <TextField label="Ghi chú thêm (Ví dụ: Hỗ trợ 24/7)" value={item.note || ""} onChange={(v) => update({ note: v })} />
              </div>
            )}
          />
          <TextField label="Câu châm ngôn / Lời Chúa (Không bắt buộc)" value={content.quote || ""} onChange={(v) => set({ quote: v })} multiline />
          <TextField label="Nguồn câu trích dẫn" value={content.quoteRef || ""} onChange={(v) => set({ quoteRef: v })} />
        </>
      );

    case "CTA_BANNER":
      return (
        <>
          <TextField label="Tiêu đề lời kêu gọi mua sắm" value={content.headline || ""} onChange={(v) => set({ headline: v })} required />
          <ArrayEditor
            label="Danh sách nút hành động"
            items={content.buttons || []}
            onChange={(buttons) => set({ buttons })}
            newItem={() => ({ label: "", href: "", variant: "primary" })}
            renderItem={(btn, update) => (
              <div className="grid grid-cols-3 gap-2">
                <TextField label="Chữ trên nút" value={btn.label || ""} onChange={(v) => update({ label: v })} required />
                <TextField label="Đường dẫn khi bấm nút" value={btn.href || ""} onChange={(v) => update({ href: v })} required />
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Kiểu dáng</label>
                  <select
                    value={btn.variant || "primary"}
                    onChange={(e) => update({ variant: e.target.value })}
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
  }
}

const ICON_PREVIEW_MAP: Record<string, React.ComponentType<{ size?: number | string; className?: string }>> = {
  Truck,
  ShieldCheck,
  RefreshCw,
  Heart,
  Sparkles,
  CrossIcon,
  Star,
  Gift,
  Phone,
  Mail,
  MapPin,
  Check,
};

function IconSelect({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const SelectedIcon = value ? ICON_PREVIEW_MAP[value] : null;
  return (
    <div>
      <label className="block text-xs font-bold text-slate-700 mb-1">{label}</label>
      <div className="flex items-center gap-2">
        {SelectedIcon && (
          <span className="w-9 h-9 rounded-xl flex items-center justify-center bg-mint-50 text-brand-forest border border-brand-forest/30 shrink-0">
            <SelectedIcon size={18} />
          </span>
        )}
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 rounded-xl border border-slate-200 px-3.5 py-2 text-sm focus:border-brand-forest focus:outline-none bg-white"
        >
          <option value="">— Không chọn —</option>
          {BLOCK_ICON_KEYS.map((k) => (
            <option key={k} value={k}>
              {k}
            </option>
          ))}
        </select>
      </div>
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

function FeaturedProductsEditor({
  content,
  set,
  isProductList,
}: {
  content: Record<string, any>;
  set: (patch: Record<string, any>) => void;
  isProductList?: boolean;
}) {
  const [categories, setCategories] = useState<{ id: string; name: string; slug: string }[]>([]);
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  useEffect(() => {
    fetch("/api/admin/categories")
      .then((res) => res.json())
      .then((data) => {
        if (data.categories) setCategories(data.categories);
      })
      .catch((err) => console.error("Error loading categories:", err));
  }, []);

  const sourceType = content.sourceType || (isProductList ? "category" : "all");
  const displayMode = content.displayMode || "grid";
  const allowViewAll = content.allowViewAll ?? true;
  const viewAllMode = content.viewAllMode || (isProductList ? "modal" : "link");

  function handleCategorySelect(catId: string) {
    const selected = categories.find((c) => c.id === catId);
    if (selected) {
      set({
        categoryId: selected.id,
        categoryName: selected.name,
        categorySlug: selected.slug,
        headline: content.headline || selected.name,
        ctaLabel: content.ctaLabel || `Xem tất cả ${selected.name}`,
        ctaHref: `/san-pham?categories=${selected.slug}`,
      });
    } else {
      set({ categoryId: null, categoryName: "", categorySlug: "" });
    }
  }

  return (
    <div className="space-y-4">
      {/* 1. Source Type */}
      <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3.5 space-y-3">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
          Nguồn lấy sản phẩm để hiển thị
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {[
            { id: "all", label: "Sản phẩm bán chạy / nổi bật" },
            { id: "category", label: "Theo Danh mục / Mùa" },
            { id: "manual", label: "Tự chọn từng sản phẩm" },
          ].map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => set({ sourceType: s.id })}
              className={`rounded-lg py-2 px-3 text-xs font-bold border transition-all ${
                sourceType === s.id
                  ? "bg-brand-forest text-white border-brand-forest shadow-xs"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* If Category Source */}
        {sourceType === "category" && (
          <div className="pt-2 border-t border-slate-200/80 space-y-2">
            <label className="block text-xs font-bold text-slate-700">
              Chọn Danh mục / Bộ sưu tập theo mùa
            </label>
            <select
              value={content.categoryId || ""}
              onChange={(e) => handleCategorySelect(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm focus:border-brand-forest focus:outline-none"
            >
              <option value="">-- Chọn một danh mục hoặc bộ sưu tập --</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            {content.categorySlug && (
              <p className="text-[11px] text-slate-500">
                Đường dẫn liên kết tự động:{" "}
                <code className="text-brand-forest font-semibold">
                  /san-pham?categories={content.categorySlug}
                </code>
              </p>
            )}
          </div>
        )}

        {/* If Manual Product Picker */}
        {sourceType === "manual" && (
          <div className="pt-2 border-t border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700">
                Số sản phẩm đã chọn:{" "}
                <span className="text-brand-forest font-bold">
                  {(content.productIds || []).length}
                </span>
              </label>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsPickerOpen(true)}
                className="text-xs font-bold !bg-white hover:!bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5"
              >
                Chọn sản phẩm từ danh sách
              </Button>
            </div>
            {(content.productIds || []).length === 0 && (
              <p className="text-xs text-amber-700 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                Chưa có sản phẩm nào được chọn. Nhấn nút &quot;Chọn sản phẩm từ danh sách&quot; để tích chọn các sản phẩm bạn muốn hiển thị trong khối này.
              </p>
            )}
          </div>
        )}
      </div>

      {/* 2. Display Mode: Slider / Grid */}
      <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3.5 space-y-2">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
          Bố cục hiển thị trên trang web
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => set({ displayMode: "grid" })}
            className={`rounded-lg py-2 px-3 text-xs font-bold border transition-all ${
              displayMode === "grid"
                ? "bg-brand-forest text-white border-brand-forest shadow-xs"
                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
            }`}
          >
            Dạng lưới sản phẩm (Nhiều hàng cột)
          </button>
          <button
            type="button"
            onClick={() => set({ displayMode: "slider" })}
            className={`rounded-lg py-2 px-3 text-xs font-bold border transition-all ${
              displayMode === "slider"
                ? "bg-brand-forest text-white border-brand-forest shadow-xs"
                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
            }`}
          >
            Dạng thanh trượt ngang (Lướt xem qua lại)
          </button>
        </div>
      </div>

      {/* 3. Titles & Eyebrow */}
      <TextField
        label="Dòng chữ nhỏ trên tiêu đề (Không bắt buộc)"
        value={content.eyebrow || ""}
        onChange={(v) => set({ eyebrow: v })}
        placeholder="Ví dụ: Bộ sưu tập mới, Bán chạy nhất, Xu hướng mùa này..."
      />
      <TextField
        label="Tiêu đề chính của khối"
        value={content.headline || ""}
        onChange={(v) => set({ headline: v })}
        required
        placeholder="Ví dụ: Sản phẩm nổi bật, Áo thun Cơ Đốc, Quà tặng ý nghĩa..."
      />

      {/* 4. Count */}
      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1">
          Số lượng sản phẩm hiển thị trên trang (Tối đa)
        </label>
        <input
          type="number"
          min={1}
          max={36}
          value={content.count ?? 8}
          onChange={(e) => set({ count: Number(e.target.value) })}
          className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm focus:border-brand-forest focus:outline-none"
        />
      </div>

      {/* 5. View all settings */}
      <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3.5 space-y-3">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={allowViewAll}
            onChange={(e) => set({ allowViewAll: e.target.checked })}
            className="rounded border-slate-300 text-brand-forest focus:ring-brand-forest h-4 w-4"
          />
          <span className="text-xs font-bold text-slate-800">
            Hiển thị nút &quot;Xem tất cả&quot; cho khách hàng
          </span>
        </label>

        {allowViewAll && (
          <div className="pt-2 border-t border-slate-200/80 space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Hành động khi khách hàng bấm nút &quot;Xem tất cả&quot;
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => set({ viewAllMode: "modal" })}
                  className={`rounded-lg py-1.5 px-3 text-xs font-semibold border transition-all ${
                    viewAllMode === "modal"
                      ? "bg-brand-forest text-white border-brand-forest shadow-xs"
                      : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  Mở danh sách xem nhanh (Modal popup trên trang)
                </button>
                <button
                  type="button"
                  onClick={() => set({ viewAllMode: "link" })}
                  className={`rounded-lg py-1.5 px-3 text-xs font-semibold border transition-all ${
                    viewAllMode === "link"
                      ? "bg-brand-forest text-white border-brand-forest shadow-xs"
                      : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  Chuyển sang trang danh mục sản phẩm (/san-pham...)
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <TextField
                label="Chữ trên nút bấm"
                value={content.ctaLabel || "Xem tất cả"}
                onChange={(v) => set({ ctaLabel: v })}
                required
                placeholder="Ví dụ: Xem tất cả sản phẩm"
              />
              <TextField
                label="Đường dẫn khi bấm nút"
                value={content.ctaHref || "/san-pham"}
                onChange={(v) => set({ ctaHref: v })}
                required
                placeholder="Ví dụ: /san-pham"
              />
            </div>
          </div>
        )}
      </div>

      <ProductPickerModal
        isOpen={isPickerOpen}
        selectedIds={content.productIds || []}
        onClose={() => setIsPickerOpen(false)}
        onSelect={(ids) => set({ productIds: ids })}
      />
    </div>
  );
}


