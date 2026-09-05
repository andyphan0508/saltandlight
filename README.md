# Salt & Light — monorepo

React/Next.js replacement for the WordPress/WooCommerce store at
saltandlight.com.vn. One Next.js app (storefront + admin dashboard under
`/admin`), one Postgres (Supabase) database, deployed as a single Cloudflare
Worker via OpenNext.

## Architecture

```
apps/
  web/      Everything — Next.js App Router, one deployable app.
            Storefront (public): catalog, cart, guest checkout, VietQR
            payment, order tracking, wishlist/compare (localStorage),
            contact forms — server-rendered for SEO.
            Admin (/admin, Supabase Auth–gated): products/variants,
            orders, payment confirmation, shipping, customers, staff
            (owner-only), audit log, page builder, banners.
packages/
  db/       Prisma schema + client.
  domain/   Framework-free business logic: pricing, shipping fee rule,
            VietQR URL builder, order numbering, zod schemas.
  ui/       Shared Tailwind preset + a couple of primitives (Button, Badge).
scripts/    One-off Node scripts: WooCommerce data migration, owner bootstrap.
supabase/   SQL to run once in the Supabase SQL editor (storage bucket).
```

The app talks to Postgres directly through Prisma — the browser never calls
Supabase's REST API, so table-level RLS isn't load-bearing for the app (it's
still worth enabling defensively, see below). Supabase itself provides:
Postgres, Auth (admin login only — the storefront is guest-checkout), and
Storage (product images uploaded from the dashboard).

Admin routes live under `/admin` on the same domain and the same Worker —
there is no separate admin app or subdomain. `apps/web/src/middleware.ts`
gates every `/admin` and `/api/admin/*` request behind a Supabase session
check, and rate-limits every public `/api/*` route (see
`apps/web/src/lib/rate-limit.ts`).

### Deviations from the original WordPress-migration spec

- **Backend is Next.js Route Handlers, not NestJS** — API routes live inside
  the one Next.js app instead of a separate service.
- **Wishlist / Compare are client-side (localStorage), not DB-backed** —
  guest checkout means there's no durable customer identity to hang them
  off. Product Bundles (`product_bundles` table) is a real DB feature.
- **Payment is bank-transfer (VietQR) only** — no COD.
- **Guest checkout only** — no customer accounts; orders are looked up by
  order number + phone.
- Everything else (data model, order status machine, shipping logic, audit
  log, RBAC) follows `saltandlight-react-migration-spec.md` directly.

## Prerequisites

- Node 20+
- `pnpm` (this repo pins `packageManager: pnpm@9.12.0` — `corepack enable`
  or `npm install -g pnpm` if you don't have it)
- A Supabase project (free tier is enough to start)
- A Cloudflare account (Workers, free tier is enough to start)

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
# fill in with the Supabase values from step 1

pnpm db:generate
pnpm db:migrate      # creates tables from packages/db/prisma/schema.prisma
pnpm db:seed         # sample categories/products/shipping so the UI isn't empty
```

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
pnpm dev   # http://localhost:3000  (storefront + /admin)
```

## 3. Deploying to Cloudflare

One Cloudflare Worker ("saltandlight"), built via
[`@opennextjs/cloudflare`](https://opennext.js.org/cloudflare) and deployed
with `wrangler`. Config lives in `wrangler.jsonc` at the repo root (and a
copy in `apps/web/`, used for local `wrangler` commands run from that
directory).

```bash
pnpm build:cloudflare     # opennextjs-cloudflare — builds apps/web/.open-next/
pnpm preview:cloudflare   # build then `wrangler dev` — local Worker preview
pnpm deploy:cloudflare    # build then `wrangler deploy` — builds + promotes to 100% traffic
```

**Cloudflare dashboard → Workers & Pages → saltandlight → Settings → Builds**,
for the Git-connected auto-deploy:

- **Root directory**: `/` (repo root — `wrangler.jsonc` and the root `build`
  script both expect this)
- **Build command**: `pnpm run build` (runs `turbo run build`, then
  `opennextjs-cloudflare` for `apps/web`)
- **Deploy command**: `npx wrangler deploy` — uploads **and** promotes to
  100% production traffic in one step. (`npx wrangler versions upload` only
  creates a candidate version and requires a manual `wrangler versions
  deploy` to go live — don't use it as the Deploy command unless you
  actually want that two-step review flow.)
- **Production branch**: whichever branch you push real changes to (must
  match the branch you're actually deploying from — a mismatch here means
  every push runs the Version command instead of the Deploy command, so
  nothing goes live automatically).

Environment variables/secrets are configured **once**, on this one Worker,
under **Settings → Variables and Secrets**. Anything containing a credential
(`DATABASE_URL`, `DIRECT_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`,
`UPSTASH_REDIS_REST_TOKEN`, ...) should be added as a **Secret**, via
`wrangler secret put NAME` or the dashboard — never as a plaintext `vars`
entry in `wrangler.jsonc` (that file is committed to git) or as a plaintext
dashboard "Variable" (those get silently wiped/reset on some deploys).

`NEXT_PUBLIC_*` vars are inlined into the client bundle at **build** time,
which runs in a separate, ephemeral container that doesn't see Worker
secrets — so they (and `DATABASE_URL`/`DIRECT_URL`, needed for
`generateStaticParams` during the build) also need to be added under
**Settings → Build → Environment variables** (a separate section from the
Worker's runtime Variables/Secrets above).

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
description field, so their description will come back mostly empty and
needs to be copied over by hand.

## Notes

- Prices are stored as whole VND integers (no decimals), matching how the
  original store priced everything.
- `packages/db/prisma/schema.prisma` is the source of truth for the data
  model — see `saltandlight-react-migration-spec.md` §3 for the reasoning
  behind each table.
- The admin dashboard's revenue figure only counts orders in `processing`
  or `completed` — the original WooCommerce dashboard showed 0₫ because it
  excluded orders stuck in "on-hold"/"processing"; this avoids repeating
  that.
