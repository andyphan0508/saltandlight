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

/** How the products sit next to (or under) the image: fixed columns, or one scrolling row. */
export const PRODUCT_ARRANGEMENTS = ["2", "3", "4", "slider"] as const;
export type ProductArrangement = (typeof PRODUCT_ARRANGEMENTS)[number];

export const readArrangement = (value: unknown): ProductArrangement => {
  // Older content stored the column count as a number, so compare as strings
  const raw = String(value ?? "");
  return PRODUCT_ARRANGEMENTS.includes(raw as ProductArrangement) ? (raw as ProductArrangement) : "4";
};

/**
 * True when products should render as a horizontal rail instead of a grid. The
 * "image-left" preset always rails: a wrapping grid beside a single image makes
 * the two columns different heights, which is exactly the dead space this
 * preset is meant to avoid.
 */
export const isRail = (layout: ProductBlockLayout, columns: unknown): boolean =>
  layout === "slider" || layout === "image-left" || readArrangement(columns) === "slider";

/**
 * Columns handed to <ProductGrid>. Only consulted when {@link isRail} is false,
 * so "slider" collapses to the 4-column default it will never use.
 */
export const gridViewFor = (layout: ProductBlockLayout, columns: unknown): GridView => {
  const arrangement = readArrangement(columns);
  return arrangement === "slider" ? "4" : arrangement;
};
