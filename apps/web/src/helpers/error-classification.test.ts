import { test } from "node:test";
import assert from "node:assert/strict";
import { isRouterCorruptionError, MAX_AUTO_RELOADS, nextAutoReload } from "./error-classification";

test("errors only a full reload fixes are recognised", () => {
  assert.equal(isRouterCorruptionError("Error: Connection closed."), true);
  assert.equal(isRouterCorruptionError("TypeError: Cannot read properties of null (reading 'get')"), true);
  assert.equal(isRouterCorruptionError("Cannot read properties of null (reading 'parallelRoutes')"), true);
  assert.equal(isRouterCorruptionError("ChunkLoadError: Loading chunk 2749 failed."), true);
  assert.equal(isRouterCorruptionError("Failed to fetch RSC payload for /dang-nhap"), true);
  // Ordinary failures keep the soft retry path
  assert.equal(isRouterCorruptionError("Không thể kết nối máy chủ"), false);
  assert.equal(isRouterCorruptionError(undefined), false);
});

test("automatic reloads are capped so a real error can't reload forever", () => {
  let history: number[] = [];
  const now = 1_000_000;
  for (let i = 0; i < MAX_AUTO_RELOADS; i++) {
    const r = nextAutoReload(history, now + i * 1000);
    assert.equal(r.isAllowed, true);
    history = r.history;
  }
  assert.equal(nextAutoReload(history, now + 5_000).isAllowed, false);
  // A minute later the budget is back
  assert.equal(nextAutoReload(history, now + 70_000).isAllowed, true);
});
