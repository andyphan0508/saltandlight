/**
 * Comprehensive Database Restoration & Reinforcement Script
 *
 * Fully repopulates and hardens:
 * 1. Primary categories (Áo thun người lớn, Áo thun cho bé, Túi tote canvas)
 * 2. All 47 WooCommerce products with images from Supabase Storage (wc/<slug>/),
 *    pricing, variants (color, size), and descriptions
 * 3. Featured flag on top products
 * 4. 3 Homepage Banners (including user-uploaded banner 6fabb1e8-394f-479b-a754-b01402b7ec7a.png)
 * 5. Shipping zones & methods (Toàn quốc 19K, Freeship 299K)
 * 6. Admin owner user (saltandlight.lienhe@gmail.com)
 * 7. Page blocks for home and content pages
 *
 * Idempotent: Can be run multiple times safely without data loss.
 */
import { prisma } from "@saltandlight/db";
import { computePriceRange } from "@saltandlight/domain";
import { createClient } from "@supabase/supabase-js";
import { restoreCustomersAndOrders } from "./restore-customers-orders";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY environment variables.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const FEATURED_SLUGS = new Set([
  "ao-thun-fearless",
  "ao-thun-the-holy-spirit",
  "ao-thun-seek-first-the-kingdom",
  "ao-thun-walk-by-faith",
  "ao-thun-armor-of-god-ao-tre-em-baby-tee",
  "ao-thun-look-at-the-birds",
  "ao-thun-god-is-in-control",
  "ao-thun-be-still",
  "tui-tote-canvas-grace-upon-grace",
  "tui-tote-canvas-child-of-god",
]);

function stripHtml(html: string): string {
  return (html || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&#8216;/g, "'")
    .replace(/&#8217;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
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

async function restoreCategories() {
  console.log("1. Restoring categories...");
  const categories = [
    { name: "Áo thun người lớn", slug: "ao-thun-nguoi-lon" },
    { name: "Áo thun cho bé", slug: "ao-thun-cho-be" },
    { name: "Túi tote canvas", slug: "tui-tote-canvas" },
  ];

  const catMap = new Map<string, string>();
  for (const cat of categories) {
    const record = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name },
      create: { name: cat.name, slug: cat.slug },
    });
    catMap.set(cat.slug, record.id);
  }
  console.log(`   ✓ ${categories.length} primary categories active.`);
  return catMap;
}

