export type ProductContentBlock =
  | { id: string; type: "paragraph"; content: string }
  | { id: string; type: "heading"; level: 2 | 3; text: string }
  | { id: string; type: "bullet_list"; items: string[] }
  | { id: string; type: "callout"; icon: string; title: string; body: string; variant?: "mint" | "amber" | "blue" }
  | { id: string; type: "quote"; quote: string; quoteRef?: string }
  | { id: string; type: "specs_table"; rows: { label: string; value: string }[] }
  | { id: string; type: "image"; url: string; caption?: string }
  | { id: string; type: "price_note"; text: string; subtext?: string };

export function isProductContentBlocks(raw?: string | null): boolean {
  if (!raw || typeof raw !== "string") return false;
  const trimmed = raw.trim();
  if (!trimmed.startsWith("[") && !trimmed.startsWith("{")) return false;
  try {
    const parsed = JSON.parse(trimmed);
    return Array.isArray(parsed);
  } catch {
    return false;
  }
}

/**
 * Danh sách các khối nội dung chuẩn cho từng sản phẩm:
 * 1. Điểm nổi bật (Heading + Bullet list)
 * 2. Bảng quy đổi size áo (Heading + Specs table)
 * (Lưu ý: Hướng dẫn giặt ủi & bảo quản đã được chuyển sang quản lý tập trung ở Setting Global)
 */
export function getDefaultProductSections(): ProductContentBlock[] {
  const ts = Date.now();
  return [
    {
      id: `default-hl-h-${ts}`,
      type: "heading",
      level: 2,
      text: "Điểm Nổi Bật Của Sản Phẩm",
    },
    {
      id: `default-hl-list-${ts}`,
      type: "bullet_list",
      items: [
        "Chất liệu 100% Cotton 4 chiều, thấm hút mồ hôi tối đa, thoáng mát.",
        "Công nghệ in DTG cao cấp, không nứt gãy hoặc phai màu sau khi giặt.",
        "Form dáng Regular Fit chuẩn Unisex, dễ dàng phối đồ đi học, đi làm, đi nhóm.",
        "Đóng gói chỉn chu kèm bookmark Lời Chúa và thiệp cảm ơn.",
      ],
    },
    {
      id: `default-size-h-${ts}`,
      type: "heading",
      level: 2,
      text: "Bảng Quy Đổi Size Áo Chuẩn",
    },
    {
      id: `default-size-tbl-${ts}`,
      type: "specs_table",
      rows: [
        { label: "Size S", value: "1m50 - 1m62 | 42 - 52 kg | Dài 66cm / Rộng 48cm" },
        { label: "Size M", value: "1m60 - 1m70 | 53 - 62 kg | Dài 69cm / Rộng 51cm" },
        { label: "Size L", value: "1m68 - 1m76 | 63 - 72 kg | Dài 72cm / Rộng 54cm" },
        { label: "Size XL", value: "1m75 - 1m85 | 73 - 85 kg | Dài 75cm / Rộng 57cm" },
      ],
    },
  ];
}

export function parseProductContent(raw?: string | null): ProductContentBlock[] {
  if (isProductContentBlocks(raw)) {
    try {
      const parsed = JSON.parse((raw as string).trim());
      if (Array.isArray(parsed)) {
        return parsed.map((item, idx) => ({
          ...item,
          id: item.id || `block-${idx}-${Date.now()}`,
        }));
      }
    } catch {
      // Fallback below
    }
  }

  // Dữ liệu văn bản thuần legacy hoặc sản phẩm chưa chuyển đổi sang khối:
  // Tự động giữ đoạn mô tả hiện tại và bổ sung trọn vẹn các phần mặc định (Điểm nổi bật, Size, Hướng dẫn giặt)
  const blocks: ProductContentBlock[] = [];
  if (raw && typeof raw === "string" && raw.trim().length > 0) {
    blocks.push({
      id: `legacy-desc-${Date.now()}`,
      type: "paragraph",
      content: raw.trim(),
    });
  }

  return [...blocks, ...getDefaultProductSections()];
}

export function serializeProductContent(blocks: ProductContentBlock[]): string {
  if (!blocks || blocks.length === 0) return "[]";
  return JSON.stringify(blocks);
}
