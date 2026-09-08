"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@saltandlight/ui";
import { Plus, Trash2, Pencil, GripVertical, Sparkles, Eye } from "@/components/admin/Icons";
import { toast } from "sonner";
import { BLOCK_TYPE_LABELS, PAGE_BLOCK_TYPES, type PageBlockTypeValue } from "@/lib/admin/page-block-types";
import { BlockEditForm } from "./BlockEditForm";
import { BlockPaletteModal } from "@/components/admin/BlockPaletteModal";
import { PageLivePreviewModal } from "@/components/admin/PageLivePreviewModal";

export interface PageBlockItem {
  id: string;
  page: string;
  type: PageBlockTypeValue;
  sortOrder: number;
  isVisible: boolean;
  content: Record<string, any>;
}

export function BlockList({ page, initialBlocks }: { page: string; initialBlocks: PageBlockItem[] }) {
  const router = useRouter();
  const [blocks, setBlocks] = useState<PageBlockItem[]>(initialBlocks);
  const [editingBlock, setEditingBlock] = useState<PageBlockItem | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [addType, setAddType] = useState<PageBlockTypeValue>(PAGE_BLOCK_TYPES[0]);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);

  // Advanced Visual Palette & Live Preview States
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [insertIndex, setInsertIndex] = useState<number | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  async function persistOrder(next: PageBlockItem[], previous: PageBlockItem[]) {
    try {
      const res = await fetch("/api/admin/page-blocks/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ page, orderedIds: next.map((b) => b.id) }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Không thể lưu thứ tự mới");
      }
      toast.success("Đã lưu thứ tự khối thành công!");
      router.refresh();
    } catch (err: any) {
      toast.error(err?.message || "Không thể lưu thứ tự mới. Vui lòng thử lại!");
      setBlocks(previous);
    }
  }

  function handleDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIndex = blocks.findIndex((b) => b.id === active.id);
    const newIndex = blocks.findIndex((b) => b.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const previous = blocks;
    const next = arrayMove(blocks, oldIndex, newIndex);
    setBlocks(next);
    persistOrder(next, previous);
  }

  async function handleToggleVisible(block: PageBlockItem) {
    const nextVisible = !block.isVisible;
    setBlocks((prev) => prev.map((b) => (b.id === block.id ? { ...b, isVisible: nextVisible } : b)));
    try {
      const res = await fetch(`/api/admin/page-blocks/${block.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isVisible: nextVisible }),
      });
      if (!res.ok) throw new Error();
      toast.success(nextVisible ? "Đã bật hiển thị khối!" : "Đã ẩn khối trên trang!");
      router.refresh();
    } catch {
      setBlocks((prev) => prev.map((b) => (b.id === block.id ? { ...b, isVisible: block.isVisible } : b)));
      toast.error("Không thể cập nhật. Vui lòng thử lại!");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Bạn có chắc chắn muốn xóa khối này khỏi trang không?")) return;
    setIsDeletingId(id);
    try {
      const res = await fetch(`/api/admin/page-blocks/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setBlocks((prev) => prev.filter((b) => b.id !== id));
      toast.success("Đã xóa khối thành công!");
      router.refresh();
    } catch {
      toast.error("Không thể xóa khối. Vui lòng thử lại!");
    } finally {
      setIsDeletingId(null);
    }
  }

  function handleSelectFromPalette(type: PageBlockTypeValue, targetIdx?: number | null) {
    setAddType(type);
    setInsertIndex(typeof targetIdx === "number" ? targetIdx : null);
    setIsAdding(true);
  }

  function handleSaved(block: PageBlockItem, isNew: boolean) {
    if (isNew && typeof insertIndex === "number") {
      const next = [...blocks];
      next.splice(insertIndex + 1, 0, block);
      setBlocks(next);
      persistOrder(next, blocks);
    } else {
      setBlocks((prev) => (isNew ? [...prev, block] : prev.map((b) => (b.id === block.id ? block : b))));
    }
    setEditingBlock(null);
    setIsAdding(false);
    setInsertIndex(null);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      {/* Top Action Toolbar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <p className="text-xs text-slate-500">
          Kéo giữ biểu tượng ⠿ để đổi vị trí. Bạn có thể chèn thêm khối ở bất kỳ vị trí nào hoặc xem trước giao diện.
        </p>
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setInsertIndex(null);
              setIsPaletteOpen(true);
            }}
            className="inline-flex items-center gap-1.5 text-xs font-bold rounded-xl px-3.5 py-2 !border-brand-forest/40 !text-brand-forest hover:!bg-mint-50 shadow-2xs"
          >
            <Sparkles size={15} />
            Thư viện khối mẫu
          </Button>

          <Button
            type="button"
            onClick={() => setIsPreviewOpen(true)}
            className="inline-flex items-center gap-1.5 text-xs font-bold rounded-xl px-3.5 py-2 !bg-slate-800 hover:!bg-slate-900 !text-white shadow-xs"
          >
            <Eye size={15} />
            Xem trước trang web
          </Button>

          <div className="h-5 w-px bg-slate-200 hidden sm:block" />

          <select
            value={addType}
            onChange={(e) => setAddType(e.target.value as PageBlockTypeValue)}
            className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold focus:border-brand-forest focus:outline-none bg-white max-w-[200px] truncate"
          >
            {PAGE_BLOCK_TYPES.map((t) => (
              <option key={t} value={t}>
                {BLOCK_TYPE_LABELS[t]}
              </option>
            ))}
          </select>
          <Button
            onClick={() => {
              setInsertIndex(null);
              setIsAdding(true);
            }}
            className="inline-flex items-center gap-1.5 !bg-brand-forest hover:!bg-brand-forest/90 !text-white text-xs font-bold rounded-xl px-4 py-2 shadow-xs"
          >
            <Plus size={16} />
            + Thêm khối
          </Button>
        </div>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-1.5">
            {blocks.map((block, idx) => (
              <div key={block.id} className="space-y-1.5">
                <SortableBlockRow
                  block={block}
                  onToggle={() => handleToggleVisible(block)}
                  onEdit={() => setEditingBlock(block)}
                  onDelete={() => handleDelete(block.id)}
                  isDeleting={isDeletingId === block.id}
                />
                <InsertDivider
                  onInsert={() => {
                    setInsertIndex(idx);
                    setIsPaletteOpen(true);
                  }}
                />
              </div>
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {blocks.length === 0 && (
        <div className="py-16 text-center bg-white rounded-2xl border border-dashed border-slate-200 space-y-3">
          <div className="text-sm font-bold text-slate-700">Chưa có khối hiển thị nào</div>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Bấm &quot;Thư viện khối mẫu&quot; để chọn các mẫu thiết kế đẹp mắt hoặc bấm &quot;+ Thêm khối&quot; để bắt đầu.
          </p>
          <Button
            type="button"
            onClick={() => {
              setInsertIndex(null);
              setIsPaletteOpen(true);
            }}
            className="inline-flex items-center gap-1.5 !bg-brand-forest text-white text-xs font-bold rounded-xl px-4 py-2 shadow-xs"
          >
            <Sparkles size={15} />
            Mở thư viện khối mẫu
          </Button>
        </div>
      )}

      {(editingBlock || isAdding) && (
        <BlockEditForm
          page={page}
          block={editingBlock}
          defaultType={addType}
          onClose={() => {
            setEditingBlock(null);
            setIsAdding(false);
            setInsertIndex(null);
          }}
          onSaved={(block) => handleSaved(block, !editingBlock)}
        />
      )}

      <BlockPaletteModal
        isOpen={isPaletteOpen}
        targetIndex={insertIndex}
        onClose={() => setIsPaletteOpen(false)}
        onSelectBlock={handleSelectFromPalette}
      />

      <PageLivePreviewModal
        isOpen={isPreviewOpen}
        page={page}
        onClose={() => setIsPreviewOpen(false)}
      />
    </div>
  );
}

function InsertDivider({ onInsert }: { onInsert: () => void }) {
  return (
    <div className="relative py-1 group flex items-center justify-center">
      <div className="absolute inset-x-0 h-px bg-slate-200/60 group-hover:bg-brand-forest/40 transition-colors" />
      <button
        type="button"
        onClick={onInsert}
        className="relative z-10 opacity-0 group-hover:opacity-100 transition-all scale-95 group-hover:scale-100 inline-flex items-center gap-1 rounded-full bg-white border border-brand-forest/40 px-3 py-1 text-[11px] font-bold text-brand-forest hover:bg-mint-50 shadow-xs"
      >
        <Plus size={12} />
        <span>Chèn khối vào đây</span>
      </button>
    </div>
  );
}

function SortableBlockRow({
  block,
  onToggle,
  onEdit,
  onDelete,
  isDeleting,
}: {
  block: PageBlockItem;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
  isDeleting: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 rounded-2xl border bg-white p-3.5 transition-colors ${
        isDragging ? "border-brand-forest shadow-md z-10" : "border-slate-200/80"
      } ${!block.isVisible ? "opacity-60" : ""}`}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="shrink-0 cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-700 p-1"
        aria-label="Kéo để sắp xếp"
      >
        <GripVertical size={18} />
      </button>

      <div className="min-w-0 flex-1">
        <div className="text-sm font-bold text-ink truncate">{BLOCK_TYPE_LABELS[block.type]}</div>
        <div className="text-[11px] text-slate-400 truncate">{blockPreviewText(block)}</div>
      </div>

      <button
        type="button"
        onClick={onToggle}
        className={`shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all ${
          block.isVisible
            ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
            : "bg-slate-100 text-slate-500 hover:bg-slate-200"
        }`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${block.isVisible ? "bg-emerald-500" : "bg-slate-400"}`} />
        {block.isVisible ? "Đang hiện" : "Đã ẩn"}
      </button>

      <button
        type="button"
        onClick={onEdit}
        className="shrink-0 p-2 rounded-xl text-slate-600 hover:text-brand-forest hover:bg-mint-50 transition-colors"
        title="Chỉnh sửa khối"
      >
        <Pencil size={15} />
      </button>
      <button
        type="button"
        onClick={onDelete}
        disabled={isDeleting}
        className="shrink-0 p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-40"
        title="Xóa khối"
      >
        <Trash2 size={15} />
      </button>
    </div>
  );
}

function blockPreviewText(block: PageBlockItem): string {
  const c = block.content || {};
  if (typeof c.headline === "string" && c.headline) return c.headline;
  if (typeof c.title === "string" && c.title) return c.title;
  if (typeof c.quote === "string" && c.quote) return c.quote;
  if (c.sourceType === "category" && c.categoryName) return `Danh mục: ${c.categoryName}`;
  if (Array.isArray(c.items)) return `${c.items.length} mục`;
  if (Array.isArray(c.sections)) return `${c.sections.length} phần`;
  return "";
}
