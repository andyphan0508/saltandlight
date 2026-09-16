/**
 * Layout presets for the FEATURED_PRODUCTS / PRODUCT_LIST blocks. Each preset is
 * a fixed arrangement rather than a free-form grid: the admin picks one and the
 * responsive behaviour (what stacks on a phone) is already decided, so no
 * layout an admin can build here can break on mobile.
 */
export const PRODUCT_BLOCK_LAYOUTS = [
  { id: "grid", label: "Lưới sản phẩm", hint: "Các sản phẩm xếp đều thành hàng cột." },
  { id: "slider", label: "Thanh trượt ngang", hint: "Lướt qua lại, hợp khi có nhiều sản phẩm." },
  { id: "banner-top", label: "Banner trên + lưới dưới", hint: "Một ảnh ngang phía trên, sản phẩm nằm dưới." },
  { id: "image-left", label: "Ảnh lớn trái + lưới phải", hint: "Ảnh dọc bên trái, lưới sản phẩm bên phải." },
] as const;

export type ProductBlockLayout = (typeof PRODUCT_BLOCK_LAYOUTS)[number]["id"];

const LAYOUT_IDS = PRODUCT_BLOCK_LAYOUTS.map((l) => l.id) as readonly string[];

/** Falls back to the plain grid for content saved before presets existed, or for a bad value. */
export const readLayout = (value: unknown): ProductBlockLayout =>
  typeof value === "string" && LAYOUT_IDS.includes(value) ? (value as ProductBlockLayout) : "grid";

/** Only these two presets show the admin's image slot. */
export const layoutUsesImage = (layout: ProductBlockLayout) => layout === "banner-top" || layout === "image-left";

export type GridView = "2" | "3" | "4";

/**
 * Columns handed to <ProductGrid>. "image-left" only has half the row, so it is
 * capped at 2 columns no matter what the admin picked — that cap is the whole
 * reason this lives in a function instead of inline in the block.
 */
export const gridViewFor = (layout: ProductBlockLayout, columns: unknown): GridView => {
  const requested = String(columns ?? "4");
  const view: GridView = requested === "2" || requested === "3" ? requested : "4";
  if (layout === "image-left") return "2";
  return view;
};
