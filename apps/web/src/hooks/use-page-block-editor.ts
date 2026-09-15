import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { arrayMove } from "@dnd-kit/sortable";
import { adminFetch } from "@/api/admin-fetch";
import { defaultContent } from "@/helpers/page-block-content";
import { findBlockFromPreviewMessage } from "@/helpers/page-block-preview";
import { BLOCK_TYPE_LABELS, type PageBlockItem, type PageBlockTypeValue } from "@/interfaces/page-block";

export type EditorTab = "navigator" | "edit" | "palette";

// Only used when the seed-defaults endpoint has no preset for the page
const FALLBACK_BLOCK_TYPES: Record<string, PageBlockTypeValue[]> = {
  home: ["FEATURE_CARDS", "FEATURED_PRODUCTS", "STORY_BANNER", "PROMO_CTA"],
  "gioi-thieu": ["PAGE_HERO", "STORY_BANNER", "RICH_TEXT_SECTIONS", "CTA_BANNER"],
  "lien-he": ["PAGE_HERO", "CONTACT_INFO", "CTA_BANNER"],
  "chinh-sach": ["PAGE_HERO", "FEATURE_CARDS", "RICH_TEXT_SECTIONS"],
  "dat-theo-yeu-cau": ["PAGE_HERO", "FEATURE_CARDS", "RICH_TEXT_SECTIONS", "CTA_BANNER"],
};

const createBlock = (page: string, type: PageBlockTypeValue) =>
  adminFetch<{ block: PageBlockItem }>("/api/admin/page-blocks", {
    method: "POST",
    body: { page, type, content: defaultContent(type) },
  }).then((data) => data.block);

interface UsePageBlockEditorOptions {
  initialPage: string;
  initialBlocks: PageBlockItem[];
}

