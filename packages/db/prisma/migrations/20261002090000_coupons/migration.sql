-- Single-use coupon codes, grouped into campaigns that hold the discount rule.
-- Additive only: a new column with a default on orders, two new tables.
-- CreateEnum
CREATE TYPE "CouponDiscountType" AS ENUM ('percent', 'fixed', 'free_shipping');

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "discount" DECIMAL(12,0) NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "coupon_campaigns" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "discount_type" "CouponDiscountType" NOT NULL,
    "discount_value" DECIMAL(12,0) NOT NULL DEFAULT 0,
    "max_discount" DECIMAL(12,0),
    "min_order_total" DECIMAL(12,0) NOT NULL DEFAULT 0,
    "product_ids" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "starts_at" TIMESTAMP(3),
    "ends_at" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "coupon_campaigns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coupons" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "campaign_id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "used_at" TIMESTAMP(3),
    "order_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "coupons_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "coupons_code_key" ON "coupons"("code");

-- CreateIndex
CREATE UNIQUE INDEX "coupons_order_id_key" ON "coupons"("order_id");

-- CreateIndex
CREATE INDEX "coupons_campaign_id_used_at_idx" ON "coupons"("campaign_id", "used_at");

-- AddForeignKey
ALTER TABLE "coupons" ADD CONSTRAINT "coupons_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "coupon_campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coupons" ADD CONSTRAINT "coupons_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;


-- Read and written only through Prisma; closed to Supabase's public REST API from the start.
ALTER TABLE "coupon_campaigns" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "coupons" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON "coupon_campaigns", "coupons" FROM anon, authenticated;
