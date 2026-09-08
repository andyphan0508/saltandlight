import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles } from "./Icons";

export function HomeAboutIntro() {
  return (
    <section className="relative overflow-hidden pt-4 sm:pt-8 pb-10 sm:pb-14">
      <div className="mx-auto max-w-4xl px-4 text-center">
        {/* Brand Logo & Pill */}
        <div className="flex flex-col items-center justify-center gap-3 mb-6">
          <div className="relative h-12 sm:h-16 w-44 sm:w-56 transition-transform hover:scale-105 duration-200">
            <Image
              src="/images/logo.png"
              alt="Salt & Light"
              fill
              sizes="224px"
              className="object-contain"
              priority
            />
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-mint-100/90 px-3.5 py-1 text-[11px] font-bold uppercase tracking-wider text-brand-forest border border-mint-200/80 shadow-2xs">
            <Sparkles size={12} />
            <span>Thời Trang &amp; Quà Tặng Cơ Đốc</span>
          </span>
        </div>

        {/* Catchphrase Quote */}
        <p className="text-emerald-700 font-medium italic text-base sm:text-lg lg:text-xl tracking-wide mb-3">
          &lsquo;Áo Câu Gốc Thì Chắc Chỉ Mặc Đi Trại Được Thôi?&rsquo;
        </p>

        {/* Main Heading */}
        <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl xl:text-[2.6rem] font-extrabold text-ink tracking-tight mb-5 leading-tight">
          Đó Cũng Là Lí Do Salt &amp; Light Được Ra Đời...
        </h1>

        {/* Description Body */}
        <p className="text-ink/80 text-sm sm:text-base leading-relaxed max-w-2xl sm:max-w-3xl mx-auto mb-10">
          Chúng mình mong muốn mang đến những sản phẩm Cơ Đốc chất lượng, đa dạng mẫu mã, giá thành phải chăng, và quan trọng hơn hết là có tính ứng dụng cao để bạn có thể dễ dàng sử dụng ở mọi nơi... Đó cũng là cách chúng mình sống như &ldquo;muối&rdquo; và &ldquo;ánh sáng&rdquo; cho Chúa, lan toả tình yêu của Ngài đến mọi người!
        </p>

        {/* Centered Photo */}
        <div className="relative mx-auto max-w-xl sm:max-w-2xl overflow-hidden rounded-2xl sm:rounded-3xl shadow-xl border border-mint-200/80 bg-white p-1.5 transition-transform duration-300 hover:shadow-2xl">
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

        {/* Navigation CTAs */}
        <div className="mt-8 sm:mt-10 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          <Link
            href="/san-pham"
            className="inline-flex items-center gap-2.5 rounded-full bg-brand-forest px-7 sm:px-8 py-3.5 sm:py-4 text-xs sm:text-sm font-bold text-white shadow-lg shadow-brand-forest/25 hover:bg-brand-forest/90 hover:scale-105 active:scale-95 transition-all duration-200"
          >
            <span>Khám phá sản phẩm</span>
            <ArrowRight size={16} />
          </Link>
          <Link
            href="/lien-he"
            className="inline-flex items-center gap-2 rounded-full border border-ink/20 bg-white px-6 sm:px-7 py-3.5 sm:py-4 text-xs sm:text-sm font-semibold text-ink/80 hover:bg-cream hover:text-ink hover:border-ink/40 transition-all duration-200 shadow-2xs"
          >
            <span>Liên hệ chúng mình</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