/** Live Editor state: the page's blocks, the selected block and every action that persists changes. */
export const usePageBlockEditor = ({ initialPage, initialBlocks }: UsePageBlockEditorOptions) => {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [blocks, setBlocks] = useState<PageBlockItem[]>(initialBlocks);
  const [activeTab, setActiveTab] = useState<EditorTab>("navigator");
  const [editingBlock, setEditingBlock] = useState<PageBlockItem | null>(null);
  const [previewVersion, setPreviewVersion] = useState(0);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isSeeding, setIsSeeding] = useState(false);
  const [isReordering, setIsReordering] = useState(false);

  const onReloadPreview = () => setPreviewVersion((v) => v + 1);

  const onEditBlock = (block: PageBlockItem) => {
    setEditingBlock(block);
    setActiveTab("edit");
  };

  // Clicking a block inside the storefront preview posts `block:select`
  useEffect(() => {
    const onWindowMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      const data = event.data;
      if (!data || typeof data !== "object" || data.type !== "block:select") return;
      const target = findBlockFromPreviewMessage(blocks, data);
      if (!target) return;
      setEditingBlock(target);
      setActiveTab("edit");
      toast.info(`Đang chỉnh sửa: ${BLOCK_TYPE_LABELS[target.type] || target.type}`, { duration: 2000 });
    };
    window.addEventListener("message", onWindowMessage);
    return () => window.removeEventListener("message", onWindowMessage);
  }, [blocks]);

  const onSwitchPage = async (page: string) => {
    if (page === currentPage) return;
    setCurrentPage(page);
    setEditingBlock(null);
    setActiveTab("navigator");
    router.replace(`/admin/editor?page=${page}`, { scroll: false });
    try {
      const data = await adminFetch<{ blocks?: PageBlockItem[] }>(`/api/admin/page-blocks?page=${page}`);
      setBlocks(data.blocks ?? []);
    } catch {
      toast.error("Không thể tải danh sách khối");
    }
  };

  const onReorder = async (activeId: string, overId: string) => {
    if (activeId === overId || isReordering) return;
    const oldIndex = blocks.findIndex((b) => b.id === activeId);
    const newIndex = blocks.findIndex((b) => b.id === overId);
    if (oldIndex === -1 || newIndex === -1) return;

    const previousBlocks = blocks;
    const reordered = arrayMove(blocks, oldIndex, newIndex).map((b, idx) => ({ ...b, sortOrder: idx }));
    setBlocks(reordered);
    setIsReordering(true);
    try {
      await adminFetch("/api/admin/page-blocks/reorder", {
        method: "POST",
        body: { page: currentPage, orderedIds: reordered.map((b) => b.id) },
      });
      toast.success("Đã cập nhật vị trí khối!");
      onReloadPreview();
    } catch (err) {
      setBlocks(previousBlocks);
      toast.error(err instanceof Error ? err.message : "Không thể lưu thứ tự khối");
    } finally {
      setIsReordering(false);
    }
  };

  const onToggleVisible = async (block: PageBlockItem) => {
    const isNextVisible = !block.isVisible;
    const setVisible = (isVisible: boolean) =>
      setBlocks((prev) => prev.map((b) => (b.id === block.id ? { ...b, isVisible } : b)));
    setVisible(isNextVisible);
    try {
      await adminFetch(`/api/admin/page-blocks/${block.id}`, { method: "PATCH", body: { isVisible: isNextVisible } });
      toast.success(isNextVisible ? "Đã hiện khối" : "Đã ẩn khối");
      onReloadPreview();
    } catch {
      setVisible(block.isVisible);
      toast.error("Lỗi khi cập nhật trạng thái");
    }
  };

  const onDeleteBlock = async (blockId: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa khối này không?")) return;
    setDeletingId(blockId);
    try {
      await adminFetch(`/api/admin/page-blocks/${blockId}`, { method: "DELETE" });
      setBlocks((prev) => prev.filter((b) => b.id !== blockId));
      if (editingBlock?.id === blockId) {
        setEditingBlock(null);
        setActiveTab("navigator");
      }
      toast.success("Đã xóa khối thành công!");
      onReloadPreview();
    } catch {
      toast.error("Không thể xóa khối");
    } finally {
      setDeletingId(null);
    }
  };

  const onAddBlock = async (type: PageBlockTypeValue) => {
    try {
      const block = await createBlock(currentPage, type);
      setBlocks((prev) => [...prev, block]);
      onEditBlock(block);
      toast.success(`Đã thêm khối ${BLOCK_TYPE_LABELS[type]}!`);
      onReloadPreview();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Lỗi tạo khối");
    }
  };

  const onSeedDefaultBlocks = async () => {
    setIsSeeding(true);
    try {
      // Prefer the server's pre-configured templates for this page
      const seeded = await adminFetch<{ blocks?: PageBlockItem[] }>("/api/admin/page-blocks/seed-defaults", {
        method: "POST",
        body: { page: currentPage },
      }).catch(() => null);

      let created = seeded?.blocks ?? [];
      if (created.length === 0) {
        created = [];
        for (const type of FALLBACK_BLOCK_TYPES[currentPage] ?? ["FEATURE_CARDS", "FEATURED_PRODUCTS"]) {
          const block = await createBlock(currentPage, type).catch(() => null);
          if (block) created.push(block);
        }
      }
      const newBlocks = created;
      setBlocks((prev) => [...prev, ...newBlocks]);
      toast.success(`Đã khởi tạo ${newBlocks.length} khối mẫu chuẩn cho trang!`);
      onReloadPreview();
    } catch {
      toast.error("Không thể khởi tạo khối mẫu");
    } finally {
      setIsSeeding(false);
    }
  };

  const onBlockSaved = (saved: PageBlockItem) => {
    setBlocks((prev) => prev.map((b) => (b.id === saved.id ? saved : b)));
    setEditingBlock(saved);
    toast.success("Đã lưu khối thành công!");
    onReloadPreview();
  };

  return {
    currentPage,
    blocks,
    activeTab,
    editingBlock,
    previewVersion,
    deletingId,
    isSeeding,
    setActiveTab,
    onReloadPreview,
    onEditBlock,
    onSwitchPage,
    onReorder,
    onToggleVisible,
    onDeleteBlock,
    onAddBlock,
    onSeedDefaultBlocks,
    onBlockSaved,
  };
};
