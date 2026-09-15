import { test } from "node:test";
import assert from "node:assert/strict";
import type { PageBlockItem } from "../interfaces/page-block";
import { blockPreviewSnippet, findBlockFromPreviewMessage } from "./page-block-preview";

const blocks = [
  { id: "b1", type: "PAGE_HERO", content: { title: "Về chúng tôi" } },
  { id: "b2", type: "FEATURE_CARDS", content: { items: [1, 2, 3] } },
  { id: "b3", type: "FEATURED_PRODUCTS", content: { sourceType: "category", categoryName: "Áo thun" } },
] as unknown as PageBlockItem[];

test("findBlockFromPreviewMessage matches id, then type, then legacy hero/step/card ids", () => {
  assert.equal(findBlockFromPreviewMessage(blocks, { blockId: "b3" })?.id, "b3");
  assert.equal(findBlockFromPreviewMessage(blocks, { blockType: "FEATURE_CARDS" })?.id, "b2");
  assert.equal(findBlockFromPreviewMessage(blocks, { blockId: "default-hero" })?.id, "b1");
  assert.equal(findBlockFromPreviewMessage(blocks, { blockId: "step-2" })?.id, "b2");
  assert.equal(findBlockFromPreviewMessage(blocks, { blockId: "unknown" }), null);
});

test("blockPreviewSnippet summarizes block content", () => {
  assert.equal(blockPreviewSnippet(blocks[0]!), "Về chúng tôi");
  assert.equal(blockPreviewSnippet(blocks[1]!), "3 mục");
  assert.equal(blockPreviewSnippet(blocks[2]!), "Danh mục: Áo thun");
});
