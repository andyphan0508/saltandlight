-- AlterTable
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "is_featured" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "products_is_featured_idx" ON "products"("is_featured");

-- CreateTable
CREATE TABLE IF NOT EXISTS "banners" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "badge" TEXT,
    "image_url" TEXT,
    "link_url" TEXT,
    "bg_gradient" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "banners_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "banners_is_active_sort_order_idx" ON "banners"("is_active", "sort_order");

-- Grant permissions for Supabase studio
GRANT ALL ON TABLE "banners" TO "anon", "authenticated", "service_role", "postgres";
