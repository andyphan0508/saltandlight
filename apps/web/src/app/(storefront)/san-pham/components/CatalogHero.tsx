import Link from "next/link";
import { ChevronRight } from "@/components/Icons";

export function CatalogHero({ query }: { query?: string }) {
  return (
    <div>
      <nav className="flex items-center gap-2 text-xs font-semibold uppercase text-ink/60">
        <Link href="/" className="hover:text-ink">
          Trang chủ
        </Link>
        <ChevronRight size={12} />
        <span className="text-brand-forest">Sản phẩm</span>
      </nav>

      <h1 className="mt-3 font-display text-3xl font-black uppercase text-ink sm:text-4xl">
        {query ? `Kết quả tìm kiếm: "${query}"` : "Tất cả sản phẩm"}
      </h1>
      <p className="mt-2 max-w-2xl text-sm text-ink/60">
        Thời trang &amp; quà tặng mang thông điệp Lời Chúa — 100% Cotton chất lượng cao, đồng giá ship 19K
        toàn quốc.
      </p>
    </div>
  );
}
