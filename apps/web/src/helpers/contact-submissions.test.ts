import { test } from "node:test";
import assert from "node:assert/strict";
import { contactStatusOf, contactsFilterHref, normalizeVietnamesePhone } from "./contact-submissions";

test("normalizeVietnamesePhone returns a local 0-prefixed number", () => {
  assert.equal(normalizeVietnamesePhone("+84 912 345 678"), "0912345678");
  assert.equal(normalizeVietnamesePhone("0912.345.678"), "0912345678");
  assert.equal(normalizeVietnamesePhone("912345678"), "0912345678");
  assert.equal(normalizeVietnamesePhone(null), null);
  assert.equal(normalizeVietnamesePhone(""), null);
});

test("contactsFilterHref drops blank and 'all' filters", () => {
  assert.equal(contactsFilterHref({ q: "", status: "all", type: "all" }), "/admin/contacts");
  assert.equal(
    contactsFilterHref({ q: "  Minh ", status: "new", type: "custom_order" }),
    "/admin/contacts?q=Minh&status=new&type=custom_order",
  );
});

test("contactStatusOf falls back to the 'new' status for unknown values", () => {
  assert.equal(contactStatusOf("closed").label, "Đã hoàn tất");
  assert.equal(contactStatusOf("weird").value, "new");
});
