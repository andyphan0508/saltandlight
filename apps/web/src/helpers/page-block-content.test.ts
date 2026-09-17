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

test("the seeded contact / custom-order forms and intro stories pass their own validation", async () => {
  const seeds = await import("./page-block-seeds");
  assert.equal(validateBlockContent("CONTACT_FORM", seeds.CUSTOM_ORDER_FORM_CONTENT), null);
  assert.equal(validateBlockContent("CONTACT_FORM", seeds.CONTACT_PAGE_FORM_CONTENT), null);
  assert.equal(validateBlockContent("INTRO_STORY", seeds.HOME_INTRO_CONTENT), null);
  assert.equal(validateBlockContent("INTRO_STORY", seeds.ABOUT_STORY_CONTENT), null);
  // New blocks added from the library start valid too
  assert.equal(validateBlockContent("CONTACT_FORM", defaultContent("CONTACT_FORM")), null);
  assert.equal(validateBlockContent("INTRO_STORY", defaultContent("INTRO_STORY")), null);
});

test("new block types reject what would render broken, and drop blank list entries", () => {
  assert.match(validateBlockContent("CONTACT_FORM", { headline: " " }) ?? "", /tiêu đề/);
  assert.match(
    validateBlockContent("CONTACT_FORM", { headline: "Form", aside: "contact_info", contactItems: [{ label: "Hotline", value: "" }] }) ?? "",
    /số 1/,
  );
  assert.match(validateBlockContent("INTRO_STORY", { headline: "X", buttons: [{ label: "Mua", href: "" }] }) ?? "", /Nút số 1/);

  const form = sanitizeBlockContent("CONTACT_FORM", { headline: "F", asideItems: [" Giao nhanh ", "", "  "] });
  assert.deepEqual(form.asideItems, ["Giao nhanh"]);
  const story = sanitizeBlockContent("INTRO_STORY", { headline: "S", buttons: [{ label: "", href: "" }, { label: " Mua ", href: " /san-pham " }] });
  assert.deepEqual(story.buttons, [{ label: "Mua", href: "/san-pham" }]);
});

test("library defaults are copies, so editing one block can't mutate the shared seed", () => {
  const a = defaultContent("CONTACT_FORM");
  a.contactItems.push({ label: "x" });
  assert.notEqual(defaultContent("CONTACT_FORM").contactItems.length, a.contactItems.length);
});
