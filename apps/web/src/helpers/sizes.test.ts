import { test } from "node:test";
import assert from "node:assert/strict";
import { sortSizes } from "@saltandlight/domain";

test("sortSizes orders baby → adult → free size, strips a 'Size' prefix, and puts unknown sizes last", () => {
  assert.deepEqual(sortSizes(["XL", "S (baby)", "3XL", "M", "Size XS (baby)", "Free size", "2XL"]), [
    "Size XS (baby)",
    "S (baby)",
    "M",
    "XL",
    "2XL",
    "3XL",
    "Free size",
  ]);
  assert.deepEqual(sortSizes(["L", "Custom B", "Custom A"]), ["L", "Custom A", "Custom B"]);
});

test("the whole XXS → XXL scale sorts small to large, whichever way it is spelled", () => {
  assert.deepEqual(sortSizes(["XXL", "M", "XXS", "L", "XS", "XL", "S"]), [
    "XXS",
    "XS",
    "S",
    "M",
    "L",
    "XL",
    "XXL",
  ]);
  // Sizes nobody put in a list before still land in place
  assert.deepEqual(sortSizes(["4XL", "XXXS", "M"]), ["XXXS", "M", "4XL"]);
  // The real catalog case: the smallest baby size used to fall to the very end
  assert.deepEqual(sortSizes(["M (baby)", "XXS (baby)", "S (baby)", "XS (baby)"]), [
    "XXS (baby)",
    "XS (baby)",
    "S (baby)",
    "M (baby)",
  ]);
});
