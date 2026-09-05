import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY environment variables.");
  process.exit(1);
}

async function listStorageFiles(prefix: string): Promise<{ name: string }[]> {
  try {
    const res = await fetch(`${SUPABASE_URL}/storage/v1/object/list/product-images`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SERVICE_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prefix, limit: 100 }),
    });
    if (!res.ok) return [];
    return (await res.json()) as { name: string }[];
  } catch {
    return [];
  }
}

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

async function main() {
  console.log("==================================================");
  console.log("SEEDING / RESTORING SALT & LIGHT DATABASE");
  console.log("==================================================");

  // 1. Categories
  console.log("1. Ensuring categories...");
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
  console.log(`   ✓ ${categories.length} categories upserted.`);

  // 2. Products from WooCommerce Store API
  console.log("2. Fetching products from WooCommerce Store API...");
  try {
    const res = await fetch("https://saltandlight.com.vn/wp-json/wc/store/v1/products?per_page=100");
    if (res.ok) {
      const wcProducts: any[] = await res.json();
      console.log(`   Found ${wcProducts.length} WooCommerce products.`);

      const storageFolders = await listStorageFiles("wc");
      const folderSet = new Set(storageFolders.map((f) => f.name));

      for (const wc of wcProducts) {
        const slug = wc.slug;
        const name = stripHtml(wc.name);
        const description =
          stripHtml(wc.short_description) ||
          stripHtml(wc.description) ||
          "Sản phẩm Cơ Đốc cao cấp từ Salt & Light.";

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

        const unitPrice = parseInt(wc.prices?.price || "189000", 10);
        const regularPrice = parseInt(wc.prices?.regular_price || "0", 10);
        const compareAt = regularPrice > unitPrice ? regularPrice : null;

        let colors: string[] = ["Đen", "Trắng"];
        let sizes: string[] = ["S", "M", "L", "XL"];

        if (categorySlug === "ao-thun-cho-be") {
          sizes = ["XS", "S", "M"];
        } else if (categorySlug === "tui-tote-canvas") {
          colors = ["Canvas Tự Nhiên"];
          sizes = ["Free size"];
        }

        const colorAttr = wc.attributes?.find((a: any) => /color|màu/i.test(a.name));
        if (colorAttr && colorAttr.terms?.length > 0) {
          colors = colorAttr.terms.map((t: any) => t.name);
        }
        const sizeAttr = wc.attributes?.find((a: any) => /size|kích/i.test(a.name));
        if (sizeAttr && sizeAttr.terms?.length > 0) {
          sizes = sizeAttr.terms.map((t: any) => t.name);
        }

        const isFeatured = FEATURED_SLUGS.has(slug);

        const variants = colors.flatMap((color) =>
          sizes.map((size) => ({
            sku: `${slug}-${slugify(color)}-${slugify(size)}`.toUpperCase().slice(0, 50),
            color,
            size,
            price: unitPrice,
            compareAtPrice: compareAt,
            stockQuantity: 50,
          }))
        );

        const minPrice = unitPrice;
        const maxCompareAtPrice = compareAt;

        const product = await prisma.product.upsert({
          where: { slug },
          update: {
            name,
            description,
            categoryId,
            status: "published",
            isFeatured,
            minPrice,
            maxCompareAtPrice,
          },
          create: {
            name,
            slug,
            description,
            categoryId,
            status: "published",
            isFeatured,
            minPrice,
            maxCompareAtPrice,
          },
        });

        let imageUrls: string[] = [];
        if (folderSet.has(slug)) {
          const imgFiles = await listStorageFiles(`wc/${slug}`);
          if (imgFiles && imgFiles.length > 0) {
            const sorted = imgFiles
              .filter((f: any) => !f.name.startsWith("."))
              .sort((a: any, b: any) => a.name.localeCompare(b.name, undefined, { numeric: true }));
            imageUrls = sorted.map(
              (f: any) => `${SUPABASE_URL}/storage/v1/object/public/product-images/wc/${slug}/${f.name}`
            );
          }
        }
        if (imageUrls.length === 0 && wc.images && wc.images.length > 0) {
          imageUrls = wc.images.map((img: any) => img.src);
        }

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
      }
      console.log(`   ✓ Products processed successfully.`);
    }
  } catch (err) {
    console.error("   Warning: Could not fetch WooCommerce live products:", err);
  }

  // 3. Banners
  console.log("3. Restoring banners...");
  await prisma.banner.deleteMany({});
  await prisma.banner.createMany({
    data: [
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
    ],
  });
  console.log("   ✓ Banners restored.");

  // 4. Shipping
  console.log("4. Restoring shipping...");
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
  console.log("   ✓ Shipping methods configured.");

  // 5. Admin user
  console.log("5. Restoring admin owner...");
  await prisma.adminUser.upsert({
    where: { email: "saltandlight.lienhe@gmail.com" },
    update: { fullName: "Chủ shop", role: "owner" },
    create: {
      email: "saltandlight.lienhe@gmail.com",
      fullName: "Chủ shop",
      role: "owner",
    },
  });
  console.log("   ✓ Admin owner confirmed.");
  console.log("Done.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
