-- A product can now appear in several categories. products.category_id stays
-- as the primary category (breadcrumb, related products, size guides); this
-- join table holds every category the product is listed under.

-- CreateTable
CREATE TABLE "_ProductCategories" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL,

    CONSTRAINT "_ProductCategories_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_ProductCategories_B_index" ON "_ProductCategories"("B");

-- AddForeignKey
ALTER TABLE "_ProductCategories" ADD CONSTRAINT "_ProductCategories_A_fkey" FOREIGN KEY ("A") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProductCategories" ADD CONSTRAINT "_ProductCategories_B_fkey" FOREIGN KEY ("B") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Backfill: every existing product is listed under its current category, so
-- catalog filters and counts are unchanged the moment this runs.
INSERT INTO "_ProductCategories" ("A", "B")
SELECT "category_id", "id" FROM "products" WHERE "category_id" IS NOT NULL
ON CONFLICT DO NOTHING;