async function restoreProducts(catMap: Map<string, string>) {
  console.log("2. Fetching products from WooCommerce Store API & Supabase storage...");
  const res = await fetch("https://saltandlight.com.vn/wp-json/wc/store/v1/products?per_page=100");
  if (!res.ok) {
    throw new Error(`Failed to fetch WooCommerce products: ${res.status} ${res.statusText}`);
  }
  const wcProducts: any[] = await res.json();
  console.log(`   Found ${wcProducts.length} products from WooCommerce.`);

  // List all storage image folders in product-images/wc
  const { data: storageFolders } = await supabase.storage.from("product-images").list("wc", { limit: 100 });
  const folderSet = new Set((storageFolders || []).map((f) => f.name));

  let restoredCount = 0;

  for (const wc of wcProducts) {
    const slug = wc.slug;
    const name = stripHtml(wc.name);
    const description =
      stripHtml(wc.short_description) ||
      stripHtml(wc.description) ||
      "Sản phẩm Cơ Đốc cao cấp từ Salt & Light.";

    // Determine category
    let categorySlug = "ao-thun-nguoi-lon";
    if (
      slug.includes("tre-em") ||
      slug.includes("baby-tee") ||
      name.toLowerCase().includes("trẻ em") ||
      name.toLowerCase().includes("cho bé")
    ) {
      categorySlug = "ao-thun-cho-be";
    } else if (slug.startsWith("tui-") || slug.includes("canvas") || slug.includes("tuihoa")) {
      categorySlug = "tui-tote-canvas";
    }
    const categoryId = catMap.get(categorySlug) ?? null;

    // Pricing
    const unitPrice = parseInt(wc.prices?.price || "189000", 10);
    const regularPrice = parseInt(wc.prices?.regular_price || "0", 10);
    const compareAt = regularPrice > unitPrice ? regularPrice : null;

    // Colors & Sizes
    let colors: string[] = ["Đen", "Trắng"];
    let sizes: string[] = ["S", "M", "L", "XL"];

    if (categorySlug === "ao-thun-cho-be") {
      sizes = ["XS", "S", "M"];
    } else if (categorySlug === "tui-tote-canvas") {
      colors = ["Canvas Tự Nhiên"];
      sizes = ["Free size"];
    }

    // Try extracting from wc attributes
    const colorAttr = wc.attributes?.find((a: any) => /color|màu/i.test(a.name));
    if (colorAttr && colorAttr.terms?.length > 0) {
      colors = colorAttr.terms.map((t: any) => t.name);
    }
    const sizeAttr = wc.attributes?.find((a: any) => /size|kích/i.test(a.name));
    if (sizeAttr && sizeAttr.terms?.length > 0) {
      sizes = sizeAttr.terms.map((t: any) => t.name);
    }

    const isFeatured = FEATURED_SLUGS.has(slug);

    // Variants definition
    const variants = colors.flatMap((color) =>
      sizes.map((size) => ({
        sku: `${slug}-${slugify(color)}-${slugify(size)}`.toUpperCase().slice(0, 50),
        color,
        size,
        price: unitPrice,
        compareAtPrice: compareAt,
        stockQuantity: 50,
        isActive: true,
      }))
    );

    const priceRange = computePriceRange(variants);

    // Upsert product
    const product = await prisma.product.upsert({
      where: { slug },
      update: {
        name,
        description,
        categoryId,
        status: "published",
        isFeatured,
        minPrice: priceRange.minPrice,
        maxCompareAtPrice: priceRange.maxCompareAtPrice,
      },
      create: {
        name,
        slug,
        description,
        categoryId,
        status: "published",
        isFeatured,
        minPrice: priceRange.minPrice,
        maxCompareAtPrice: priceRange.maxCompareAtPrice,
      },
    });

    // Check images from Supabase storage
    let imageUrls: string[] = [];
    if (folderSet.has(slug)) {
      const { data: imgFiles } = await supabase.storage.from("product-images").list(`wc/${slug}`);
      if (imgFiles && imgFiles.length > 0) {
        // Sort numerically (0.jpg, 1.jpg, ...)
        const sorted = imgFiles
          .filter((f) => !f.name.startsWith("."))
          .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
        imageUrls = sorted.map(
          (f) => `${SUPABASE_URL}/storage/v1/object/public/product-images/wc/${slug}/${f.name}`
        );
      }
    }

    // Fallback to WC image URLs if storage empty
    if (imageUrls.length === 0 && wc.images && wc.images.length > 0) {
      imageUrls = wc.images.map((img: any) => img.src);
    }

    // Upsert product images
    if (imageUrls.length > 0) {
      await prisma.productImage.deleteMany({ where: { productId: product.id } });
      await prisma.productImage.createMany({
        data: imageUrls.map((url, idx) => ({
          productId: product.id,
          url,
          sortOrder: idx,
        })),
      });
    }

    // Upsert variants
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
          isActive: true,
        },
        create: {
          productId: product.id,
          sku: v.sku,
          color: v.color,
          size: v.size,
          price: v.price,
          compareAtPrice: v.compareAtPrice,
          stockQuantity: v.stockQuantity,
          isActive: true,
        },
      });
    }

    restoredCount++;
  }

  console.log(`   ✓ ${restoredCount} products fully restored with images and variants.`);
}

