import { test } from "node:test";
import assert from "node:assert/strict";
import { applyDiscount, buildVariantCombos, clearDiscount, skuify } from "./product-variants";

test("buildVariantCombos crosses colors with sizes sorted small to large", () => {
  assert.deepEqual(buildVariantCombos("Đen, Trắng", "L, S"), [
    { color: "Đen", size: "S" },
    { color: "Đen", size: "L" },
    { color: "Trắng", size: "S" },
    { color: "Trắng", size: "L" },
  ]);
  assert.deepEqual(buildVariantCombos("", " M "), [{ color: "", size: "M" }]);
  assert.deepEqual(buildVariantCombos(" ", ""), []);
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
