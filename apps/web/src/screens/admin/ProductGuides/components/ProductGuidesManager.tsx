"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@saltandlight/ui";
import { BookOpen, ChevronDown, ChevronUp, Plus, Trash2 } from "@/components/admin/Icons";
import { ProductGuideSection } from "@/components/ProductGuides";
import type { ProductGuide } from "@/helpers/product-guides";
import { GuideEditor, LAYOUT_LABELS, type CategoryOption } from "./GuideEditor";
import { adminFetch } from "@/api/admin-fetch";

function newGuide(): ProductGuide {
  return {
    id: crypto.randomUUID(),
    title: "Hướng dẫn mới",
    subtitle: "",
    layout: "cards",
    categoryIds: [],
    items: [{ icon: "✨", title: "", content: "" }],
    isActive: true,
  };
}

/** Guide list + persistence. Editing a single guide is delegated to GuideEditor. */
export function ProductGuidesManager({
  initialGuides,
  categories,
}: {
  initialGuides: ProductGuide[];
  categories: CategoryOption[];
}) {
  const [guides, setGuides] = useState(initialGuides);
  const [savedJson, setSavedJson] = useState(() => JSON.stringify(initialGuides));
  const [selectedId, setSelectedId] = useState<string | null>(initialGuides[0]?.id ?? null);
  const [isSaving, setIsSaving] = useState(false);

  const selected = guides.find((g) => g.id === selectedId) ?? null;
  const isDirty = JSON.stringify(guides) !== savedJson;
  const knownCategoryIds = new Set(categories.map((c) => c.id));

  function updateSelected(patch: Partial<ProductGuide>) {
    setGuides((prev) => prev.map((g) => (g.id === selectedId ? { ...g, ...patch } : g)));
  }

  function addGuide() {
    const guide = newGuide();
    setGuides((prev) => [...prev, guide]);
    setSelectedId(guide.id);
  }

  function removeGuide(id: string) {
    if (!confirm("Xóa hướng dẫn này? Thay đổi chỉ áp dụng sau khi bấm Lưu.")) return;
    setGuides((prev) => prev.filter((g) => g.id !== id));
    if (selectedId === id) setSelectedId(null);
  }

  function moveGuide(index: number, offset: -1 | 1) {
    setGuides((prev) => {
      const target = index + offset;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[target]] = [next[target]!, next[index]!];
      return next;
    });
  }

  async function save() {
    setIsSaving(true);
    try {
      const data = await adminFetch<{ guides: typeof guides }>("/api/admin/product-guides", { method: "PUT", body: { guides } });
      setGuides(data.guides);
      setSavedJson(JSON.stringify(data.guides));
      toast.success("Đã lưu. Trang sản phẩm cập nhật trong khoảng 1 phút.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Không thể lưu hướng dẫn sản phẩm");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="luno-card flex flex-wrap items-center justify-between gap-3 p-4">
        <p className="text-xs text-slate-500">
          {isDirty ? (
            <span className="font-bold text-amber-600">● Có thay đổi chưa lưu</span>
          ) : (
            "Thứ tự trong danh sách là thứ tự hiển thị trên trang sản phẩm."
          )}
        </p>
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" size="sm" onClick={addGuide}>
            <Plus size={14} /> Thêm hướng dẫn
          </Button>
          <Button type="button" size="sm" onClick={save} disabled={isSaving || !isDirty}>
            {isSaving ? "Đang lưu…" : "Lưu thay đổi"}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[300px_1fr] items-start">
        <ul className="luno-card space-y-2 p-3">
          {guides.map((guide, index) => {
            const categoryCount = guide.categoryIds.filter((id) => knownCategoryIds.has(id)).length;
            const isSelected = guide.id === selectedId;
            return (
              <li
                key={guide.id}
                className={`flex items-center gap-1.5 rounded-xl border p-2.5 transition-colors ${
                  isSelected ? "border-brand-forest bg-mint-50/60" : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <button type="button" onClick={() => setSelectedId(guide.id)} className="min-w-0 flex-1 text-left">
                  <span className="block truncate text-xs font-bold text-slate-900">{guide.title || "(Chưa có tiêu đề)"}</span>
                  <span className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[10px] font-semibold text-slate-500">
                    <span>{LAYOUT_LABELS[guide.layout]}</span>
                    <span>·</span>
                    {categoryCount > 0 ? (
                      <span>{categoryCount} danh mục</span>
                    ) : (
                      <span className="text-amber-600">Chưa gán danh mục</span>
                    )}
                    {!guide.isActive && <span className="rounded-full bg-slate-100 px-1.5">Đang ẩn</span>}
                  </span>
                </button>
                <div className="flex flex-col">
                  <button
                    type="button"
                    onClick={() => moveGuide(index, -1)}
                    disabled={index === 0}
                    aria-label="Lên trên"
                    className="rounded p-0.5 text-slate-400 hover:text-slate-700 disabled:opacity-30"
                  >
                    <ChevronUp size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveGuide(index, 1)}
                    disabled={index === guides.length - 1}
                    aria-label="Xuống dưới"
                    className="rounded p-0.5 text-slate-400 hover:text-slate-700 disabled:opacity-30"
                  >
                    <ChevronDown size={13} />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => removeGuide(guide.id)}
                  aria-label="Xóa hướng dẫn"
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                >
                  <Trash2 size={13} />
                </button>
              </li>
            );
          })}
          {guides.length === 0 && (
            <li className="py-8 text-center text-xs text-slate-400">Chưa có hướng dẫn nào.</li>
          )}
        </ul>

        {selected ? (
          <div className="space-y-4 min-w-0">
            <div className="luno-card p-5">
              <GuideEditor guide={selected} categories={categories} onChange={updateSelected} />
            </div>
            <div className="luno-card p-5">
              <div className="mb-4 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Xem trước trên trang sản phẩm
              </div>
              {selected.items.some((item) => item.title || item.content) ? (
                <ProductGuideSection guide={selected} />
              ) : (
                <p className="text-xs italic text-slate-400">Thêm nội dung để xem trước.</p>
              )}
            </div>
          </div>
        ) : (
          <div className="luno-card flex flex-col items-center justify-center gap-2 p-12 text-center text-slate-400">
            <BookOpen size={28} />
            <p className="text-xs">Chọn một hướng dẫn bên trái hoặc bấm “Thêm hướng dẫn”.</p>
          </div>
        )}
      </div>
    </div>
  );
}
