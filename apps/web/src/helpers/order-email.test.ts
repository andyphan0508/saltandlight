import { test } from "node:test";
import assert from "node:assert/strict";
import { DEFAULT_ORDER_EMAIL, SAMPLE_ORDER, renderOrderEmail, textOn } from "./order-email";

const render = (patch: Partial<typeof DEFAULT_ORDER_EMAIL> = {}, order = SAMPLE_ORDER) =>
  renderOrderEmail({ template: { ...DEFAULT_ORDER_EMAIL, ...patch }, order, siteUrl: "https://shop.vn/", logoUrl: null });

test("tokens are filled in the subject, text and the button link", () => {
  const { subject, html } = render();
  assert.equal(subject, "Salt & Light đã nhận đơn SL-2026-000142");
  assert.ok(html.includes("Cảm ơn Minh Anh!"));
  assert.ok(html.includes('href="https://shop.vn/tra-cuu-don-hang?order=SL-2026-000142"'));
});

test("customer and admin text is escaped, never injected as HTML", () => {
  const { html } = render(
    { title: "<script>x</script>", content: 'a "quote" & <b>b</b>' },
    { ...SAMPLE_ORDER, customerName: "<img src=x onerror=alert(1)>", items: [{ name: "<i>Áo</i>", variant: "", quantity: 1, unitPrice: 1 }] },
  );
  assert.ok(!html.includes("<script>x"));
  assert.ok(!html.includes("<img src=x"));
  assert.ok(!html.includes("<i>Áo"));
  assert.ok(html.includes("&#60;b&#62;b&#60;/b&#62;"));
});

test("a bad colour or a path off the site falls back instead of breaking the email", () => {
  const { html } = render({ accentColor: "red;background:url(x)", buttonPath: "https://evil.com" });
  assert.ok(!html.includes("url(x)"));
  assert.ok(html.includes(`background:${DEFAULT_ORDER_EMAIL.accentColor}`));
  assert.ok(html.includes('href="https://shop.vn/"'));
});

test("blank lines make paragraphs", () => {
  const { html } = render({ content: "Một\nhai\n\nBa" });
  assert.ok(html.includes(">Một<br>hai</p>"));
  assert.ok(html.includes(">Ba</p>"));
});

test("button text picks white or ink by the fill", () => {
  assert.equal(textOn("#133e2b"), "#ffffff");
  assert.equal(textOn("#fde68a"), "#18181b");
});
