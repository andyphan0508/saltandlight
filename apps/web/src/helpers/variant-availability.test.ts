import { test } from "node:test";
import assert from "node:assert/strict";
import { initialSelection, isColorAvailable, isSizeAvailable, isSoldOut, sizeForColor } from "./variant-availability";

const v = (color: string | null, size: string | null, stockQuantity: number) => ({ color, size, stockQuantity });
const sizes = ["S", "M", "L"];
// Đen: S gone, M/L in stock · Trắng: everything gone
const variants = [v("Đen", "S", 0), v("Đen", "M", 3), v("Đen", "L", 1), v("Trắng", "S", 0), v("Trắng", "M", 0)];

test("one sold-out variant dims its option but doesn't mark the product sold out", () => {
  assert.equal(isSoldOut(variants), false);
  assert.equal(isColorAvailable(variants, "Đen"), true);
  assert.equal(isColorAvailable(variants, "Trắng"), false);
  assert.equal(isSizeAvailable(variants, "S", "Đen"), false);
  assert.equal(isSizeAvailable(variants, "M", "Đen"), true);
  // A size that doesn't exist in this colour at all is unavailable too
  assert.equal(isSizeAvailable(variants, "L", "Trắng"), false);
});

test("the page opens on something buyable, and switching colour keeps a buyable size", () => {
  assert.deepEqual(initialSelection(variants, ["Trắng", "Đen"], sizes), { color: "Đen", size: "M" });
  assert.equal(sizeForColor(variants, sizes, "Đen", "L"), "L", "keeps the current size when it has stock");
  assert.equal(sizeForColor(variants, sizes, "Đen", "S"), "M", "moves off a sold-out size to the smallest in stock");
});

test("only when every variant is gone is the product sold out", () => {
  const gone = variants.map((x) => ({ ...x, stockQuantity: 0 }));
  assert.equal(isSoldOut(gone), true);
  assert.deepEqual(initialSelection(gone, ["Trắng", "Đen"], sizes), { color: "Trắng", size: "S" });
});

test("products without colours judge sizes on their own", () => {
  const plain = [v(null, "S", 0), v(null, "M", 2)];
  assert.equal(isSizeAvailable(plain, "S", null), false);
  assert.deepEqual(initialSelection(plain, [], sizes), { color: null, size: "M" });
});
