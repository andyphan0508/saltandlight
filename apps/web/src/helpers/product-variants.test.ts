import { test } from "node:test";
import assert from "node:assert/strict";
import { applyDiscount, buildVariantCombos, clearDiscount, skuify } from "./product-variants";

test("buildVariantCombos crosses colors with sizes sorted small to large, carrying each swatch", () => {
  const colors = [
    { name: "Đen", hex: "#111111" },
    { name: "Trắng", hex: "#FFFFFF" },
  ];
  assert.deepEqual(buildVariantCombos(colors, "L, S"), [
    { color: "Đen", colorHex: "#111111", size: "S" },
    { color: "Đen", colorHex: "#111111", size: "L" },
    { color: "Trắng", colorHex: "#FFFFFF", size: "S" },
    { color: "Trắng", colorHex: "#FFFFFF", size: "L" },
  ]);
  assert.deepEqual(buildVariantCombos([], " M "), [{ color: "", colorHex: "", size: "M" }]);
  assert.deepEqual(buildVariantCombos([{ name: "Mint", hex: "#A8E6CF" }], ""), [
    { color: "Mint", colorHex: "#A8E6CF", size: "" },
  ]);
  assert.deepEqual(buildVariantCombos([], ""), []);
});

test("discounts apply from the list price and clearing restores it", () => {
  const variants = [
    { price: 199000, compareAtPrice: null },
    { price: 150000, compareAtPrice: 250000 },
  ];
  const discounted = applyDiscount(variants, "percent", 20);
  assert.deepEqual(
    discounted.map((v) => [v.price, v.compareAtPrice]),
    [
      [159000, 199000],
      [200000, 250000],
    ],
  );
  assert.deepEqual(applyDiscount(variants, "fixed", 300000).map((v) => v.price), [0, 0]);
  assert.deepEqual(clearDiscount(discounted), [
    { price: 199000, compareAtPrice: null },
    { price: 250000, compareAtPrice: null },
  ]);
});

test("skuify joins slugged parts in uppercase and skips blanks", () => {
  assert.equal(skuify("ao-thun", "", "M"), "AO-THUN-M");
});