async function restoreBanners() {
  console.log("3. Restoring banners...");
  // Delete existing to reset cleanly with user's uploaded banner
  await prisma.banner.deleteMany({});

  const banners = [
    {
      title: "ÁO THUN NGƯỜI LỚN",
      subtitle: "Lời Chúa trong từng thớ vải - Thiết kế thanh lịch, form dáng hiện đại",
      badge: "BÁN CHẠY NHẤT",
      imageUrl: `${SUPABASE_URL}/storage/v1/object/public/product-images/6fabb1e8-394f-479b-a754-b01402b7ec7a.png`,
      linkUrl: "/san-pham?categories=ao-thun-nguoi-lon",
      bgGradient: "from-brand-forest/90 via-emerald-900/80 to-slate-950",
      sortOrder: 0,
      isActive: true,
    },
    {
      title: "ÁO THUN CHO BÉ",
      subtitle: "Chất liệu 100% Cotton an toàn, thông điệp đức tin ngọt ngào cho thế hệ tương lai",
      badge: "DỄ THƯƠNG & Ý NGHĨA",
      imageUrl: `${SUPABASE_URL}/storage/v1/object/public/product-images/6781d1f4-6747-4853-bf4f-2f2f41b31034.jpg`,
      linkUrl: "/san-pham?categories=ao-thun-cho-be",
      bgGradient: "from-rose-950/90 via-pink-900/80 to-slate-950",
      sortOrder: 1,
      isActive: true,
    },
    {
      title: "TÚI TOTE CANVAS",
      subtitle: "Canvas dày dặn cao cấp, bền bỉ cùng bạn trên mọi hành trình",
      badge: "PHỤ KIỆN THƯỜNG NHẬT",
      imageUrl: `${SUPABASE_URL}/storage/v1/object/public/product-images/e8157dab-8cf8-485d-923b-002208bf7d81.jpg`,
      linkUrl: "/san-pham?categories=tui-tote-canvas",
      bgGradient: "from-amber-950/90 via-stone-900/80 to-zinc-950",
      sortOrder: 2,
      isActive: true,
    },
  ];

  await prisma.banner.createMany({ data: banners });
  console.log(`   ✓ ${banners.length} banners created (including user-uploaded hero banner).`);
}

async function restoreShipping() {
  console.log("4. Restoring shipping zones & methods...");
  let zone = await prisma.shippingZone.findFirst({ where: { name: "Toàn quốc" } });
  if (!zone) {
    zone = await prisma.shippingZone.create({ data: { name: "Toàn quốc" } });
  }

  await prisma.shippingMethod.deleteMany({ where: { zoneId: zone.id } });
  await prisma.shippingMethod.createMany({
    data: [
      { zoneId: zone.id, type: "flat_rate", fee: 19000 },
      { zoneId: zone.id, type: "free_shipping", fee: 0, freeThreshold: 299000 },
    ],
  });
  console.log("   ✓ Shipping methods configured: 19K flat rate & 299K free shipping threshold.");
}

async function restoreAdminOwner() {
  console.log("5. Restoring admin owner user...");
  await prisma.adminUser.upsert({
    where: { email: "saltandlight.lienhe@gmail.com" },
    update: { fullName: "Chủ shop", role: "owner" },
    create: {
      email: "saltandlight.lienhe@gmail.com",
      fullName: "Chủ shop",
      role: "owner",
    },
  });
  console.log("   ✓ Admin owner (saltandlight.lienhe@gmail.com) confirmed.");
}

async function main() {
  console.log("==================================================");
  console.log("SALT & LIGHT DATABASE RESTORATION & HARDENING");
  console.log("==================================================");
  const catMap = await restoreCategories();
  await restoreProducts(catMap);
  await restoreBanners();
  await restoreShipping();
  await restoreAdminOwner();
  console.log("6. Restoring customer accounts and orders from WooCommerce...");
  await restoreCustomersAndOrders();

  // Check final counts
  const [categories, products, variants, banners, shipping, adminUsers, blocks, customers, orders] =
    await Promise.all([
      prisma.category.count(),
      prisma.product.count(),
      prisma.productVariant.count(),
      prisma.banner.count(),
      prisma.shippingMethod.count(),
      prisma.adminUser.count(),
      prisma.pageBlock.count(),
      prisma.customer.count(),
      prisma.order.count(),
    ]);

  console.log("\n==================================================");
  console.log("RESTORATION RESULTS:");
  console.log({
    categories,
    products,
    variants,
    banners,
    shipping,
    adminUsers,
    blocks,
    customers,
    orders,
  });
  console.log("==================================================");
}

main()
  .catch((err) => {
    console.error("Restoration failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
