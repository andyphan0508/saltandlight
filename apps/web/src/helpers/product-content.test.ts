import { test } from "node:test";
import assert from "node:assert/strict";
import { parseProductContent, readPriceNote, serializeProductContent, withPriceNote } from "./product-content";

test("legacy plain text becomes one paragraph with no default sections injected", () => {
  assert.deepEqual(parseProductContent("  Áo thun cotton  "), [
    { id: "description", type: "paragraph", content: "Áo thun cotton" },
  ]);
  assert.deepEqual(parseProductContent(null), []);
});

test("retired block types are dropped", () => {
  const raw = JSON.stringify([
    { id: "a", type: "paragraph", content: "x" },
    { id: "b", type: "specs_table", rows: [] },
    { id: "c", type: "callout", title: "Giặt áo", body: "" },
  ]);
  assert.deepEqual(parseProductContent(raw).map((b) => b.id), ["a"]);
});

test("price note round-trips and an emptied note stays hidden instead of falling back to the default", () => {
  const blocks = parseProductContent(serializeProductContent(withPriceNote([], "  Freeship  ")));
  assert.equal(readPriceNote(blocks), "Freeship");
  assert.equal(readPriceNote(withPriceNote(blocks, "")), "");
  assert.equal(readPriceNote([]), null);
});
