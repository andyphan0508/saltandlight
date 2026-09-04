-- CreateEnum
DO $$ BEGIN
    CREATE TYPE "PageBlockType" AS ENUM ('FEATURE_CARDS', 'FEATURED_PRODUCTS', 'STORY_BANNER', 'PROMO_CTA', 'TESTIMONIALS', 'PAGE_HERO', 'RICH_TEXT_SECTIONS', 'CONTACT_INFO', 'CTA_BANNER');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- CreateTable
CREATE TABLE IF NOT EXISTS "page_blocks" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "page" TEXT NOT NULL,
    "type" "PageBlockType" NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_visible" BOOLEAN NOT NULL DEFAULT true,
    "content" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "page_blocks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "page_blocks_page_sort_order_idx" ON "page_blocks"("page", "sort_order");

-- Grant permissions for Supabase studio
GRANT ALL ON TABLE "page_blocks" TO "anon", "authenticated", "service_role", "postgres";
