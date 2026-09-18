import { test } from "node:test";
import assert from "node:assert/strict";
import { normalizeVietnamesePhone, smsHref } from "./phone";

test("normalizeVietnamesePhone returns a local 0-prefixed number", () => {
  assert.equal(normalizeVietnamesePhone("+84 912 345 678"), "0912345678");
  assert.equal(normalizeVietnamesePhone("(+84) 847 25 2025"), "0847252025");
  assert.equal(normalizeVietnamesePhone("0912.345.678"), "0912345678");
  assert.equal(normalizeVietnamesePhone("912345678"), "0912345678");
  assert.equal(normalizeVietnamesePhone(null), null);
  assert.equal(normalizeVietnamesePhone(""), null);
});

test("smsHref opens Messages with an encoded draft that both iOS and Android read", () => {
  assert.equal(smsHref("0912345678"), "sms:0912345678");
  assert.equal(smsHref("0912345678", "Đơn SL-1 & cảm ơn"), "sms:0912345678?&body=%C4%90%C6%A1n%20SL-1%20%26%20c%E1%BA%A3m%20%C6%A1n");
});
