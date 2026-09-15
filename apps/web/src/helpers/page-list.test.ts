import { test } from "node:test";
import assert from "node:assert/strict";
import { getPageList } from "./page-list";

test("getPageList shows every page up to 7, then collapses gaps with an ellipsis", () => {
  assert.deepEqual(getPageList(1, 5), [1, 2, 3, 4, 5]);
  assert.deepEqual(getPageList(1, 10), [1, 2, "…", 9, 10]);
  assert.deepEqual(getPageList(5, 10), [1, 2, "…", 4, 5, 6, "…", 9, 10]);
});
