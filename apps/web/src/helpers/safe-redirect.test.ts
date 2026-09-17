import { test } from "node:test";
import assert from "node:assert/strict";
import { safeRedirectPath } from "./safe-redirect";

test("only same-site paths are followed after login", () => {
  assert.equal(safeRedirectPath("/admin/orders?x=1", "/f"), "/admin/orders?x=1");
  for (const bad of ["//evil.com", "/\\evil.com", "https://evil.com", "javascript:alert(1)", "evil.com", "", null, undefined]) {
    assert.equal(safeRedirectPath(bad, "/f"), "/f", String(bad));
  }
});
