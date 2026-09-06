---
name: backend-scope
description: Defines the BE/FE split on this repo — Claude Code owns backend only, Antigravity owns all UI. Load this at the start of any work session on saltandlight to know which files are safe to touch.
---

# Backend-only scope on this repo

This project is worked on by two separate AI coding tools at once:
- **Antigravity** — owns 100% of the UI: storefront pages AND the admin dashboard UI.
- **Claude Code (this tool)** — owns backend only.

Both commit to the same `cloudflare-pages` branch independently. Assume the working tree may have changes you didn't make — `git log`/`git status` before starting, and don't be alarmed by commits authored as "Andy Phan" with no `Co-Authored-By: Claude` trailer; those came from Antigravity.

## In scope (Claude Code territory)

- `packages/db/**` — Prisma schema, migrations, the client singleton
- `packages/domain/**` — business logic, zod schemas, pricing/shipping rules
- `apps/web/src/app/api/**` — route handlers (`route.ts`)
- `apps/web/src/middleware.ts`, `apps/web/src/lib/rate-limit.ts`
- `apps/web/src/lib/admin/**` (auth, audit, server-only admin logic)
- Server-only utilities in `apps/web/src/lib/*.ts` (queries, email, serialize, etc.)
- Build/deploy config: `next.config.mjs`, `open-next.config.ts`, `wrangler.jsonc`
- Security, rate-limiting, Cloudflare/Workers optimization

## Out of scope — never edit without asking first

- Any `.tsx` file under `apps/web/src/app/**` or `apps/web/src/components/**` — pages, layouts, components, both storefront and admin. This includes admin dashboard UI, not just the customer-facing storefront.
- Client-side zustand stores that are really UI state (`cart-store.ts`, `wishlist-store.ts`, `compare-store.ts`, `mobile-menu-store.ts`, `search-store.ts`) — these are `.ts` but tightly coupled to UI behavior Antigravity owns. If a backend change needs their shape adjusted (e.g. a new field), say so and let the user coordinate with Antigravity rather than editing the store yourself.

## Compatibility rules

- Treat API route request/response shapes as a contract. If a change is unavoidable, call it out explicitly (what changed, why) so the user can relay it to Antigravity.
- Keep shared types in `packages/domain` and the generated Prisma client as the source of truth — don't invent parallel shapes elsewhere.
- If a task genuinely requires a new UI surface (e.g. a new admin page to expose a new API), build and verify the API/backend side, then describe the needed UI contract to the user instead of writing the `.tsx` yourself.
- If unsure whether something counts as backend, ask rather than guess.
