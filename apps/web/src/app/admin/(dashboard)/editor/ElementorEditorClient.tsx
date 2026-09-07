"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@saltandlight/ui";
import {
  Sparkles,
  Layers,
  Pencil,
  Trash2,
  GripVertical,
  Plus,
  RotateCw,
  ExternalLink,
  Monitor,
  Smartphone,
  Eye,
  EyeOff,
  Check,
  ChevronLeft,
} from "@/components/admin/Icons";
import {
  BLOCK_TYPE_LABELS,
  PAGE_BLOCK_TYPES,
  type PageBlockTypeValue,
} from "@/lib/admin/page-block-types";
import { BLOCK_TEMPLATES } from "@/components/admin/BlockPaletteModal";
import { BlockEditForm, defaultContent } from "../page-builder/BlockEditForm";
import type { PageBlockItem } from "../page-builder/BlockList";

const MANAGED_PAGES = [
  { slug: "home", label: "Trang chủ", path: "/" },
  { slug: "gioi-thieu", label: "Giới thiệu", path: "/gioi-thieu" },
  { slug: "lien-he", label: "Liên hệ", path: "/lien-he" },
  { slug: "chinh-sach", label: "Chính sách", path: "/chinh-sach" },
];

const DEFAULT_PAGE_BLOCK_TYPES: Record<string, PageBlockTypeValue[]> = {
  home: ["FEATURE_CARDS", "FEATURED_PRODUCTS", "STORY_BANNER", "PROMO_CTA"],
  "gioi-thieu": ["PAGE_HERO", "STORY_BANNER", "RICH_TEXT_SECTIONS", "CTA_BANNER"],
  "lien-he": ["PAGE_HERO", "CONTACT_INFO", "CTA_BANNER"],
  "chinh-sach": ["PAGE_HERO", "FEATURE_CARDS", "RICH_TEXT_SECTIONS"],
};

