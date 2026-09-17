import { test } from "node:test";
import assert from "node:assert/strict";
import { normalizeCategorySelection, toggleCategory } from "./category-selection";

test("the primary is always listed, first, and duplicates collapse", () => {
  assert.deepEqual(normalizeCategorySelection("b", ["a", "b", "a", null, ""]), {
    primaryId: "b",
    categoryIds: ["b", "a"],
  });
  // A primary missing from the list is added rather than silently lost
  assert.deepEqual(normalizeCategorySelection("c", ["a"]), { primaryId: "c", categoryIds: ["c", "a"] });
});

test("a list without a primary promotes its first entry; nothing selected means no primary", () => {
  assert.deepEqual(normalizeCategorySelection(null, ["a", "b"]), { primaryId: "a", categoryIds: ["a", "b"] });
  assert.deepEqual(normalizeCategorySelection("", []), { primaryId: null, categoryIds: [] });
});

test("toggling adds and removes, and removing the primary hands it to the next category", () => {
  let selection = normalizeCategorySelection(null, []);
  selection = toggleCategory(selection, "adult");
  selection = toggleCategory(selection, "kids");
  assert.deepEqual(selection, { primaryId: "adult", categoryIds: ["adult", "kids"] });

  selection = toggleCategory(selection, "adult");
  assert.deepEqual(selection, { primaryId: "kids", categoryIds: ["kids"] });

  selection = toggleCategory(selection, "kids");
  assert.deepEqual(selection, { primaryId: null, categoryIds: [] });
});
