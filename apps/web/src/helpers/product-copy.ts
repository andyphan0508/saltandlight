import { slugify } from "./slugify";
import type { ProductFormInitial } from "@/interfaces/product-form";

export const COPY_NAME_SUFFIX = " (bản sao)";

/**
 * A saved product as the starting point of a new one (Admin › Sản phẩm › Nhân bản): same
 * description, categories, photos (with their colour tags) and variants, but saved as a new
 * product. No ids, so saving creates rows instead of updating the original; empty SKUs, which
 * the form regenerates from the new slug on save (SKUs are unique); a draft, and not featured,
 * until the admin has reviewed it.
 */
export const toProductCopy = (source: ProductFormInitial): ProductFormInitial => {
  const name = `${source.name}${COPY_NAME_SUFFIX}`;
  return {
    ...source,
    id: undefined,
    name,
    slug: slugify(name),
    status: "draft",
    isFeatured: false,
    images: source.images.map((image) => ({ ...image })),
    variants: source.variants.map(({ id: _id, ...variant }) => ({ ...variant, sku: "" })),
  };
};
