import { test } from "node:test";
import assert from "node:assert/strict";
import { bucketProductActivity } from "./product-activity";
import { resolveWindow } from "./ranges";

const row = (hour: string, views: number, carts = 0, wishlists = 0) => ({ hour, views, carts, wishlists });

test("a single day buckets by Vietnam hour and stops at the current hour", () => {
  // 10:30 in Vietnam = 03:30 UTC
  const today = resolveWindow("today", new Date("2026-09-18T03:30:00Z"));
  const points = bucketProductActivity([row("2026-09-18 01:00:00", 4, 1), row("2026-09-18 01:00:00", 2, 0, 3)], today);
  assert.equal(points.length, 11, "00h … 10h");
  assert.deepEqual(points[8], { label: "8:00 – 8:59", tick: "8h", views: 6, carts: 1, wishlists: 3 });
  assert.equal(points[9]!.views, 0);
});

test("longer ranges bucket by Vietnam day, so a late-evening event lands on the next day", () => {
  const week = resolveWindow("7d", new Date("2026-09-18T03:30:00Z"));
  const points = bucketProductActivity([row("2026-09-17 20:00:00", 5)], week);
  assert.equal(points.length, 7);
  assert.equal(points.at(-1)!.tick, "18/09");
  assert.equal(points.at(-1)!.views, 5, "20:00 UTC on the 17th is 03:00 on the 18th in Vietnam");
  assert.equal(points.at(-2)!.views, 0);
});
