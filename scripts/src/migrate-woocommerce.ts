/**
 * One-off migration: pulls products + orders out of the live WooCommerce
 * REST API and writes them into the new Postgres schema (packages/db).
 * Product images are downloaded from WordPress and re-uploaded into the
 * `product-images` Supabase Storage bucket (spec §8.1) — the new site never
 * links back to the old WordPress media library.
 *
 * Usage:
 *   WC_BASE_URL=https://saltandlight.com.vn \
 *   WC_CONSUMER_KEY=ck_xxx WC_CONSUMER_SECRET=cs_xxx \
 *   NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... \
 *   pnpm migrate:woocommerce [--dry-run]
 *
 * Generate the consumer key/secret in wp-admin → WooCommerce → Settings →
 * Advanced → REST API (Read permission is enough). Supabase URL/service-role
 * key are the same ones in each app's .env.local — without them, image
 * upload is skipped and product_images rows are simply not created (logged
 * so you can backfill later), rather than pointing at the old WordPress URLs.
 *
 * Idempotent: products are upserted by slug, orders by order number, and
 * uploaded images use a deterministic path (upsert:true), so the script can
 * be re-run safely if it fails partway through.
 *
 * Known manual-review cases (spec §1.2, §8.2): the tote-bag products were
 * built with Elementor instead of the standard WooCommerce description
 * field, so their `description` will come back mostly empty here — copy
 * the real copy over by hand afterwards. Anything the script can't map
 * cleanly is written to migration-report.json instead of failing the run.
 */
import { prisma } from "@saltandlight/db";
import { createClient } from "@supabase/supabase-js";
import { writeFileSync } from "node:fs";

const WC_BASE_URL = process.env.WC_BASE_URL;
const WC_CONSUMER_KEY = process.env.WC_CONSUMER_KEY;
const WC_CONSUMER_SECRET = process.env.WC_CONSUMER_SECRET;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const DRY_RUN = process.argv.includes("--dry-run");
const PRODUCT_IMAGES_BUCKET = "product-images";

if (!WC_BASE_URL || !WC_CONSUMER_KEY || !WC_CONSUMER_SECRET) {
  console.error(
    "Missing WC_BASE_URL / WC_CONSUMER_KEY / WC_CONSUMER_SECRET environment variables.",
  );
  process.exit(1);
}

const supabaseAdmin =
  SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY
    ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
        auth: { autoRefreshToken: false, persistSession: false },
      })
    : null;

if (!supabaseAdmin) {
  console.warn(
    "NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY not set — product images will be SKIPPED (not linked to the old WordPress URLs either), add them and re-run to backfill.",
  );
}

const report: { skipped: unknown[]; errors: unknown[] } = { skipped: [], errors: [] };

