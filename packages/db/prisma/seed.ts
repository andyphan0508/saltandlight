import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Banner images live in the Supabase "product-images" bucket
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
if (!SUPABASE_URL) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL environment variable.");
  process.exit(1);
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

  // 2. Banners
  console.log("2. Restoring banners...");
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

  // 3. Shipping
  console.log("3. Restoring shipping...");
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

  // 4. Admin user
  console.log("4. Restoring admin owner...");
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
