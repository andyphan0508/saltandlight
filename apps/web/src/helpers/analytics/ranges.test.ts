import { test } from "node:test";
import assert from "node:assert/strict";
import { readRange, resolveWindow, toSqlDateTime } from "./ranges";

// 2026-09-17 16:30 in Vietnam = 09:30 UTC
const NOW = new Date("2026-09-17T09:30:00Z");

test("today starts at Vietnam midnight and is compared with the same hours yesterday", () => {
  const w = resolveWindow("today", NOW);
  assert.equal(w.start.toISOString(), "2026-09-16T17:00:00.000Z");
  assert.equal(w.end.toISOString(), NOW.toISOString());
  assert.equal(w.previousStart.toISOString(), "2026-09-15T17:00:00.000Z");
  assert.equal(w.previousEnd.toISOString(), "2026-09-16T09:30:00.000Z");
  assert.equal(w.isSingleDay, true);
});

test("7 days is today plus the six full days before, compared with the 7 before that", () => {
  const w = resolveWindow("7d", NOW);
  assert.equal(w.start.toISOString(), "2026-09-10T17:00:00.000Z");
  assert.equal(w.previousEnd.toISOString(), w.start.toISOString());
  assert.equal(w.end.getTime() - w.start.getTime(), w.previousEnd.getTime() - w.previousStart.getTime());
  assert.equal(w.isSingleDay, false);
});

test("yesterday is a whole Vietnam day", () => {
  const w = resolveWindow("yesterday", NOW);
  assert.equal(w.start.toISOString(), "2026-09-15T17:00:00.000Z");
  assert.equal(w.end.toISOString(), "2026-09-16T17:00:00.000Z");
});

test("bad range values fall back to 7 days; SQL literals are UTC without zone", () => {
  assert.equal(readRange("90d"), "7d");
  assert.equal(readRange("today"), "today");
  assert.equal(toSqlDateTime(new Date("2026-09-17T08:05:09.123Z")), "2026-09-17 08:05:09");
});
