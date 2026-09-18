import { test } from "node:test";
import assert from "node:assert/strict";
import { formatDayMonth } from "./day-month";

test("day and month are zero-padded and slash-separated", () => {
  assert.equal(formatDayMonth(new Date(2026, 8, 5)), "05/09");
  assert.equal(formatDayMonth(new Date(2026, 11, 31)), "31/12");
});