export function ElementorEditorClient({
  initialPage = "home",
  initialBlocks = [],
}: {
  initialPage: string;
  initialBlocks: PageBlockItem[];
}) {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [blocks, setBlocks] = useState<PageBlockItem[]>(initialBlocks);
  const [activeTab, setActiveTab] = useState<"navigator" | "edit" | "palette">("navigator");
  const [editingBlock, setEditingBlock] = useState<PageBlockItem | null>(null);
  const [device, setDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [iframeKey, setIframeKey] = useState(0);
  const [iframeReady, setIframeReady] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isSeeding, setIsSeeding] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const pageMeta = MANAGED_PAGES.find((p) => p.slug === currentPage) ?? MANAGED_PAGES[0]!;
  const pageUrl = pageMeta.path;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  // Sync state when page changes via dropdown
  async function switchPage(newSlug: string) {
    if (newSlug === currentPage) return;
    setCurrentPage(newSlug);
    setEditingBlock(null);
    setActiveTab("navigator");
    try {
      const res = await fetch(`/api/admin/page-blocks?page=${newSlug}`);
      if (res.ok) {
        const data = await res.json();
        setBlocks(data.blocks || []);
      }
    } catch {
      toast.error("Không thể tải danh sách khối");
    }
  }

  // Handle postMessage communication from iframe
  useEffect(() => {
    function handleWindowMessage(event: MessageEvent) {
      const data = event.data;
      if (!data || typeof data !== "object") return;

      if (data.type === "storefront:ready") {
        setIframeReady(true);
      } else if (data.type === "block:select" && data.blockId) {
        const target = blocks.find((b) => b.id === data.blockId);
        if (target) {
          setEditingBlock(target);
          setActiveTab("edit");
          toast.info(`Đang chỉnh sửa: ${BLOCK_TYPE_LABELS[target.type] || target.type}`, {
            duration: 2000,
          });
        }
      }
    }

    window.addEventListener("message", handleWindowMessage);
    return () => window.removeEventListener("message", handleWindowMessage);
  }, [blocks]);

  // Reorder persistence
  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = blocks.findIndex((b) => b.id === active.id);
    const newIndex = blocks.findIndex((b) => b.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(blocks, oldIndex, newIndex).map((b, idx) => ({
      ...b,
      sortOrder: idx,
    }));
    setBlocks(reordered);

    try {
      const res = await fetch("/api/admin/page-blocks/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          page: currentPage,
          orderedIds: reordered.map((b) => b.id),
        }),
      });
      if (!res.ok) throw new Error();
      toast.success("Đã cập nhật vị trí khối!");
      // Reload iframe to sync
      setIframeKey((k) => k + 1);
    } catch {
      toast.error("Không thể lưu thứ tự khối");
    }
  }

  // Toggle Visibility
  async function handleToggleVisible(block: PageBlockItem) {
    const nextState = !block.isVisible;
    setBlocks((prev) =>
      prev.map((b) => (b.id === block.id ? { ...b, isVisible: nextState } : b))
    );
    try {
      const res = await fetch(`/api/admin/page-blocks/${block.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isVisible: nextState }),
      });
      if (!res.ok) throw new Error();
      toast.success(nextState ? "Đã hiện khối" : "Đã ẩn khối");
      setIframeKey((k) => k + 1);
    } catch {
      toast.error("Lỗi khi cập nhật trạng thái");
    }
  }

  // Delete Block
  async function handleDeleteBlock(blockId: string) {
    if (!confirm("Bạn có chắc chắn muốn xóa khối này không?")) return;
    setIsDeleting(blockId);
    try {
      const res = await fetch(`/api/admin/page-blocks/${blockId}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setBlocks((prev) => prev.filter((b) => b.id !== blockId));
      if (editingBlock?.id === blockId) {
        setEditingBlock(null);
        setActiveTab("navigator");
      }
      toast.success("Đã xóa khối thành công!");
      setIframeKey((k) => k + 1);
    } catch {
      toast.error("Không thể xóa khối");
    } finally {
      setIsDeleting(null);
    }
  }

  // Add block from palette
  async function handleAddFromPalette(type: PageBlockTypeValue) {
    try {
      const content = defaultContent(type);
      const res = await fetch("/api/admin/page-blocks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ page: currentPage, type, content }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Không thể tạo khối");
      const newBlock = data.block;
      setBlocks((prev) => [...prev, newBlock]);
      setEditingBlock(newBlock);
      setActiveTab("edit");
      toast.success(`Đã thêm khối ${BLOCK_TYPE_LABELS[type]}!`);
      setIframeKey((k) => k + 1);
    } catch (err: any) {
      toast.error(err.message || "Lỗi tạo khối");
    }
  }

  // Seed default blocks if page is empty
  async function handleSeedDefaultBlocks() {
    setIsSeeding(true);
    const typesToSeed =
      DEFAULT_PAGE_BLOCK_TYPES[currentPage] || ["FEATURE_CARDS", "FEATURED_PRODUCTS"];
    try {
      const createdBlocks: PageBlockItem[] = [];
      for (const type of typesToSeed) {
        const content = defaultContent(type);
        const res = await fetch("/api/admin/page-blocks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ page: currentPage, type, content }),
        });
        if (res.ok) {
          const data = await res.json();
          createdBlocks.push(data.block);
        }
      }
      setBlocks((prev) => [...prev, ...createdBlocks]);
      toast.success(`Đã khởi tạo ${createdBlocks.length} khối mẫu chuẩn cho trang!`);
      setIframeKey((k) => k + 1);
    } catch {
      toast.error("Không thể khởi tạo khối mẫu");
    } finally {
      setIsSeeding(false);
    }
  }

  // Live preview message to iframe when form fields change
  function handleLivePreviewChange(content: Record<string, any>) {
    if (editingBlock && iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        {
          type: "block:preview",
          blockId: editingBlock.id,
          content,
        },
        "*"
      );
    }
  }

  // Block saved handler
  function handleBlockSaved(savedBlock: PageBlockItem) {
    setBlocks((prev) =>
      prev.map((b) => (b.id === savedBlock.id ? savedBlock : b))
    );
    setEditingBlock(savedBlock);
    toast.success("Đã lưu khối thành công!");
    // Sync iframe server state
    setIframeKey((k) => k + 1);
  }

  // Scroll to block in canvas
  function scrollToBlockInCanvas(blockId: string) {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        { type: "block:scroll", blockId },
        "*"
      );
    }
  }

  return (
    <div className="flex flex-col h-full w-full bg-slate-900 overflow-hidden select-none">
      {/* 1. Elementor Studio Topbar */}
      <header className="flex items-center justify-between px-4 py-2.5 bg-slate-900 text-white border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-forest text-white shadow-xs">
              <Sparkles size={15} />
            </span>
            <span className="text-xs sm:text-sm font-black tracking-tight text-white hidden sm:inline">
              Elementor Visual Editor
            </span>
          </div>

          {/* Page Selector Dropdown */}
          <div className="flex items-center gap-1.5 bg-slate-800/90 px-3 py-1 rounded-xl border border-slate-700">
            <span className="text-[11px] text-slate-400 font-medium">Trang:</span>
            <select
              value={currentPage}
              onChange={(e) => switchPage(e.target.value)}
              className="bg-transparent text-xs font-bold text-emerald-400 focus:outline-none cursor-pointer"
            >
              {MANAGED_PAGES.map((p) => (
                <option key={p.slug} value={p.slug} className="bg-slate-900 text-white">
                  {p.label} ({p.path})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Device Switcher */}
        <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl border border-slate-700">
          <button
            type="button"
            onClick={() => setDevice("desktop")}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
              device === "desktop"
                ? "bg-brand-forest text-white shadow-xs"
                : "text-slate-400 hover:text-white"
            }`}
            title="Xem trước màn hình Máy tính (100%)"
          >
            <Monitor size={14} />
            <span className="hidden md:inline">Desktop</span>
          </button>
          <button
            type="button"
            onClick={() => setDevice("tablet")}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
              device === "tablet"
                ? "bg-brand-forest text-white shadow-xs"
                : "text-slate-400 hover:text-white"
            }`}
            title="Xem trước máy tính bảng Tablet (768px)"
          >
            <Smartphone size={14} className="rotate-90" />
            <span className="hidden md:inline">Tablet</span>
          </button>
          <button
            type="button"
            onClick={() => setDevice("mobile")}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
              device === "mobile"
                ? "bg-brand-forest text-white shadow-xs"
                : "text-slate-400 hover:text-white"
            }`}
            title="Xem trước điện thoại Mobile (390px)"
          >
            <Smartphone size={14} />
            <span className="hidden md:inline">Mobile</span>
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIframeKey((k) => k + 1)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Tải lại Canvas xem trước"
          >
            <RotateCw size={15} />
          </button>
          <a
            href={pageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Mở storefront thật trong tab mới"
          >
            <ExternalLink size={15} />
          </a>
          <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2.5 py-0.5 rounded-full">
            <Check size={12} /> Live Ready
          </span>
        </div>
      </header>

      {/* 2. Workspace: Left Sidebar + Right Canvas */}
      <div className="flex flex-1 overflow-hidden">
        {/* LEFT COLUMN: Elementor Control Panel */}
        <div className="w-full sm:w-[420px] lg:w-[460px] xl:w-[480px] flex-shrink-0 border-r border-slate-200 bg-white flex flex-col overflow-hidden">
          {/* Panel Tab Navigation */}
          <div className="flex items-center border-b border-slate-200 bg-slate-50/90 px-3 pt-2 shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab("navigator")}
              className={`flex-1 pb-2.5 text-xs font-bold border-b-2 transition-all flex items-center justify-center gap-1.5 ${
                activeTab === "navigator"
                  ? "border-brand-forest text-brand-forest"
                  : "border-transparent text-slate-500 hover:text-slate-900"
              }`}
            >
              <Layers size={14} />
              <span>Cấu trúc ({blocks.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("edit")}
              className={`flex-1 pb-2.5 text-xs font-bold border-b-2 transition-all flex items-center justify-center gap-1.5 ${
                activeTab === "edit"
                  ? "border-brand-forest text-brand-forest"
                  : "border-transparent text-slate-500 hover:text-slate-900"
              }`}
            >
              <Pencil size={14} />
              <span>Chỉnh sửa</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("palette")}
              className={`flex-1 pb-2.5 text-xs font-bold border-b-2 transition-all flex items-center justify-center gap-1.5 ${
                activeTab === "palette"
                  ? "border-brand-forest text-brand-forest"
                  : "border-transparent text-slate-500 hover:text-slate-900"
              }`}
            >
              <Plus size={14} />
              <span>Thêm khối</span>
            </button>
          </div>

          {/* Panel Body Content */}
          <div className="flex-1 overflow-y-auto">
            {/* TAB 1: NAVIGATOR (Sortable block list) */}
            {activeTab === "navigator" && (
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Danh sách khối ({blocks.length})
                  </span>
                  <button
                    type="button"
                    onClick={() => setActiveTab("palette")}
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
                        onClick={handleSeedDefaultBlocks}
                        disabled={isSeeding}
                        className="!bg-brand-forest text-white text-xs font-bold rounded-xl px-4 py-2 w-full shadow-xs active:scale-95 transition-all"
                      >
                        {isSeeding ? "Đang tạo khối..." : "✨ Khởi tạo các khối mẫu chuẩn"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setActiveTab("palette")}
                        className="text-xs font-semibold rounded-xl px-4 py-2 w-full"
                      >
                        Chọn khối từ Thư viện mẫu
                      </Button>
                    </div>
                  </div>
                ) : (
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext
                      items={blocks.map((b) => b.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="space-y-2">
                        {blocks.map((block) => (
                          <ElementorBlockRow
                            key={block.id}
                            block={block}
                            isActive={editingBlock?.id === block.id}
                            onSelect={() => {
                              setEditingBlock(block);
                              setActiveTab("edit");
                              scrollToBlockInCanvas(block.id);
                            }}
                            onToggleVisible={() => handleToggleVisible(block)}
                            onDelete={() => handleDeleteBlock(block.id)}
                            isDeleting={isDeleting === block.id}
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
            )}

            {/* TAB 2: EDIT FORM (Embedded in sidebar) */}
            {activeTab === "edit" && (
              <div className="h-full">
                {editingBlock ? (
                  <BlockEditForm
                    page={currentPage}
                    block={editingBlock}
                    defaultType={editingBlock.type}
                    embedded={true}
                    onClose={() => setActiveTab("navigator")}
                    onSaved={handleBlockSaved}
                    onChangePreview={handleLivePreviewChange}
                  />
                ) : (
                  <div className="py-16 px-6 text-center space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-mint-50 border border-brand-forest/20 flex items-center justify-center mx-auto text-brand-forest">
                      <Pencil size={20} />
                    </div>
                    <h4 className="text-sm font-bold text-slate-800">Chưa chọn khối nào</h4>
                    <p className="text-xs text-slate-500 max-w-xs mx-auto">
                      Vui lòng click vào 1 khối từ tab Cấu trúc hoặc click trực tiếp vào khối trên trang web xem trước để chỉnh sửa.
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setActiveTab("navigator")}
                      className="rounded-xl px-4 py-1.5 text-xs font-semibold"
                    >
                      Xem danh sách khối
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: PALETTE (Block Library) */}
            {activeTab === "palette" && (
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                      Thư viện khối mẫu
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      Chọn khối bạn muốn thêm vào trang web
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab("navigator")}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                  >
                    <ChevronLeft size={16} />
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-2.5">
                  {BLOCK_TEMPLATES.map((tmpl) => {
                    const IconComp = tmpl.icon;
                    return (
                      <div
                        key={tmpl.type}
                        onClick={() => handleAddFromPalette(tmpl.type)}
                        className="group relative flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-3 cursor-pointer hover:border-brand-forest hover:shadow-xs hover:bg-mint-50/40 transition-all text-left"
                      >
                        <span
                          className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105 ${tmpl.iconBg} ${tmpl.iconColor}`}
                        >
                          <IconComp size={18} />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1 mb-0.5">
                            <h5 className="text-xs font-bold text-slate-900 group-hover:text-brand-forest transition-colors truncate">
                              {tmpl.title}
                            </h5>
                            {tmpl.badge && (
                              <span className="rounded-md bg-mint-100 px-1.5 py-0.2 text-[9px] font-bold text-brand-forest shrink-0">
                                {tmpl.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                            {tmpl.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: WYSIWYG LIVE CANVAS IFRAME */}
        <div className="flex-1 bg-slate-950 flex flex-col items-center justify-center p-3 sm:p-5 overflow-auto relative">
          {/* Canvas Container responsive to device */}
          <div
            className={`transition-all duration-300 h-full bg-white rounded-2xl overflow-hidden shadow-2xl flex flex-col relative ${
              device === "mobile"
                ? "w-[390px] border-4 border-slate-700 shadow-brand-forest/20"
                : device === "tablet"
                ? "w-[768px] border-4 border-slate-700 shadow-brand-forest/20"
                : "w-full border border-slate-800"
            }`}
          >
            {/* Top Device status bar for mobile & tablet */}
            {(device === "mobile" || device === "tablet") && (
              <div className="h-5 bg-slate-900 flex items-center justify-center shrink-0">
                <span className="w-16 h-1 rounded-full bg-slate-700" />
              </div>
            )}

            <iframe
              key={iframeKey}
              ref={iframeRef}
              src={`${pageUrl}?editor=1`}
              title="Elementor Live Canvas"
              className="w-full flex-1 border-0 bg-white"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Sortable block row inside Elementor Navigator
function ElementorBlockRow({
  block,
  isActive,
  onSelect,
  onToggleVisible,
  onDelete,
  isDeleting,
}: {
  block: PageBlockItem;
  isActive: boolean;
  onSelect: () => void;
  onToggleVisible: () => void;
  onDelete: () => void;
  isDeleting: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: block.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
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

      <div
        onClick={onSelect}
        className="min-w-0 flex-1 cursor-pointer"
        title="Bấm để chỉnh sửa khối"
      >
        <div className="text-xs font-bold text-slate-800 truncate group-hover:text-brand-forest">
          {BLOCK_TYPE_LABELS[block.type] || block.type}
        </div>
        <div className="text-[10px] text-slate-400 truncate">
          {blockPreviewSnippet(block)}
        </div>
      </div>

      <button
        type="button"
        onClick={onToggleVisible}
        className={`p-1.5 rounded-lg text-xs transition-colors shrink-0 ${
          block.isVisible
            ? "text-emerald-600 hover:bg-emerald-50"
            : "text-slate-400 hover:bg-slate-100"
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
}

function blockPreviewSnippet(block: PageBlockItem): string {
  const c = block.content || {};
  if (typeof c.headline === "string" && c.headline) return c.headline;
  if (typeof c.title === "string" && c.title) return c.title;
  if (typeof c.quote === "string" && c.quote) return c.quote;
  if (c.sourceType === "category" && c.categoryName) return `Danh mục: ${c.categoryName}`;
  if (Array.isArray(c.items)) return `${c.items.length} mục`;
  if (Array.isArray(c.sections)) return `${c.sections.length} phần`;
  return "";
}
