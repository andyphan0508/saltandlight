-- Which variant colour a product photo shows, so picking a colour on the product
-- page can jump to it. Additive only: nullable, existing photos stay shared by all colours.
-- AlterTable
ALTER TABLE "product_images" ADD COLUMN     "color" TEXT;
