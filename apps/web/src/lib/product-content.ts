export type ProductContentBlock =
  | { id: string; type: "paragraph"; content: string }
  | { id: string; type: "heading"; level: 2 | 3; text: string }
  | { id: string; type: "bullet_list"; items: string[] }
  | { id: string; type: "callout"; icon: string; title: string; body: string; variant?: "mint" | "amber" | "blue" }
  | { id: string; type: "quote"; quote: string; quoteRef?: string }
  | { id: string; type: "specs_table"; rows: { label: string; value: string }[] }
  | { id: string; type: "image"; url: string; caption?: string };

export function isProductContentBlocks(raw?: string | null): boolean {
  if (!raw || typeof raw !== "string") return false;
  const trimmed = raw.trim();
  if (!trimmed.startsWith("[") && !trimmed.startsWith("{")) return false;
  try {
    const parsed = JSON.parse(trimmed);
    return Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0]?.type === "string";
  } catch {
    return false;
  }
}

export function parseProductContent(raw?: string | null): ProductContentBlock[] {
  if (!raw || typeof raw !== "string") return [];
  const trimmed = raw.trim();
  if (trimmed.startsWith("[") || trimmed.startsWith("{")) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed.map((item, idx) => ({
          ...item,
          id: item.id || `block-${idx}-${Date.now()}`,
        }));
      }
    } catch {
      // Fallback to plain text
    }
  }

  // Legacy plain text: return a single paragraph block
  return [
    {
      id: "legacy-text",
      type: "paragraph",
      content: raw,
    },
  ];
}

export function serializeProductContent(blocks: ProductContentBlock[]): string {
  if (!blocks || blocks.length === 0) return "";
  return JSON.stringify(blocks);
}