/** Downloads one WooCommerce media item and re-uploads it into Supabase Storage. */
async function migrateImage(wcUrl: string, productSlug: string, index: number): Promise<string> {
  const res = await fetch(wcUrl);
  if (!res.ok) throw new Error(`Download failed (${res.status}): ${wcUrl}`);
  const contentType = res.headers.get("content-type") || "image/jpeg";
  const ext = contentType.includes("png") ? "png" : contentType.includes("webp") ? "webp" : "jpg";
  const buffer = Buffer.from(await res.arrayBuffer());
  const path = `wc/${productSlug}/${index}.${ext}`;

  const { error } = await supabaseAdmin!.storage
    .from(PRODUCT_IMAGES_BUCKET)
    .upload(path, buffer, { contentType, upsert: true });
  if (error) throw new Error(`Supabase upload failed for ${path}: ${error.message}`);

  const { data } = supabaseAdmin!.storage.from(PRODUCT_IMAGES_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

function authHeader() {
  const token = Buffer.from(`${WC_CONSUMER_KEY}:${WC_CONSUMER_SECRET}`).toString("base64");
  return { Authorization: `Basic ${token}` };
}

async function wcFetch<T>(path: string, params: Record<string, string> = {}): Promise<T> {
  const url = new URL(`${WC_BASE_URL}/wp-json/wc/v3${path}`);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const res = await fetch(url, { headers: authHeader() });
  if (!res.ok) {
    throw new Error(`WooCommerce API ${path} → ${res.status} ${await res.text()}`);
  }
  return res.json() as Promise<T>;
}

async function wcFetchAllPages<T>(path: string): Promise<T[]> {
  const perPage = 50;
  let page = 1;
  const all: T[] = [];
  for (;;) {
    const batch = await wcFetch<T[]>(path, { per_page: String(perPage), page: String(page) });
    all.push(...batch);
    if (batch.length < perPage) break;
    page += 1;
  }
  return all;
}

function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// ── Categories & products ────────────────────────────────────────────

interface WcCategory {
  id: number;
  name: string;
  slug: string;
  parent: number;
}
interface WcImage {
  src: string;
}
interface WcAttribute {
  name: string;
  options: string[];
}
interface WcVariation {
  id: number;
  sku: string;
  price: string;
  regular_price: string;
  stock_quantity: number | null;
  attributes: { name: string; option: string }[];
}
interface WcProduct {
  id: number;
  name: string;
  slug: string;
  description: string;
  status: string;
  categories: { id: number }[];
  images: WcImage[];
  type: "simple" | "variable";
  price: string;
  regular_price: string;
  stock_quantity: number | null;
  sku: string;
  attributes: WcAttribute[];
  variations: number[];
  date_created: string;
}

async function migrateCategories() {
  console.log("Fetching WooCommerce categories…");
  const wcCategories = await wcFetchAllPages<WcCategory>("/products/categories");
  const idToLocalId = new Map<number, string>();

  for (const wc of wcCategories) {
    if (DRY_RUN) continue;
    const local = await prisma.category.upsert({
      where: { slug: wc.slug },
      update: { name: wc.name },
      create: { name: wc.name, slug: wc.slug },
    });
    idToLocalId.set(wc.id, local.id);
  }
  console.log(`  → ${wcCategories.length} categories`);
  return idToLocalId;
}

async function migrateProducts(categoryIdMap: Map<number, string>) {
  console.log("Fetching WooCommerce products…");
  const wcProducts = await wcFetchAllPages<WcProduct>("/products");
  console.log(`  → ${wcProducts.length} products found`);

  for (const wc of wcProducts) {
    try {
      const wcCategoryId = wc.categories[0]?.id;
      const categoryId = wcCategoryId != null ? (categoryIdMap.get(wcCategoryId) ?? null) : null;
      const looksLikeElementorPage = wc.description.length < 40 && wc.type === "variable";
      if (looksLikeElementorPage) {
        report.skipped.push({
          type: "product_description",
          id: wc.id,
          slug: wc.slug,
          reason: "Description too short — likely built with Elementor, copy manually",
        });
      }

      let variants: {
        sku: string;
        color: string | null;
        size: string | null;
        price: number;
        compareAtPrice: number | null;
        stockQuantity: number;
      }[];

      if (wc.type === "variable" && wc.variations.length > 0) {
        // Variation routes are nested under their parent product — there is
        // no flat /products/variations/{id} endpoint in the WC REST API.
        const wcVariations = await wcFetchAllPages<WcVariation>(`/products/${wc.id}/variations`);
        variants = wcVariations.map((v) => ({
          sku: v.sku || `WC-${v.id}`,
          color: v.attributes.find((a) => /color|màu/i.test(a.name))?.option ?? null,
          size: v.attributes.find((a) => /size|kích/i.test(a.name))?.option ?? null,
          price: Number(v.price || v.regular_price || 0),
          compareAtPrice:
            v.regular_price && v.price && v.regular_price !== v.price
              ? Number(v.regular_price)
              : null,
          stockQuantity: v.stock_quantity ?? 0,
        }));
      } else {
        variants = [
          {
            sku: wc.sku || `WC-${wc.id}`,
            color: null,
            size: null,
            price: Number(wc.price || wc.regular_price || 0),
            compareAtPrice:
              wc.regular_price && wc.price && wc.regular_price !== wc.price
                ? Number(wc.regular_price)
                : null,
            stockQuantity: wc.stock_quantity ?? 0,
          },
        ];
      }

      if (DRY_RUN) continue;

      const status = wc.status === "publish" ? "published" : wc.status === "draft" ? "draft" : "archived";

      const product = await prisma.product.upsert({
        where: { slug: wc.slug },
        update: {
          name: wc.name,
          description: wc.description.replace(/<[^>]+>/g, "").trim(),
          categoryId,
          status,
        },
        create: {
          name: wc.name,
          slug: wc.slug,
          description: wc.description.replace(/<[^>]+>/g, "").trim(),
          categoryId,
          status,
        },
      });

      await prisma.productImage.deleteMany({ where: { productId: product.id } });
      if (wc.images.length > 0 && supabaseAdmin) {
        const imageRows: { productId: string; url: string; sortOrder: number }[] = [];
        for (let i = 0; i < wc.images.length; i++) {
          const wcImage = wc.images[i]!;
          try {
            const url = await migrateImage(wcImage.src, wc.slug, i);
            imageRows.push({ productId: product.id, url, sortOrder: imageRows.length });
          } catch (err) {
            report.errors.push({
              type: "product_image",
              id: wc.id,
              slug: wc.slug,
              src: wcImage.src,
              error: String(err),
            });
          }
        }
        if (imageRows.length > 0) await prisma.productImage.createMany({ data: imageRows });
      } else if (wc.images.length > 0) {
        report.skipped.push({
          type: "product_image",
          id: wc.id,
          slug: wc.slug,
          reason: "Supabase not configured — image upload skipped, re-run with NEXT_PUBLIC_SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY set",
        });
      }

      for (const v of variants) {
        await prisma.productVariant.upsert({
          where: { sku: v.sku },
          update: {
            productId: product.id,
            color: v.color,
            size: v.size,
            price: v.price,
            compareAtPrice: v.compareAtPrice,
            stockQuantity: v.stockQuantity,
          },
          create: {
            productId: product.id,
            sku: v.sku,
            color: v.color,
            size: v.size,
            price: v.price,
            compareAtPrice: v.compareAtPrice,
            stockQuantity: v.stockQuantity,
          },
        });
      }
    } catch (err) {
      report.errors.push({ type: "product", id: wc.id, slug: wc.slug, error: String(err) });
    }
  }
}

// ── Orders ──────────────────────────────────────────────────────────

interface WcLineItem {
  name: string;
  quantity: number;
  price: number;
  sku: string;
  meta_data: { key: string; value: string }[];
}
interface WcOrder {
  id: number;
  number: string;
  status: string;
  date_created: string;
  billing: { first_name: string; last_name: string; phone: string; email: string };
  shipping: { address_1: string; city: string; state: string };
  payment_method: string;
  line_items: WcLineItem[];
  shipping_total: string;
  total: string;
  customer_note: string;
}

const WC_STATUS_MAP: Record<string, string> = {
  pending: "pending_payment",
  processing: "processing",
  "on-hold": "on_hold",
  completed: "completed",
  cancelled: "cancelled",
  refunded: "refunded",
  failed: "cancelled",
};

async function migrateOrders() {
  console.log("Fetching WooCommerce orders…");
  const wcOrders = await wcFetchAllPages<WcOrder>("/orders");
  console.log(`  → ${wcOrders.length} orders found`);

  for (const wc of wcOrders) {
    try {
      if (DRY_RUN) continue;

      const orderNumber = `SL-WC-${wc.number}`;
      const existing = await prisma.order.findUnique({ where: { orderNumber } });
      if (existing) continue; // already migrated

      const fullName = `${wc.billing.first_name} ${wc.billing.last_name}`.trim();
      const customer = await prisma.customer.create({
        data: {
          fullName: fullName || "Khách WooCommerce",
          phone: wc.billing.phone || "0000000000",
          email: wc.billing.email || null,
          isGuest: true,
        },
      });

      const address = await prisma.customerAddress.create({
        data: {
          customerId: customer.id,
          recipientName: fullName,
          phone: wc.billing.phone || "0000000000",
          province: wc.shipping.state || "",
          district: "",
          ward: "",
          streetAddress: wc.shipping.address_1 || "",
          isDefault: true,
        },
      });

      const status = WC_STATUS_MAP[wc.status] ?? "on_hold";
      const shippingFee = Number(wc.shipping_total || 0);
      const total = Number(wc.total || 0);
      const subtotal = total - shippingFee;

      const codeNote =
        wc.payment_method && wc.payment_method !== "bacs"
          ? `[Migrated] Đơn hàng gốc thanh toán bằng "${wc.payment_method}" trên WooCommerce — cần đối soát thủ công vì hệ thống mới chỉ hỗ trợ chuyển khoản.`
          : null;

      await prisma.order.create({
        data: {
          orderNumber,
          customerId: customer.id,
          status: status as never,
          subtotal,
          shippingFee,
          total,
          shippingAddressId: address.id,
          note: [wc.customer_note, codeNote].filter(Boolean).join(" | ") || null,
          createdAt: new Date(wc.date_created),
          items: {
            create: wc.line_items.map((li) => ({
              productNameSnapshot: li.name,
              color: li.meta_data.find((m) => /color|màu/i.test(m.key))?.value ?? null,
              size: li.meta_data.find((m) => /size|kích/i.test(m.key))?.value ?? null,
              unitPrice: li.quantity > 0 ? li.price / li.quantity : li.price,
              quantity: li.quantity,
            })),
          },
          statusHistory: {
            create: {
              fromStatus: null,
              toStatus: status,
              note: "Migrated from WooCommerce",
            },
          },
          payments: {
            create: {
              method: "bank_transfer",
              amount: total,
              status: status === "pending_payment" ? "awaiting_confirmation" : "confirmed",
            },
          },
        },
      });
    } catch (err) {
      report.errors.push({ type: "order", id: wc.id, number: wc.number, error: String(err) });
    }
  }
}

async function main() {
  console.log(DRY_RUN ? "Running in --dry-run mode (no writes)." : "Running migration…");
  const categoryIdMap = await migrateCategories();
  await migrateProducts(categoryIdMap);
  await migrateOrders();

  writeFileSync("migration-report.json", JSON.stringify(report, null, 2));
  console.log(
    `\nDone. ${report.skipped.length} items need manual review, ${report.errors.length} errors — see migration-report.json`,
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
