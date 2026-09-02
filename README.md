# Salt & Light — monorepo

React/Next.js replacement for the WordPress/WooCommerce store at
saltandlight.com.vn. Two Next.js apps sharing one Postgres (Supabase)
database, deployed as two separate Vercel projects from this one repo.

## Architecture

```
apps/
  web/      Storefront — Next.js App Router, SSR/dynamic rendering for SEO.
            Public: catalog, cart, guest checkout, VietQR payment, order
            tracking, wishlist/compare (localStorage), contact forms.
  admin/    Dashboard — separate Next.js app, Supabase Auth–gated.
            Products/variants, orders, payment confirmation, shipping,
            customers, staff (owner-only), audit log.
packages/
  db/       Prisma schema + client, shared by both apps.
  domain/   Framework-free business logic: pricing, shipping fee rule,
            VietQR URL builder, order numbering, zod schemas.
  ui/       Shared Tailwind preset + a couple of primitives (Button, Badge).
scripts/    One-off Node scripts: WooCommerce data migration, owner bootstrap.
supabase/   SQL to run once in the Supabase SQL editor (storage bucket).
```

Both apps talk to Postgres directly through Prisma — the browser never calls
Supabase's REST API, so table-level RLS isn't load-bearing for the app (it's
still worth enabling defensively, see below). Supabase itself provides:
Postgres, Auth (admin login only — the storefront is guest-checkout), and
Storage (product images uploaded from the dashboard).

### Deviations from the original WordPress-migration spec

Decided in this session, given the "deploy everything on Vercel" and
"Supabase" constraints:

- **Backend is Next.js Route Handlers, not NestJS.** NestJS doesn't fit
  Vercel's serverless model cleanly; API routes live inside each Next.js app
  instead of a separate service.
- **Wishlist / Compare are client-side (localStorage), not DB-backed** —
  guest checkout means there's no durable customer identity to hang them
  off. Product Bundles (`product_bundles` table) is a real DB feature.
- **Payment is bank-transfer (VietQR) only** — no COD, per this session's
  decision (spec §9.1 was left open; COD was dropped).
- **Guest checkout only** — no customer accounts; orders are looked up by
  order number + phone (spec §9.3 decision).
- Everything else (data model, order status machine, shipping logic, audit
  log, RBAC) follows `saltandlight-react-migration-spec.md` directly.

## Prerequisites

- Node 20+
- `pnpm` (this repo pins `packageManager: pnpm@9.12.0` — `corepack enable`
  or `npm install -g pnpm` if you don't have it)
- A Supabase project (free tier is enough to start)

## 1. Supabase setup

1. Create a project at [supabase.com](https://supabase.com).
2. **Database → Connection string**: copy the "Transaction" pooler URL
   (port 6543) and the direct connection (port 5432) — see `.env.example`
   for `DATABASE_URL` / `DIRECT_URL`.
3. **Settings → API**: copy the project URL, `anon` key, and `service_role`
   key.
4. **Authentication → Providers**: keep Email enabled, and turn **off**
   "Allow new users to sign up" — admin accounts are only ever created by
   invite (via the bootstrap script below, or the dashboard's Nhân viên
   page), never public self-registration.
5. **SQL Editor**: run [`supabase/storage-setup.sql`](supabase/storage-setup.sql)
   once — creates the public `product-images` storage bucket the admin
   dashboard uploads to.

## 2. Local setup

```bash
pnpm install

cp .env.example apps/web/.env.local
cp .env.example apps/admin/.env.local
# fill in both files with the Supabase values from step 1

pnpm db:generate
pnpm db:migrate      # creates tables from packages/db/prisma/schema.prisma
pnpm db:seed         # sample categories/products/shipping so the UI isn't empty
```

Next.js reads env vars from each app's own `.env.local` (not the repo
root) — the root `.env.example` is just a template to copy into both.

Create the first `owner` admin account (this must run before you can log
into the dashboard at all — the invite-from-dashboard flow needs an owner
to already exist):

```bash
NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... \
OWNER_EMAIL=you@example.com OWNER_NAME="Chủ shop" \
pnpm bootstrap:owner
```

This sends a Supabase invite email with a link to set a password.

```bash
pnpm dev:web     # http://localhost:3000
pnpm dev:admin   # http://localhost:3001
```

## 3. Deploying to Vercel

Two separate Vercel projects pointing at the same GitHub repo:

| Project | Root Directory | Env vars |
|---|---|---|
| `saltandlight-web` | `apps/web` | everything in `.env.example` except the ones only the admin app needs |
| `saltandlight-admin` | `apps/admin` | everything in `.env.example`, plus `SUPABASE_SERVICE_ROLE_KEY` |

Vercel auto-detects the pnpm workspace from `pnpm-workspace.yaml` at the repo
root and runs the install from there — no custom install command needed.
Set "Root Directory" per project in Project Settings → General; leave
"Include files outside Root Directory" on its default (Vercel enables it
automatically for detected monorepos).

Set `NEXT_PUBLIC_SITE_URL` / `NEXT_PUBLIC_ADMIN_URL` to the real deployed
URLs once you have them (used for absolute links, e.g. in emails).

After the first deploy, point `saltandlight.com.vn` at the `web` project
and something like `admin.saltandlight.com.vn` at the `admin` project.

## 4. Migrating data from WooCommerce

```bash
WC_BASE_URL=https://saltandlight.com.vn \
WC_CONSUMER_KEY=ck_xxx WC_CONSUMER_SECRET=cs_xxx \
pnpm migrate:woocommerce -- --dry-run   # inspect counts first

WC_BASE_URL=... WC_CONSUMER_KEY=... WC_CONSUMER_SECRET=... \
pnpm migrate:woocommerce                # then actually write
```

Generate the WooCommerce API key/secret in `wp-admin → WooCommerce →
Settings → Advanced → REST API` (Read permission is enough). The script is
idempotent (upserts by slug/order number) and writes `migration-report.json`
listing anything that needs a human look — notably the tote-bag products,
which were built with Elementor instead of the standard WooCommerce
description field (spec §1.2), so their description will come back mostly
empty and needs to be copied over by hand.

## Notes

- Prices are stored as whole VND integers (no decimals), matching how the
  original store priced everything.
- `packages/db/prisma/schema.prisma` is the source of truth for the data
  model — see `saltandlight-react-migration-spec.md` §3 for the reasoning
  behind each table.
- The admin dashboard's revenue figure only counts orders in `processing`
  or `completed` — the original WooCommerce dashboard showed 0₫ because it
  excluded orders stuck in "on-hold"/"processing" (spec §1.1); this avoids
  repeating that.
