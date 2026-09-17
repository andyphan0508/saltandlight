import { test } from "node:test";
import assert from "node:assert/strict";
import { getAllLocations } from "@saltandlight/domain/vn-locations";
import { buildWardIndex, foldVietnamese, searchWards } from "./ward-search";

const index = buildWardIndex(getAllLocations());
const names = (query: string, limit?: number) => searchWards(index, query, limit).results.map((r) => r.ward);

test("foldVietnamese drops diacritics, including đ, and normalises spacing", () => {
  assert.equal(foldVietnamese("  Phường  Bến Thành "), "phuong ben thanh");
  assert.equal(foldVietnamese("Đặc khu Côn Đảo"), "dac khu con dao");
});

test("typing a letter lists wards whose name starts with it, ignoring the Phường / Xã prefix", () => {
  const results = names("B", 400);
  assert.ok(results.length > 0);
  assert.ok(results.includes("Phường Bến Thành"), "Phường Bến Thành should match B");
  assert.ok(results.includes("Xã Bà Điểm"), "Xã Bà Điểm should match B");
  // Rank-0 matches (name starts with B) come before anything that only contains a b
  const firstNonB = results.findIndex((n) => !foldVietnamese(n).replace(/^(phuong|xa|dac khu) /, "").startsWith("b"));
  if (firstNonB !== -1) {
    assert.ok(results.slice(firstNonB).every((n) => !foldVietnamese(n).replace(/^(phuong|xa|dac khu) /, "").startsWith("b")));
  }
});

test("works without diacritics and narrows by province words", () => {
  assert.equal(names("ben thanh")[0], "Phường Bến Thành");
  const hcm = searchWards(index, "ben thanh ho chi minh").results;
  assert.ok(hcm.length >= 1 && hcm.every((r) => foldVietnamese(r.province).includes("ho chi minh")));
});

test("results carry both codes the order API validates, and are capped with a true total", () => {
  const { results, total } = searchWards(index, "a", 30);
  assert.equal(results.length, 30);
  assert.ok(total > 30);
  for (const r of results) assert.ok(Number.isInteger(r.provinceCode) && Number.isInteger(r.wardCode));
  assert.deepEqual(searchWards(index, "   "), { results: [], total: 0 });
  assert.deepEqual(names("zzzqqq"), []);
});
