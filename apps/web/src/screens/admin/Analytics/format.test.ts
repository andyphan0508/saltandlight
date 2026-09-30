import { test } from "node:test";
import assert from "node:assert/strict";
import { formatDurationShort, niceAxisMax } from "./format";

test("axis tops keep both gridlines on round whole numbers", () => {
  for (const [max, top] of [[0, 2], [1, 2], [3, 4], [7, 8], [63, 80], [105, 120], [640, 800], [1725, 2000]] as const) {
    assert.equal(niceAxisMax(max), top, `max ${max}`);
    assert.ok(Number.isInteger(top / 2));
  }
});

test("short durations fit a tile", () => {
  assert.equal(formatDurationShort(45_400), "45s");
  assert.equal(formatDurationShort(68_000), "1p 8s");
});
