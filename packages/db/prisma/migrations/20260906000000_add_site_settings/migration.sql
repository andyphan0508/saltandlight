-- CreateTable
CREATE TABLE IF NOT EXISTS "site_settings" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "logo_url" TEXT,
    "logo_size" TEXT NOT NULL DEFAULT 'md',
    "footer_logo_url" TEXT,
    "favicon_url" TEXT,
    "header_nav_items" JSONB,
    "footer_brand_text" TEXT,
    "footer_phone" TEXT,
    "footer_email" TEXT,
    "footer_address" TEXT,
    "footer_social_links" JSONB,
    "footer_columns" JSONB,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "site_settings_pkey" PRIMARY KEY ("id")
);

-- Grant permissions for Supabase
GRANT ALL ON TABLE "site_settings" TO "anon", "authenticated", "service_role", "postgres";
