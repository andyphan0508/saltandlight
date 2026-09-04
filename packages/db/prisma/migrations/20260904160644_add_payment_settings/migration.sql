-- CreateTable
CREATE TABLE IF NOT EXISTS "payment_settings" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "qr_image_url" TEXT,
    "transfer_note" TEXT,
    "show_thank_you_only" BOOLEAN NOT NULL DEFAULT false,
    "thank_you_message" TEXT,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payment_settings_pkey" PRIMARY KEY ("id")
);

-- Grant permissions for Supabase studio
GRANT ALL ON TABLE "payment_settings" TO "anon", "authenticated", "service_role", "postgres";
