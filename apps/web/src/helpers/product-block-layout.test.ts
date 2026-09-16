import { test } from "node:test";
import assert from "node:assert/strict";
import { gridViewFor, layoutUsesImage, readLayout } from "./product-block-layout";

test("readLayout falls back to the grid for old or invalid content", () => {
  assert.equal(readLayout("image-left"), "image-left");
  assert.equal(readLayout("slider"), "slider");
  assert.equal(readLayout(undefined), "grid");
  assert.equal(readLayout("elementor"), "grid");
});

test("gridViewFor honours the admin's column count but caps the half-width preset", () => {
  assert.equal(gridViewFor("grid", 3), "3");
  assert.equal(gridViewFor("banner-top", "2"), "2");
  assert.equal(gridViewFor("grid", 99), "4");
  assert.equal(gridViewFor("grid", undefined), "4");
  // Only half a row is available beside the image, so 4 columns would squash the cards
  assert.equal(gridViewFor("image-left", 4), "2");
});

test("only the image presets ask the admin for an image", () => {
  assert.equal(layoutUsesImage("banner-top"), true);
  assert.equal(layoutUsesImage("image-left"), true);
  assert.equal(layoutUsesImage("grid"), false);
  assert.equal(layoutUsesImage("slider"), false);
});
