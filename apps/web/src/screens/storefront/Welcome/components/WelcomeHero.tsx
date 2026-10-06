import Image from "next/image";
import Link from "next/link";
import { formatVND } from "@saltandlight/domain";
import { ArrowRight } from "@/components/Icons";
import type { ProductCardData } from "@/interfaces/catalog";
import { displayFont, GHOST_BUTTON, PRIMARY_BUTTON } from "./shared";

const FACTS = [
  { value: "100%", label: "Cotton" },
  { value: "7 ngày", label: "Đổi size" },
  { value: "−25%", label: "Đơn số lượng lớn" },
];

// Inline so the delay outlives the `animation` shorthand of .animate-slide-up-fade in globals.css
const rise = (delayMs: number) => ({ animationDelay: `${delayMs}ms`, animationFillMode: "both" as const });

const ORBIT_TEXT = "MUỐI CỦA ĐẤT · ÁNH SÁNG CỦA THẾ GIAN · ";

/** Slowly turning ring of text around the emblem. */
const OrbitBadge = () => (
  <div className="relative h-28 w-28 sm:h-36 sm:w-36">
    <svg viewBox="0 0 200 200" className="absolute inset-0 h-full w-full animate-[spinSlow_28s_linear_infinite] text-brand-forest">
      <defs>
        <path id="welcome-orbit" d="M100,100 m-80,0 a80,80 0 1,1 160,0 a80,80 0 1,1 -160,0" />
      </defs>
      <text fontSize="14" fontWeight="600" letterSpacing="2" fill="currentColor">
        <textPath href="#welcome-orbit" textLength="500">
          {ORBIT_TEXT}
        </textPath>
      </text>
    </svg>
    <div className="absolute inset-[26%] overflow-hidden rounded-full bg-cream shadow-card">
      <Image src="/images/logo-emblem.webp" alt="" fill sizes="80px" className="object-contain p-1.5" />
    </div>
  </div>
);

const WelcomeNav = () => (
  <header className="absolute inset-x-0 top-0 z-20">
    <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6">
      <Link href="/" className="flex items-center gap-2.5">
        <Image src="/images/logo-emblem.webp" alt="" width={36} height={36} className="rounded-full" />
        <span className={`${displayFont.className} text-lg font-semibold tracking-tight text-ink`}>Salt &amp; Light</span>
      </Link>
      <nav className="flex items-center gap-6 text-sm font-medium text-ink/70">
        <Link href="/gioi-thieu" className="hidden transition-colors hover:text-ink sm:inline">
          Về chúng mình
        </Link>
        <Link href="/dat-theo-yeu-cau" className="hidden transition-colors hover:text-ink sm:inline">
          Đặt in theo yêu cầu
        </Link>
        <Link
          href="/san-pham"
          className="rounded-full bg-ink px-4 py-2 text-cream transition-all hover:bg-brand-forest active:scale-[0.98]"
        >
          Vào cửa hàng
        </Link>
      </nav>
    </div>
  </header>
);

