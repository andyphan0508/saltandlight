import Image from "next/image";
import Link from "next/link";
import { ChevronRight, ArrowRight } from "@/components/Icons";
import { BlockRenderer, type PageBlockData } from "@/components/blocks/BlockRenderer";
import { getCachedPageBlocks } from "@/lib/queries";
import { toPlain } from "@/lib/serialize";

export const metadata = {
  title: "Về chúng tôi · Salt & Light",
  description:
    "Đó cũng là lí do Salt & Light được ra đời — Mang Lời Chúa vào cuộc sống thường nhật qua thời trang Cơ Đốc chất lượng và ý nghĩa.",
};

export const revalidate = 60;

export default async function AboutPage() {
  let blocks: PageBlockData[] = [];
  try {
    blocks = toPlain(await getCachedPageBlocks("gioi-thieu"));
  } catch (err) {
    console.error("AboutPage data fetching error:", err);
  }

  // Filter out PAGE_HERO and CTA_BANNER as the custom hero and CTA are rendered directly
  const additionalBlocks = blocks.filter(
    (b) => b.type !== "PAGE_HERO" && b.type !== "CTA_BANNER"
  );

  return (
    <div className="min-h-screen bg-cream-50/50">
      {/* 1. Header Banner */}
      <div className="border-b border-amber-200/60 bg-[#FDF6D8] py-10 sm:py-14 text-center">
        <div className="mx-auto max-w-4xl px-4">
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-ink">
            Về Chúng Tôi
          </h1>
          <nav className="mt-3 flex items-center justify-center gap-2 text-xs font-medium text-ink/60">
            <Link
              href="/"
              className="hover:text-brand-forest transition-colors font-semibold"
            >
              Home
            </Link>
            <ChevronRight size={13} className="text-ink/40" />
            <span className="text-ink/90 font-semibold">Về chúng tôi</span>
          </nav>
        </div>
      </div>

      {/* 2. Story Section (Matching Screenshot) */}
      <div className="mx-auto max-w-4xl px-4 py-12 sm:py-16 text-center">
        {/* Catchphrase Quote */}
        <p className="text-emerald-700 font-medium italic text-base sm:text-lg tracking-wide mb-3">
          &lsquo;Áo Câu Gốc Thì Chắc Chỉ Mặc Đi Trại Được Thôi?&rsquo;
        </p>

        {/* Main Heading */}
        <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold text-ink tracking-tight mb-5">
          Đó Cũng Là Lí Do Salt &amp; Light Được Ra Đời...
        </h2>

        {/* Description Body */}
        <p className="text-ink/80 text-sm sm:text-base leading-relaxed max-w-2xl sm:max-w-3xl mx-auto mb-10">
          Chúng mình mong muốn mang đến những sản phẩm Cơ Đốc chất lượng, đa dạng mẫu mã, giá thành phải chăng, và quan trọng hơn hết là có tính ứng dụng cao để bạn có thể dễ dàng sử dụng ở mọi nơi... Đó cũng là cách chúng mình sống như &ldquo;muối&rdquo; và &ldquo;ánh sáng&rdquo; cho Chúa, lan toả tình yêu của Ngài đến mọi người!
        </p>

        {/* Centered Photo */}
        <div className="relative mx-auto max-w-xl sm:max-w-2xl overflow-hidden rounded-2xl sm:rounded-3xl shadow-xl border border-mint-200/80 bg-white p-1">
          <div className="relative aspect-[16/10] w-full overflow-hidden rounded-[14px] sm:rounded-[22px]">
            <Image
              src="/images/about-story.webp"
              alt="Salt & Light - Áo thun câu gốc Cơ Đốc"
              fill
              sizes="(max-width: 768px) 100vw, 672px"
              className="object-cover"
              priority
            />
          </div>
        </div>

        {/* Product Navigation CTA Button */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/san-pham"
            className="inline-flex items-center gap-2.5 rounded-full bg-brand-forest px-8 py-4 text-sm font-bold text-white shadow-lg shadow-brand-forest/25 hover:bg-brand-forest/90 hover:scale-105 active:scale-95 transition-all duration-300"
          >
            <span>Khám phá sản phẩm</span>
            <ArrowRight size={16} />
          </Link>
          <Link
            href="/lien-he"
            className="inline-flex items-center gap-2 rounded-full border border-ink/20 bg-white px-7 py-4 text-sm font-semibold text-ink/80 hover:bg-cream hover:text-ink transition-all duration-200"
          >
            <span>Liên hệ chúng mình</span>
          </Link>
        </div>

        {/* 3. Additional CMS Blocks (e.g. 3 Core Values) */}
        {additionalBlocks.length > 0 && (
          <div className="mt-20 pt-16 border-t border-mint-200/60 space-y-16 text-left">
            {additionalBlocks.map((block) => (
              <BlockRenderer key={block.id} block={block} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
