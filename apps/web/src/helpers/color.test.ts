import { test } from "node:test";
import assert from "node:assert/strict";
import { isHexColor, textColorOn } from "./color";

test("textColorOn picks the readable text color for a swatch", () => {
  assert.equal(textColorOn("#FFFFFF"), "#111111"); // white pill → black text
  assert.equal(textColorOn("#111111"), "#FFFFFF"); // black pill → white text
  assert.equal(textColorOn("#A8E6CF"), "#111111"); // mint is light → black text
  assert.equal(textColorOn("#2F5D50"), "#FFFFFF"); // forest green is dark → white text
  assert.equal(textColorOn("#F4C542"), "#111111"); // yellow reads far lighter than its green channel alone
  assert.equal(textColorOn("#1F3A5F"), "#FFFFFF");
});

test("a missing or malformed hex falls back to black text", () => {
  assert.equal(textColorOn(null), "#111111");
  assert.equal(textColorOn("mint"), "#111111");
  assert.equal(textColorOn("#FFF"), "#111111");
});

test("isHexColor only accepts a 6-digit hex", () => {
  assert.equal(isHexColor("#a8e6cf"), true);
  assert.equal(isHexColor("#A8E6CF"), true);
  assert.equal(isHexColor("#FFF"), false);
  assert.equal(isHexColor("A8E6CF"), false);
  assert.equal(isHexColor(undefined), false);
});
