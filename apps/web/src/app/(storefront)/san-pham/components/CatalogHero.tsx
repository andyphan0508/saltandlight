import Link from "next/link";
import { ChevronRight } from "@/components/Icons";

export function CatalogHero({
  query,
  categoryName,
}: {
  query?: string;
  categoryName?: string;
}) {
  const title = query
    ? `Kết quả tìm kiếm: "${query}"`
    : categoryName
    ? categoryName
    : "Tất cả sản phẩm";

  return (
    <div>
      <nav className="flex items-center gap-2 text-xs font-semibold uppercase text-ink/60">
        <Link href="/" className="hover:text-ink">
          Trang chủ
        </Link>
        <ChevronRight size={12} />
        <Link href="/san-pham" className={categoryName ? "hover:text-ink" : "text-brand-forest"}>
          Sản phẩm
        </Link>
        {categoryName && (
          <>
            <ChevronRight size={12} />
            <span className="text-brand-forest">{categoryName}</span>
          </>
        )}
      </nav>

      <h1 className="mt-3 font-display text-3xl font-bold uppercase text-ink sm:text-4xl">
        {title}
      </h1>
      <p className="mt-2 max-w-2xl text-sm text-ink/60">
        Thời trang &amp; quà tặng mang thông điệp Lời Chúa — 100% Cotton chất lượng cao, đồng giá ship 19K
        toàn quốc.
      </p>
    </div>
  );
}

