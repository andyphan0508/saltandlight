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
import { Plus, Trash2, Pencil, GripVertical } from "@/components/Icons";
import { toast } from "sonner";
import { BLOCK_TYPE_LABELS, PAGE_BLOCK_TYPES, type PageBlockTypeValue } from "@/lib/page-block-types";
import { BlockEditForm } from "./BlockEditForm";

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

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  async function persistOrder(next: PageBlockItem[]) {
    try {
      const res = await fetch("/api/admin/page-blocks/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ page, orderedIds: next.map((b) => b.id) }),
      });
      if (!res.ok) throw new Error();
      router.refresh();
    } catch {
      toast.error("Không thể lưu thứ tự mới. Vui lòng thử lại!");
      setBlocks(initialBlocks);
    }
  }

  function handleDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    setBlocks((prev) => {
      const oldIndex = prev.findIndex((b) => b.id === active.id);
      const newIndex = prev.findIndex((b) => b.id === over.id);
      const next = arrayMove(prev, oldIndex, newIndex);
      persistOrder(next);
      return next;
    });
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
      toast.success(nextVisible ? "Đã bật hiển thị block!" : "Đã tắt hiển thị block!");
      router.refresh();
    } catch {
      setBlocks((prev) => prev.map((b) => (b.id === block.id ? { ...b, isVisible: block.isVisible } : b)));
      toast.error("Không thể cập nhật. Vui lòng thử lại!");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Bạn có chắc chắn muốn xóa block này?")) return;
    setIsDeletingId(id);
    try {
      const res = await fetch(`/api/admin/page-blocks/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setBlocks((prev) => prev.filter((b) => b.id !== id));
      toast.success("Đã xóa block!");
      router.refresh();
    } catch {
      toast.error("Không thể xóa block. Vui lòng thử lại!");
    } finally {
      setIsDeletingId(null);
    }
  }

  function handleSaved(block: PageBlockItem, isNew: boolean) {
    setBlocks((prev) => (isNew ? [...prev, block] : prev.map((b) => (b.id === block.id ? block : b))));
    setEditingBlock(null);
    setIsAdding(false);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <p className="text-xs text-slate-500">
          Kéo tay cầm để đổi thứ tự. Bấm công tắc để bật/tắt hiển thị trên storefront.
        </p>
        <div className="flex items-center gap-2 shrink-0">
          <select
            value={addType}
            onChange={(e) => setAddType(e.target.value as PageBlockTypeValue)}
            className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold focus:border-brand-forest focus:outline-none bg-white"
          >
            {PAGE_BLOCK_TYPES.map((t) => (
              <option key={t} value={t}>
                {BLOCK_TYPE_LABELS[t]}
              </option>
            ))}
          </select>
          <Button
            onClick={() => setIsAdding(true)}
            className="inline-flex items-center gap-1.5 !bg-brand-forest hover:!bg-brand-forest/90 !text-white text-xs font-bold rounded-xl px-4 py-2 shadow-xs"
          >
            <Plus size={16} />
            Thêm block
          </Button>
        </div>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2.5">
            {blocks.map((block) => (
              <SortableBlockRow
                key={block.id}
                block={block}
                onToggle={() => handleToggleVisible(block)}
                onEdit={() => setEditingBlock(block)}
                onDelete={() => handleDelete(block.id)}
                isDeleting={isDeletingId === block.id}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {blocks.length === 0 && (
        <div className="py-16 text-center bg-white rounded-2xl border border-dashed border-slate-200">
          <div className="text-sm font-bold text-slate-700">Chưa có block nào</div>
          <p className="text-xs text-slate-400 mt-1">Chọn loại block và bấm &quot;Thêm block&quot; để bắt đầu.</p>
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
          }}
          onSaved={(block) => handleSaved(block, !editingBlock)}
        />
      )}
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
        title="Chỉnh sửa"
      >
        <Pencil size={15} />
      </button>
      <button
        type="button"
        onClick={onDelete}
        disabled={isDeleting}
        className="shrink-0 p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-40"
        title="Xóa"
      >
        <Trash2 size={15} />
      </button>
    </div>
  );
}

function blockPreviewText(block: PageBlockItem): string {
  const c = block.content || {};
  if (typeof c.headline === "string") return c.headline;
  if (typeof c.title === "string") return c.title;
  if (typeof c.quote === "string") return c.quote;
  if (Array.isArray(c.items)) return `${c.items.length} mục`;
  if (Array.isArray(c.sections)) return `${c.sections.length} mục`;
  return "";
}
