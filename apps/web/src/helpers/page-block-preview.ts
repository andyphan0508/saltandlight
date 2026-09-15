import type { PageBlockItem } from "@/interfaces/page-block";

/**
 * Resolves which block a `block:select` message from the storefront preview refers to:
 * exact id first, then block type, then the legacy fallback ids ("…hero…", "…step…", "…card…").
 */
export const findBlockFromPreviewMessage = (
  blocks: PageBlockItem[],
  data: { blockId?: unknown; blockType?: unknown },
): PageBlockItem | null => {
  const blockId = typeof data.blockId === "string" ? data.blockId : undefined;
  const byId = blockId ? blocks.find((b) => b.id === blockId) : undefined;
  if (byId) return byId;

  const byType = data.blockType ? blocks.find((b) => b.type === data.blockType) : undefined;
  if (byType) return byType;

  if (blockId?.includes("hero")) return blocks.find((b) => b.type === "PAGE_HERO") ?? null;
  if (blockId?.includes("step") || blockId?.includes("card")) return blocks.find((b) => b.type === "FEATURE_CARDS") ?? null;
  return null;
};

/** One-line summary of a block's content for the navigator list. */
export const blockPreviewSnippet = (block: PageBlockItem): string => {
  const content = block.content || {};
  if (typeof content.headline === "string" && content.headline) return content.headline;
  if (typeof content.title === "string" && content.title) return content.title;
  if (typeof content.quote === "string" && content.quote) return content.quote;
  if (content.sourceType === "category" && content.categoryName) return `Danh mục: ${content.categoryName}`;
  if (Array.isArray(content.items)) return `${content.items.length} mục`;
  if (Array.isArray(content.sections)) return `${content.sections.length} phần`;
  return "";
};
