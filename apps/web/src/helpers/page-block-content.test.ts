import { test } from "node:test";
import assert from "node:assert/strict";
import { PAGE_BLOCK_TYPES } from "../interfaces/page-block";
import { defaultContent, sanitizeBlockContent, validateBlockContent } from "./page-block-content";

test("every block type's default content passes validation", () => {
  for (const type of PAGE_BLOCK_TYPES) {
    assert.equal(validateBlockContent(type, sanitizeBlockContent(type, defaultContent(type))), null, type);
  }
});

test("sanitize trims text and drops empty entries before validation", () => {
  const cleaned = sanitizeBlockContent("PROMO_CTA", { bullets: ["  Giao nhanh ", "", "   "] });
  assert.deepEqual(cleaned.bullets, ["Giao nhanh"]);

  const cta = sanitizeBlockContent("CTA_BANNER", { headline: "Mua ngay", buttons: [{ label: "  ", href: "/san-pham" }] });
  assert.equal(validateBlockContent("CTA_BANNER", cta), "Nút số 1 chưa có chữ hiển thị");
});

test("manual product source requires at least one product", () => {
  assert.equal(
    validateBlockContent("FEATURED_PRODUCTS", { headline: "Nổi bật", sourceType: "manual", productIds: [] }),
    "Vui lòng chọn ít nhất 1 sản phẩm từ danh sách",
  );
});
