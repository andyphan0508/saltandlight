-- AlterTable
ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "care_guides" JSONB DEFAULT '[]'::jsonb;
