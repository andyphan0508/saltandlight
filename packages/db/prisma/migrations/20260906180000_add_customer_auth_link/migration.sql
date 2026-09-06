-- Customer: link to Supabase auth.users once a guest logs in via OAuth (Google/Facebook)
ALTER TABLE "customers" ADD COLUMN IF NOT EXISTS "auth_user_id" UUID;
CREATE UNIQUE INDEX IF NOT EXISTS "customers_auth_user_id_key" ON "customers"("auth_user_id");

-- OAuth profiles (Google/Facebook) don't reliably provide a phone number at signup
ALTER TABLE "customers" ALTER COLUMN "phone" DROP NOT NULL;
