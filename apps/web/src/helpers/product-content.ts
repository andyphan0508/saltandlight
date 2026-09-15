/**
 * Product-specific description content, stored as a JSON block array in
 * `Product.description`. Content shared by a whole category (care guides, size
 * charts, highlights) lives in `product-guides.ts` instead.
 */
export type ProductContentBlock =
  | { id: string; type: "paragraph"; content: string }
  | { id: string; type: "heading"; level: 2 | 3; text: string }
  | { id: string; type: "bullet_list"; items: string[] }
  | { id: string; type: "quote"; quote: string; quoteRef?: string }
  | { id: string; type: "image"; url: string; caption?: string }
  | { id: string; type: "price_note"; text: string };

/** Block types added in the description editor (the price note has its own form field). */
export type EditableBlockType = Exclude<ProductContentBlock["type"], "price_note">;

export const DEFAULT_PRICE_NOTE = "Tặng kèm thiệp Lời Chúa & Miễn phí vận chuyển cho đơn từ 299K";

const KNOWN_TYPES = new Set<string>(["paragraph", "heading", "bullet_list", "quote", "image", "price_note"]);

/**
 * Stored description → blocks. Plain-text (legacy) descriptions become a single
 * paragraph; retired block types (callout, specs_table) are dropped.
 */
export const parseProductContent = (raw?: string | null): ProductContentBlock[] => {
  const text = raw?.trim();
  if (!text) return [];
  if (text.startsWith("[")) {
    try {
      const parsed: unknown = JSON.parse(text);
      if (Array.isArray(parsed)) {
        return parsed
          .filter((block) => typeof block?.type === "string" && KNOWN_TYPES.has(block.type))
          .map((block, index) => ({ ...block, id: block.id || `block-${index}` }));
      }
    } catch {
      // Not JSON after all — treat it as plain text below.
    }
  }
  return [{ id: "description", type: "paragraph", content: text }];
};

export const serializeProductContent = (blocks: ProductContentBlock[]): string => {
  return JSON.stringify(blocks);
};

/** Admin-set promo line for the price box; `null` = never set, so the storefront shows DEFAULT_PRICE_NOTE. */
export const readPriceNote = (blocks: ProductContentBlock[]): string | null => {
  for (const block of blocks) if (block.type === "price_note") return block.text;
  return null;
};

/** Replaces any price note with `text`. An empty note is kept so admins can hide the line. */
export const withPriceNote = (blocks: ProductContentBlock[], text: string): ProductContentBlock[] => {
  return [{ id: "price-note", type: "price_note", text: text.trim() }, ...blocks.filter((b) => b.type !== "price_note")];
};

/** First ~160 characters of readable text, for meta descriptions. */
export const contentToPlainText = (blocks: ProductContentBlock[]): string => {
  return blocks
    .map((block) => {
      switch (block.type) {
        case "paragraph":
          return block.content;
        case "heading":
          return block.text;
        case "bullet_list":
          return block.items.join(". ");
        case "quote":
          return block.quote;
        default:
          return "";
      }
    })
    .filter(Boolean)
    .join(" ")
    .slice(0, 160);
};
