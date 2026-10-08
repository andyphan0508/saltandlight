import { test } from "node:test";
import assert from "node:assert/strict";
import { toProductCopy } from "./product-copy";
import type { ProductFormInitial } from "@/interfaces/product-form";

const source: ProductFormInitial = {
  id: "7c9e6679-7425-40de-944b-e07fc1f90ae7",
  name: "Áo thun Team Jesus",
  slug: "ao-thun-team-jesus",
  description: "[]",
  categoryId: "cat-tee",
  categoryIds: ["cat-tee", "cat-xmas"],
  status: "published",
  isNew: true,
  isFeatured: true,
  images: [{ url: "https://x.supabase.co/a.webp", sortOrder: 0, color: "Trắng" }],
  variants: [
    {
      id: "v1",
      sku: "AO-THUN-TEAM-JESUS-TRANG-M",
      color: "Trắng",
      colorHex: "#ffffff",
      size: "M",
      price: 189000,
      compareAtPrice: 229000,
      stockQuantity: 12,
      isActive: true,
    },
  ],
};

test("toProductCopy makes a new draft that saves as a separate product", () => {
  const copy = toProductCopy(source);
  assert.equal(copy.id, undefined);
  assert.equal(copy.name, "Áo thun Team Jesus (bản sao)");
  assert.notEqual(copy.slug, source.slug);
  assert.equal(copy.status, "draft");
  assert.equal(copy.isFeatured, false);
  // Variants: no id (would update the original's rows), no SKU (unique — regenerated on save)
  assert.equal("id" in copy.variants[0]!, false);
  assert.equal(copy.variants[0]!.sku, "");
  assert.equal(copy.variants[0]!.price, 189000);
  // Everything else carries over, photo colour tags included
  assert.deepEqual(copy.categoryIds, source.categoryIds);
  assert.deepEqual(copy.images, source.images);
  assert.equal(copy.isNew, true);
  // The original is left untouched
  assert.equal(source.variants[0]!.sku, "AO-THUN-TEAM-JESUS-TRANG-M");
});
