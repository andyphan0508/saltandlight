-- Hex swatch for a variant's color, picked by the admin. Nullable: existing
-- variants keep the old name-based swatch guess on the storefront.
ALTER TABLE "product_variants" ADD COLUMN "color_hex" TEXT;