export const WelcomeHero = ({ products }: { products: ProductCardData[] }) => {
  const withImages = products.filter((p) => p.imageUrl);
  const [main, second] = withImages;

  return (
    <section className="relative isolate overflow-hidden">
      <WelcomeNav />
      {/* The "light": a warm glow behind the collage */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-48 -top-48 -z-10 h-[720px] w-[720px] rounded-full bg-[radial-gradient(circle,rgba(217,119,6,0.14),transparent_62%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-40 -left-40 -z-10 h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle,rgba(83,156,99,0.12),transparent_65%)]"
      />

      <div className="mx-auto grid min-h-[100dvh] max-w-7xl items-center gap-14 px-4 pb-20 pt-28 sm:px-6 lg:grid-cols-12 lg:gap-10 lg:pt-24">
        <div className="lg:col-span-6">
          <p className="inline-flex animate-slide-up-fade items-center gap-2 rounded-full border border-brand-forest/15 bg-white/70 px-3.5 py-1.5 text-xs font-semibold text-brand-forest">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-mint-500" />
            Thời trang &amp; quà tặng lời Chúa
          </p>

          <h1
            className={`${displayFont.className} mt-7 text-[2.9rem] font-medium leading-[0.98] tracking-tight text-ink sm:text-6xl lg:text-7xl`}
          >
            <span className="block animate-slide-up-fade" style={rise(80)}>Mặc Lời Chúa</span>
            <span className="block animate-slide-up-fade italic text-brand-forest" style={rise(180)}>
              mỗi ngày.
            </span>
          </h1>

          <p className="mt-7 max-w-[46ch] animate-slide-up-fade text-base leading-relaxed text-ink/65 sm:text-lg" style={rise(280)}>
            Áo thun 100% cotton và túi tote canvas in câu Kinh Thánh — đủ đẹp để mặc đi học, đi làm, đi chơi. Không chỉ để
            mặc đi trại.
          </p>

          <div className="mt-9 flex animate-slide-up-fade flex-wrap gap-3" style={rise(380)}>
            <Link href="/san-pham" className={`group ${PRIMARY_BUTTON}`}>
              Khám phá bộ sưu tập
              <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            <Link href="/dat-theo-yeu-cau" className={GHOST_BUTTON}>
              In áo cho nhóm của bạn
            </Link>
          </div>

          <dl className="mt-12 grid max-w-md animate-slide-up-fade grid-cols-3 divide-x divide-ink/10 border-t border-ink/10 pt-6" style={rise(480)}>
            {FACTS.map((fact) => (
              <div key={fact.label} className="flex flex-col-reverse px-4 first:pl-0">
                <dt className="mt-1 text-[11px] font-medium uppercase tracking-[0.14em] text-ink/45">{fact.label}</dt>
                <dd className={`${displayFont.className} text-2xl text-ink sm:text-3xl`}>{fact.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Collage: the two newest featured shirts, the emblem ring and a price tag */}
        <div className="relative mx-auto h-[440px] w-full max-w-[560px] sm:h-[560px] lg:col-span-6 lg:max-w-none">
          <div className="absolute right-0 top-0 w-[70%] animate-slide-up-fade" style={rise(150)}>
            <div className="relative aspect-[4/5] rotate-2 overflow-hidden rounded-[2rem] bg-cream-100 shadow-[0_40px_80px_-30px_rgba(19,62,43,0.45)]">
              <Image
                src={main?.imageUrl ?? "/images/about-story.webp"}
                alt={main?.name ?? "Áo thun và túi tote Salt & Light"}
                fill
                priority
                sizes="(min-width: 1024px) 420px, 70vw"
                className="object-cover"
              />
            </div>
            {main && (
              <Link
                href={`/san-pham/${main.slug}`}
                className="absolute -bottom-5 right-4 flex max-w-[85%] animate-float items-center gap-3 rounded-2xl border border-white/60 bg-white/80 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_16px_32px_-16px_rgba(24,24,27,0.35)] backdrop-blur-md transition-transform hover:-translate-y-0.5 sm:right-8"
              >
                <span className="min-w-0">
                  <span className="block truncate text-xs font-semibold text-ink">{main.name}</span>
                  <span className="block text-sm font-bold text-brand-forest">{formatVND(main.minPrice)}</span>
                </span>
                <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-brand-forest text-cream">
                  <ArrowRight size={14} />
                </span>
              </Link>
            )}
          </div>

          {second?.imageUrl && (
            <div className="absolute bottom-6 left-0 w-[46%] animate-slide-up-fade" style={rise(320)}>
              <div className="animate-[floatSoft_6s_ease-in-out_infinite]">
                <div className="relative aspect-square -rotate-3 overflow-hidden rounded-[1.75rem] bg-cream-100 ring-8 ring-cream shadow-[0_30px_60px_-28px_rgba(19,62,43,0.5)]">
                  <Image src={second.imageUrl} alt={second.name} fill sizes="(min-width: 1024px) 260px, 46vw" className="object-cover" />
                </div>
              </div>
            </div>
          )}

          <div className="absolute left-[4%] top-[4%] animate-slide-up-fade" style={rise(450)}>
            <OrbitBadge />
          </div>
        </div>
      </div>
    </section>
  );
};
