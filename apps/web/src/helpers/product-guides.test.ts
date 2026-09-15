import { test } from "node:test";
import assert from "node:assert/strict";
import { guidesForCategory, parseProductGuides, type ProductGuide } from "./product-guides";

const TEE = "7c9e6679-7425-40de-944b-e07fc1f90ae7";
const BABY_TEE = "9b2e1c3a-5d4f-4a6b-8c7d-0e1f2a3b4c5d";
const TOTE = "3f1d2c4b-6a5e-4d7c-9b8a-1e2f3a4b5c6d";

const guide = (overrides: Partial<ProductGuide>): ProductGuide => {
  return { id: "g", title: "Guide", subtitle: "", layout: "cards", categoryIds: [], items: [], isActive: true, ...overrides };
};

test("guidesForCategory matches the category or its parent and skips inactive guides", () => {
  const guides = [
    guide({ id: "tee", categoryIds: [TEE] }),
    guide({ id: "hidden", categoryIds: [TEE], isActive: false }),
    guide({ id: "tote", categoryIds: [TOTE] }),
  ];
  assert.deepEqual(guidesForCategory(guides, { id: TEE, parentId: null }).map((g) => g.id), ["tee"]);
  assert.deepEqual(guidesForCategory(guides, { id: BABY_TEE, parentId: TEE }).map((g) => g.id), ["tee"]);
  assert.deepEqual(guidesForCategory(guides, { id: BABY_TEE, parentId: null }), []);
  assert.deepEqual(guidesForCategory(guides, null), []);
});

test("parseProductGuides trims, fills defaults, drops blank rows and rejects malformed data", () => {
  const [parsed] = parseProductGuides([
    { id: "g", title: " Giặt áo ", layout: "list", categoryIds: [TEE], items: [{ content: "Lộn trái" }, {}], isActive: true },
  ]);
  assert.equal(parsed?.title, "Giặt áo");
  assert.equal(parsed?.subtitle, "");
  assert.deepEqual(parsed?.items, [{ icon: "", title: "", content: "Lộn trái" }]);
  assert.deepEqual(parseProductGuides([{ id: "g" }]), []);
  assert.deepEqual(parseProductGuides(null), []);
});
