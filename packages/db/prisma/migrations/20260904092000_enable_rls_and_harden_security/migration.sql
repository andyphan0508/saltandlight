-- Ensure schema public grants and privileges are accessible to Supabase Studio & client
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role, postgres;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role, postgres;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role, postgres;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role, postgres;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role, postgres;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role, postgres;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO anon, authenticated, service_role, postgres;

ALTER TABLE "categories" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "products" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "product_images" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "product_variants" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "product_bundles" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "product_bundle_items" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "customers" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "customer_addresses" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "admin_users" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "orders" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "order_items" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "order_status_history" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "payment_transactions" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "shipping_zones" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "shipping_methods" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "audit_logs" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "contact_submissions" DISABLE ROW LEVEL SECURITY;
