import Image from "next/image";
import Link from "next/link";
import { formatVND } from "@saltandlight/domain";
import { ArrowRight } from "@/components/Icons";
import type { CategoryOption, ProductCardData } from "@/interfaces/catalog";
import { displayFont, Eyebrow, GHOST_BUTTON } from "./shared";

const ProductTile = ({ product, isHero }: { product: ProductCardData; isHero: boolean }) => {
  const hasSale = product.maxCompareAtPrice !== null && product.maxCompareAtPrice > product.minPrice;
  return (
    <Link
      href={`/san-pham/${product.slug}`}
      data-reveal
      className={`group flex w-[72vw] flex-shrink-0 snap-start flex-col sm:w-[44vw] md:w-auto ${isHero ? "md:col-span-2 md:row-span-2" : ""}`}
    >
      <div
        className={`relative aspect-[4/5] overflow-hidden rounded-[1.75rem] bg-cream-100 transition-shadow duration-500 group-hover:shadow-[0_30px_60px_-30px_rgba(19,62,43,0.45)] ${
          isHero ? "md:aspect-auto md:min-h-0 md:flex-1" : ""
        }`}
      >
        {product.imageUrl && (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes={isHero ? "(min-width: 768px) 50vw, 72vw" : "(min-width: 768px) 25vw, 72vw"}
            className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
          />
        )}
        {product.isNew && (
          <span className="absolute left-4 top-4 rounded-full bg-white/85 px-3 py-1 text-[11px] font-semibold text-brand-forest backdrop-blur">
            Mới
          </span>
        )}
      </div>
      <div className="mt-4 flex items-start justify-between gap-4 px-1">
        <p className={`line-clamp-2 font-medium text-ink ${isHero ? `${displayFont.className} text-xl sm:text-2xl` : "text-sm"}`}>
          {product.name}
        </p>
        <p className="flex-shrink-0 text-right">
          <span className="block text-sm font-bold text-brand-forest">{formatVND(product.minPrice)}</span>
          {hasSale && <span className="block text-xs text-ink/40 line-through">{formatVND(product.maxCompareAtPrice!)}</span>}
        </p>
      </div>
    </Link>
  );
};

/** One large tile and four small ones on desktop; a swipeable rail on phones. */
export const FeaturedShowcase = ({ products }: { products: ProductCardData[] }) => (
  <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32">
    <div className="flex flex-wrap items-end justify-between gap-6">
      <div>
        <Eyebrow>Bộ sưu tập</Eyebrow>
        <h2 className={`${displayFont.className} mt-4 text-4xl tracking-tight text-ink sm:text-5xl`}>
          Nổi bật tại <span className="italic text-brand-forest">Salt &amp; Light</span>
        </h2>
      </div>
      <Link href="/san-pham" className={`group ${GHOST_BUTTON}`}>
        Xem tất cả sản phẩm
        <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
      </Link>
    </div>

    {products.length > 0 ? (
      <div className="-mx-4 mt-12 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 sm:-mx-6 sm:px-6 md:mx-0 md:grid md:grid-cols-4 md:gap-6 md:overflow-visible md:px-0 md:pb-0">
        {products.slice(0, 5).map((product, i) => (
          <ProductTile key={product.id} product={product} isHero={i === 0} />
        ))}
      </div>
    ) : (
      <div className="mt-12 rounded-[2rem] border border-dashed border-ink/15 px-6 py-16 text-center">
        <p className={`${displayFont.className} text-2xl text-ink`}>Bộ sưu tập đang được cập nhật</p>
        <p className="mt-2 text-sm text-ink/55">Ghé cửa hàng để xem toàn bộ sản phẩm đang bán.</p>
      </div>
    )}
  </section>
);

/** Editorial index of the categories that have products, biggest first. */
export const CategoryIndex = ({ categories }: { categories: CategoryOption[] }) => {
  if (categories.length === 0) return null;
  return (
    <section className="border-y border-ink/5 bg-white/60 py-24 sm:py-32">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <Eyebrow>Danh mục</Eyebrow>
          <h2 className={`${displayFont.className} mt-4 text-4xl tracking-tight text-ink sm:text-5xl`}>
            Cho cả <span className="italic text-brand-forest">gia đình</span>
          </h2>
          <p className="mt-5 max-w-[38ch] text-base leading-relaxed text-ink/60">
            Từ áo thun người lớn, áo cho bé đến túi tote — mỗi sản phẩm mang theo một câu Lời Chúa.
          </p>
        </div>

        <ul className="divide-y divide-ink/10 border-y border-ink/10 lg:col-span-8">
          {categories.map((category, i) => (
            <li key={category.id} data-reveal>
              <Link
                href={`/san-pham?categories=${encodeURIComponent(category.slug)}`}
                className="group flex items-center gap-5 px-2 py-6 transition-colors duration-300 hover:bg-brand-forest hover:text-cream sm:gap-8 sm:px-5"
              >
                <span className="font-mono text-xs text-ink/35 transition-colors group-hover:text-cream/50">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className={`${displayFont.className} flex-1 text-2xl tracking-tight sm:text-4xl`}>{category.name}</span>
                <span className="hidden text-sm text-ink/45 transition-colors group-hover:text-cream/70 sm:inline">
                  {category.count} mẫu
                </span>
                <ArrowRight size={20} className="-rotate-45 transition-transform duration-300 group-hover:rotate-0" />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};
