-- ShippingZone: which provinces this policy applies to (empty = nationwide fallback)
ALTER TABLE "shipping_zones" ADD COLUMN IF NOT EXISTS "province_codes" INTEGER[] DEFAULT ARRAY[]::INTEGER[];

-- CustomerAddress: 2025 admin reform removed the district tier and added province/ward codes
ALTER TABLE "customer_addresses" ADD COLUMN IF NOT EXISTS "province_code" INTEGER;
ALTER TABLE "customer_addresses" ADD COLUMN IF NOT EXISTS "ward_code" INTEGER;
ALTER TABLE "customer_addresses" ALTER COLUMN "district" DROP NOT NULL;
