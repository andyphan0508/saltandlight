import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const COLORS = ["Đen", "Trắng"];
const ADULT_SIZES = ["S", "M", "L", "XL"];
const KID_SIZES = ["XS", "S", "M"];

function slugify(name: string) {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/gi, "d")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function makeProduct(opts: {
  name: string;
  categoryId: string;
  price: number;
  compareAt?: number;
  isNew?: boolean;
  sizes: string[];
  image: string;
  description: string;
}) {
  const slug = slugify(opts.name);
  const product = await prisma.product.create({
    data: {
      name: opts.name,
      slug,
      description: opts.description,
      categoryId: opts.categoryId,
      status: "published",
      isNew: opts.isNew ?? false,
      images: {
        create: [{ url: opts.image, sortOrder: 0 }],
      },
      variants: {
        create: COLORS.flatMap((color) =>
          opts.sizes.map((size) => ({
            sku: `${slug}-${slugify(color)}-${size}`.toUpperCase(),
            color,
            size,
            price: opts.price,
            compareAtPrice: opts.compareAt ?? null,
            stockQuantity: 50,
          })),
        ),
      },
    },
  });
  return product;
}

async function main() {
  const existing = await prisma.category.count();
  if (existing > 0) {
    console.log("Database already has categories — skipping seed (safe to re-run).");
    return;
  }

  console.log("Seeding categories...");
  const adultTee = await prisma.category.create({
    data: { name: "Áo thun người lớn", slug: "ao-thun-nguoi-lon" },
  });
  const kidTee = await prisma.category.create({
    data: { name: "Áo thun cho bé", slug: "ao-thun-cho-be" },
  });
  const tote = await prisma.category.create({
    data: { name: "Túi tote canvas", slug: "tui-tote-canvas" },
  });

  console.log("Seeding products...");
  await makeProduct({
    name: "Áo Thun FEARLESS",
    categoryId: adultTee.id,
    price: 182000,
    compareAt: 215000,
    isNew: true,
    sizes: ADULT_SIZES,
    image: "/images/products/fearless.jpg",
    description:
      '"Đừng sợ hãi, vì Ta ở với ngươi" (Ê-sai 41:10). Áo thun cotton 100%, in lụa cao cấp, form unisex regular fit.',
  });
  await makeProduct({
    name: "Áo Thun THE HOLY SPIRIT",
    categoryId: adultTee.id,
    price: 179000,
    compareAt: 215000,
    isNew: true,
    sizes: ADULT_SIZES,
    image: "/images/products/the-holy-spirit.jpg",
    description:
      "Chất liệu cotton 100% co giãn 4 chiều, form unisex. In công nghệ DTG bền màu, không nứt gãy sau nhiều lần giặt.",
  });
  await makeProduct({
    name: "Áo Thun SEEK FIRST THE KINGDOM",
    categoryId: adultTee.id,
    price: 169000,
    compareAt: 215000,
    sizes: ADULT_SIZES,
    image: "/images/products/seek-first.jpg",
    description:
      '"Nhưng trước hết, hãy tìm kiếm Nước Đức Chúa Trời" (Ma-thi-ơ 6:33). Cotton 100%, form regular fit.',
  });
  await makeProduct({
    name: "Áo Thun WALK BY FAITH",
    categoryId: adultTee.id,
    price: 169000,
    compareAt: 215000,
    sizes: ADULT_SIZES,
    image: "/images/products/walk-by-faith.jpg",
    description:
      '"Vì chúng ta bước đi bởi đức tin, chớ chẳng phải bởi mắt thấy" (2 Cô-rinh-tô 5:7).',
  });
  await makeProduct({
    name: "Áo Thun ARMOR OF GOD (Baby Tee)",
    categoryId: kidTee.id,
    price: 158000,
    compareAt: 245000,
    sizes: KID_SIZES,
    image: "/images/products/armor-of-god-kid.jpg",
    description:
      "Áo thun trẻ em chất liệu cotton mềm mịn, an toàn cho da bé. Bảng size quy đổi theo chiều cao/cân nặng trong mô tả chi tiết.",
  });
  await makeProduct({
    name: "Áo Thun GOD'S CHILDREN (Baby Tee)",
    categoryId: kidTee.id,
    price: 155000,
    compareAt: 245000,
    sizes: KID_SIZES,
    image: "/images/products/gods-children-kid.jpg",
    description:
      "Áo thun trẻ em chất liệu cotton mềm mịn, thoáng mát, phù hợp vận động cả ngày.",
  });
  await makeProduct({
    name: "Túi Tote FAITH OVER FEAR",
    categoryId: tote.id,
    price: 129000,
    sizes: ["Free size"],
    image: "/images/products/tote-faith-over-fear.jpg",
    description:
      "Túi tote canvas dày dặn, quai chắc chắn, in lụa không phai màu. Kích thước 35x40cm.",
  });

  console.log("Seeding shipping...");
  const zone = await prisma.shippingZone.create({
    data: { name: "Toàn quốc" },
  });
  await prisma.shippingMethod.createMany({
    data: [
      { zoneId: zone.id, type: "flat_rate", fee: 19000 },
      {
        zoneId: zone.id,
        type: "free_shipping",
        fee: 0,
        freeThreshold: 500000,
      },
    ],
  });

  console.log("Seeding admin owner (link auth_user_id manually after Supabase signup)...");
  await prisma.adminUser.create({
    data: {
      email: "saltandlight.lienhe@gmail.com",
      fullName: "Chủ shop",
      role: "owner",
    },
  });

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
