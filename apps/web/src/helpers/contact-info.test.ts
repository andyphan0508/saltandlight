import { test } from "node:test";
import assert from "node:assert/strict";
import { findZaloLink, resolveContactInfo, withZaloLink } from "./contact-info";

const base = {
  footerPhone: "(+84) 847 25 2025",
  footerEmail: "shop@example.com",
  footerAddress: "HCM",
  footerSocialLinks: [{ platform: "Facebook", url: "https://facebook.com/shop" }],
};

test("without a Zalo entry, Zalo reuses the hotline", () => {
  const info = resolveContactInfo(base);
  assert.equal(info.telHref, "tel:0847252025");
  assert.equal(info.zaloHref, "https://zalo.me/0847252025");
  assert.equal(info.hasCustomZalo, false);
  assert.equal(info.mailHref, "mailto:shop@example.com");
});

test("a Zalo entry wins, whichever way the admin typed it", () => {
  const withLink = (url: string) =>
    resolveContactInfo({ ...base, footerSocialLinks: [...base.footerSocialLinks, { platform: "zalo", url }] });

  assert.equal(withLink("https://zalo.me/g/abcdef").zaloHref, "https://zalo.me/g/abcdef");
  assert.equal(withLink("zalo.me/0912345678").zaloHref, "https://zalo.me/0912345678");
  assert.equal(withLink("091 234 5678").zaloHref, "https://zalo.me/0912345678");
  assert.equal(withLink("+84912345678").zaloHref, "https://zalo.me/0912345678");
  assert.equal(withLink("0912345678").hasCustomZalo, true);
});

test("withZaloLink edits only the Zalo entry and removes it when blank", () => {
  const links = [
    { platform: "Facebook", url: "https://facebook.com/shop" },
    { platform: "ZALO", url: "https://zalo.me/old" },
  ];
  const updated = withZaloLink(links, " https://zalo.me/new ");
  assert.deepEqual(updated, [
    { platform: "Facebook", url: "https://facebook.com/shop" },
    { platform: "Zalo", url: "https://zalo.me/new" },
  ]);
  assert.equal(findZaloLink(updated), "https://zalo.me/new");
  assert.deepEqual(withZaloLink(links, "   "), [{ platform: "Facebook", url: "https://facebook.com/shop" }]);
});

test("a missing phone yields no dead tel: link", () => {
  const info = resolveContactInfo({ ...base, footerPhone: "" });
  assert.equal(info.telHref, "");
  assert.equal(info.zaloHref, "");
});
