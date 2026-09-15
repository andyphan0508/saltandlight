"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Eye, EyeOff, GripVertical, Pencil, Trash2 } from "@/components/admin/Icons";
import { blockPreviewSnippet } from "@/helpers/page-block-preview";
import { BLOCK_TYPE_LABELS, type PageBlockItem } from "@/interfaces/page-block";

interface BlockRowProps {
  block: PageBlockItem;
  isActive: boolean;
  isDeleting: boolean;
  onSelect: () => void;
  onToggleVisible: () => void;
  onDelete: () => void;
}

/** Sortable navigator row: drag handle, block summary, visibility, edit and delete actions. */
export const BlockRow = ({ block, isActive, isDeleting, onSelect, onToggleVisible, onDelete }: BlockRowProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`group flex items-center gap-2 rounded-xl border p-2.5 transition-all text-left ${
        isDragging
          ? "border-brand-forest shadow-md bg-white z-20"
          : isActive
            ? "border-brand-forest bg-mint-50/50 shadow-xs ring-2 ring-brand-forest/20"
            : "border-slate-200 bg-white hover:border-slate-300"
      } ${!block.isVisible ? "opacity-60" : ""}`}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing p-1 text-slate-400 hover:text-slate-700 shrink-0"
        title="Kéo thả để sắp xếp vị trí"
      >
        <GripVertical size={16} />
      </button>

      <div onClick={onSelect} className="min-w-0 flex-1 cursor-pointer" title="Bấm để chỉnh sửa khối">
        <div className="text-xs font-bold text-slate-800 truncate group-hover:text-brand-forest">
          {BLOCK_TYPE_LABELS[block.type] || block.type}
        </div>
        <div className="text-[10px] text-slate-400 truncate">{blockPreviewSnippet(block)}</div>
      </div>

      <button
        type="button"
        onClick={onToggleVisible}
        className={`p-1.5 rounded-lg text-xs transition-colors shrink-0 ${
          block.isVisible ? "text-emerald-600 hover:bg-emerald-50" : "text-slate-400 hover:bg-slate-100"
        }`}
        title={block.isVisible ? "Khối đang hiển thị (Bấm để ẩn)" : "Khối đang ẩn (Bấm để hiện)"}
      >
        {block.isVisible ? <Eye size={14} /> : <EyeOff size={14} />}
      </button>

      <button
        type="button"
        onClick={onSelect}
        className="p-1.5 rounded-lg text-slate-400 hover:text-brand-forest hover:bg-mint-50 transition-colors shrink-0"
        title="Chỉnh sửa khối"
      >
        <Pencil size={13} />
      </button>

      <button
        type="button"
        onClick={onDelete}
        disabled={isDeleting}
        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors shrink-0 disabled:opacity-30"
        title="Xóa khối"
      >
        <Trash2 size={13} />
      </button>
    </div>
  );
};
