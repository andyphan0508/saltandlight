import { test } from "node:test";
import assert from "node:assert/strict";
import { findScriptUrl } from "./script-url";

test("script URLs are found anywhere in admin content", () => {
  assert.equal(findScriptUrl({ buttons: [{ href: " Java\tScript:alert(1)" }] }), " Java\tScript:alert(1)");
  assert.ok(findScriptUrl({ a: "vbscript:x" }));
  assert.ok(findScriptUrl(["data:text/html,<script>"]));
  assert.equal(findScriptUrl({ href: "/san-pham", img: "data:image/png;base64,AA", url: "https://zalo.me/1", n: 3, x: null }), null);
  assert.equal(findScriptUrl({ text: "Xem javascript: không sao khi nằm giữa câu" }), null);
});
