-- ==============================================================================
-- SALT & LIGHT - SUPABASE DATABASE HARDENING SCRIPT
-- ==============================================================================
-- Run once in the Supabase SQL Editor if you ever spin up a new Supabase project
-- or reset the database.
--
-- Why:
-- The application queries PostgreSQL through Prisma using the direct DATABASE_URL
-- (connecting as postgres superuser/service role, which possesses BYPASSRLS).
--
-- Meanwhile, Supabase by default exposes a public PostgREST API at
-- https://<project>.supabase.co/rest/v1. Without RLS, anyone possessing the
-- anon public key can dump customer PII, admin emails, orders, and products.
--
-- This script enables Row Level Security (RLS) on all public tables and revokes
-- direct PostgREST access from 'anon' and 'authenticated' roles.
-- ==============================================================================

ALTER TABLE "categories" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "products" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "product_images" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "product_variants" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "product_bundles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "product_bundle_items" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "customers" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "customer_addresses" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "admin_users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "orders" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "order_items" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "order_status_history" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "payment_transactions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "shipping_zones" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "shipping_methods" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "audit_logs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "contact_submissions" ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon, authenticated;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon, authenticated;
REVOKE ALL ON ALL ROUTINES IN SCHEMA public FROM anon, authenticated;
