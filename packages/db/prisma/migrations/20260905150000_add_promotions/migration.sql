-- CreateTable
CREATE TABLE IF NOT EXISTS "promotions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "badge" TEXT,
    "description" TEXT,
    "discount_type" TEXT NOT NULL DEFAULT 'percent',
    "discount_value" DECIMAL(12,2) NOT NULL,
    "start_date" TIMESTAMPTZ,
    "end_date" TIMESTAMPTZ,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "product_ids" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "promotions_pkey" PRIMARY KEY ("id")
);

-- Grant permissions for Supabase
GRANT ALL ON TABLE "promotions" TO "anon", "authenticated", "service_role", "postgres";
