"use client";

import { DndContext, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Button } from "@saltandlight/ui";
import { Plus, Sparkles } from "@/components/admin/Icons";
import type { PageBlockItem } from "@/interfaces/page-block";
import { BlockRow } from "./BlockRow";

interface BlockNavigatorProps {
  blocks: PageBlockItem[];
  editingBlockId: string | undefined;
  deletingId: string | null;
  isSeeding: boolean;
  onReorder: (activeId: string, overId: string) => void;
  onSelect: (block: PageBlockItem) => void;
  onToggleVisible: (block: PageBlockItem) => void;
  onDelete: (blockId: string) => void;
  onSeedDefaults: () => void;
  onOpenLibrary: () => void;
}

/** Sortable list of the page's blocks, or a starter panel when the page has none. */
export const BlockNavigator = ({
  blocks,
  editingBlockId,
  deletingId,
  isSeeding,
  onReorder,
  onSelect,
  onToggleVisible,
  onDelete,
  onSeedDefaults,
  onOpenLibrary,
}: BlockNavigatorProps) => {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  return (
    <div className="p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Danh sách khối ({blocks.length})</span>
        <button
          type="button"
          onClick={onOpenLibrary}
          className="inline-flex items-center gap-1 text-xs font-bold text-brand-forest hover:underline"
        >
          <Plus size={13} /> Thêm mới
        </button>
      </div>

      {blocks.length === 0 ? (
        <div className="py-10 text-center rounded-2xl border border-dashed border-slate-300 p-5 space-y-3 bg-slate-50/50">
          <div className="w-10 h-10 rounded-2xl bg-mint-100 flex items-center justify-center mx-auto text-brand-forest">
            <Sparkles size={20} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-800">Trang chưa có khối nào</p>
            <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
              Bạn có thể khởi tạo nhanh bộ khối chuẩn hoặc chọn thêm từng khối từ thư viện.
            </p>
          </div>
          <div className="flex flex-col gap-2 pt-2">
            <Button
              type="button"
              onClick={onSeedDefaults}
              disabled={isSeeding}
              className="!bg-brand-forest text-white text-xs font-bold rounded-xl px-4 py-2 w-full shadow-xs active:scale-95 transition-all"
            >
              {isSeeding ? "Đang tạo khối..." : "✨ Khởi tạo các khối mẫu chuẩn"}
            </Button>
            <Button type="button" variant="outline" onClick={onOpenLibrary} className="text-xs font-semibold rounded-xl px-4 py-2 w-full">
              Chọn khối từ Thư viện mẫu
            </Button>
          </div>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={({ active, over }) => over && onReorder(String(active.id), String(over.id))}
        >
          <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {blocks.map((block) => (
                <BlockRow
                  key={block.id}
                  block={block}
                  isActive={editingBlockId === block.id}
                  isDeleting={deletingId === block.id}
                  onSelect={() => onSelect(block)}
                  onToggleVisible={() => onToggleVisible(block)}
                  onDelete={() => onDelete(block.id)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <div className="pt-3 border-t border-slate-100">
        <p className="text-[11px] text-slate-400 italic text-center">
          💡 Mẹo: Bấm trực tiếp vào bất kỳ khối nào trên trang web bên phải để chỉnh sửa ngay lập tức!
        </p>
      </div>
    </div>
  );
};
