import { test } from "node:test";
import assert from "node:assert/strict";
import { groupVariantsByColor } from "./variant-groups";
import type { VariantRow } from "@/interfaces/product-form";

const variant = (color: string, colorHex: string, size: string): VariantRow => ({
  sku: `SKU-${color}-${size}`,
  color,
  colorHex,
  size,
  price: 155000,
  compareAtPrice: null,
  stockQuantity: 50,
  isActive: true,
});

test("groupVariantsByColor keeps first-seen order and the original row indexes", () => {
  const variants = [
    variant("Đen", "#111111", "S"),
    variant("Trắng", "#FFFFFF", "S"),
    variant("Đen", "#111111", "M"),
  ];
  const groups = groupVariantsByColor(variants);

  assert.deepEqual(
    groups.map((g) => g.color),
    ["Đen", "Trắng"],
  );
  // "Đen" rows keep indexes 0 and 2 even though they are not adjacent
  assert.deepEqual(groups[0]!.rows.map((r) => r.index), [0, 2]);
  assert.deepEqual(groups[0]!.rows.map((r) => r.size), ["S", "M"]);
  assert.deepEqual(groups[1]!.rows.map((r) => r.index), [1]);
});

test("a group takes the first swatch any of its rows carries, and colorless rows group together", () => {
  const groups = groupVariantsByColor([
    { ...variant("Mint", "", "S") },
    { ...variant("Mint", "#A8E6CF", "M") },
    { ...variant("", "", "XS") },
    { ...variant("", "", "S") },
  ]);

  assert.equal(groups[0]!.colorHex, "#A8E6CF");
  assert.equal(groups[1]!.color, "");
  assert.equal(groups[1]!.rows.length, 2);
});
