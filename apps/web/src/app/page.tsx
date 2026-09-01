import Link from "next/link";
import { Button } from "@saltandlight/ui";

export const dynamic = "force-dynamic";
import { listPublishedProducts } from "@/lib/queries";
import { toPlain } from "@/lib/serialize";
import { ProductGrid } from "@/components/ProductGrid";

const HERO_TILES = [
  { title: "Áo thun", href: "/danh-muc/ao-thun-nguoi-lon" },
  { title: "Túi tote", href: "/danh-muc/tui-tote-canvas" },
  { title: "Áo thun cho bé", href: "/danh-muc/ao-thun-cho-be" },
];

export default async function HomePage() {
  const products = toPlain(await listPublishedProducts());

  return (
    <div>
      <section className="grid gap-4 px-4 py-6 sm:grid-cols-3">
        {HERO_TILES.map((tile) => (
          <Link
            key={tile.href}
            href={tile.href}
            className="flex aspect-[4/5] flex-col items-start justify-end rounded-3xl bg-mint-100 p-8"
          >
            <h2 className="font-display text-3xl font-black uppercase">{tile.title}</h2>
            <span className="mt-4 inline-block rounded-pill bg-ink px-6 py-2.5 text-xs font-semibold uppercase text-white">
              Xem ngay
            </span>
          </Link>
        ))}
      </section>

      <section className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h2 className="font-display text-2xl font-black uppercase">Giới thiệu</h2>
        <p className="mt-4 text-ink/70">
          Chúng mình mong muốn mang đến những sản phẩm thời trang và quà tặng Cơ Đốc chất
          lượng, chỉn chu và có tính ứng dụng cao để các bạn có thể sử dụng hằng ngày, để
          chúng mình sẽ là &ldquo;muối&rdquo; và &ldquo;ánh sáng&rdquo; mang lời Chúa đến cho nhiều người!
        </p>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="font-display text-2xl font-black uppercase">Sản phẩm nổi bật</h2>
          <Link href="/san-pham">
            <Button variant="outline" size="sm">
              Xem tất cả
            </Button>
          </Link>
        </div>
        <ProductGrid products={products.slice(0, 8)} />
      </section>
    </div>
  );
}
