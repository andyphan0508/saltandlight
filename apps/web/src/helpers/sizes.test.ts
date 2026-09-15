import { test } from "node:test";
import assert from "node:assert/strict";
import { sortSizes } from "@saltandlight/domain";

test("sortSizes orders baby → adult → oversize, strips a 'Size' prefix, and puts unknown sizes last", () => {
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
