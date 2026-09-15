import { test } from "node:test";
import assert from "node:assert/strict";
import { normalizeVietnamesePhone } from "./phone";

test("normalizeVietnamesePhone returns a local 0-prefixed number", () => {
  assert.equal(normalizeVietnamesePhone("+84 912 345 678"), "0912345678");
  assert.equal(normalizeVietnamesePhone("(+84) 847 25 2025"), "0847252025");
  assert.equal(normalizeVietnamesePhone("0912.345.678"), "0912345678");
  assert.equal(normalizeVietnamesePhone("912345678"), "0912345678");
  assert.equal(normalizeVietnamesePhone(null), null);
  assert.equal(normalizeVietnamesePhone(""), null);
});
