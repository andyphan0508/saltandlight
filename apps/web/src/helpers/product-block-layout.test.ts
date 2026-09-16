import { test } from "node:test";
import assert from "node:assert/strict";
import { gridViewFor, isRail, layoutUsesImage, readArrangement, readLayout } from "./product-block-layout";

test("readLayout falls back to the grid for old or invalid content", () => {
  assert.equal(readLayout("image-left"), "image-left");
  assert.equal(readLayout("slider"), "slider");
  assert.equal(readLayout(undefined), "grid");
  assert.equal(readLayout("elementor"), "grid");
});

test("isRail decides when products scroll instead of wrapping", () => {
  // The slider preset and an explicit "slider" arrangement both rail
  assert.equal(isRail("slider", "4"), true);
  assert.equal(isRail("banner-top", "slider"), true);
  // image-left always rails — a wrapping grid beside one image leaves dead space
  assert.equal(isRail("image-left", "2"), true);
  assert.equal(isRail("grid", "3"), false);
  assert.equal(isRail("banner-top", undefined), false);
});

test("gridViewFor returns the admin's column count, defaulting on junk", () => {
  assert.equal(gridViewFor("grid", 3), "3");
  assert.equal(gridViewFor("banner-top", "2"), "2");
  assert.equal(gridViewFor("grid", 99), "4");
  assert.equal(gridViewFor("grid", undefined), "4");
  // Never used while railing, but must stay a valid grid value
  assert.equal(gridViewFor("banner-top", "slider"), "4");
});

test("readArrangement keeps the four valid answers only", () => {
  assert.equal(readArrangement("slider"), "slider");
  assert.equal(readArrangement("2"), "2");
  assert.equal(readArrangement(4), "4");
  assert.equal(readArrangement("banner"), "4");
});

test("only the image presets ask the admin for an image", () => {
  assert.equal(layoutUsesImage("banner-top"), true);
  assert.equal(layoutUsesImage("image-left"), true);
  assert.equal(layoutUsesImage("grid"), false);
  assert.equal(layoutUsesImage("slider"), false);
});
