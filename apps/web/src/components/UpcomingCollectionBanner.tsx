import Link from "next/link";
import Image from "next/image";

export interface UpcomingCollectionBannerProps {
  title?: string;
  categoryName?: string;
  description?: string;
  ctaLabel?: string;
  ctaHref?: string;
  className?: string;
}

/**
 * Reusable banner component for upcoming collections or empty product states,
 * styled with a dotted grid background and illustration.
 */
export function UpcomingCollectionBanner({
  title = "BỘ SƯU TẬP MỚI SẮP ĐƯỢC RA MẮT",
  categoryName,
  description,
  ctaLabel = "KHÁM PHÁ SẢN PHẨM",
  ctaHref = "/san-pham",
  className = "",
}: UpcomingCollectionBannerProps) {
  const effectiveDescription =
    description ||
    (categoryName
      ? `Các sản phẩm thuộc danh mục ${categoryName} sẽ sớm có mặt. Bạn có thể khám phá thêm các bộ sưu tập khác của Salt & Light!`
      : "Các sản phẩm mới sẽ sớm có mặt. Bạn có thể khám phá thêm các bộ sưu tập khác của Salt & Light!");

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-ink/10 bg-[#f8f9fa] p-6 sm:p-8 lg:p-10 shadow-xs transition-all ${className}`}
      style={{
        backgroundImage: "radial-gradient(#cbd5e1 1.2px, transparent 1.2px)",
        backgroundSize: "14px 14px",
      }}
    >
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
        {/* Left Content */}
        <div className="flex-1 text-left">
          <h3 className="font-display text-xl sm:text-2xl lg:text-3xl font-black uppercase tracking-tight text-ink">
            {title}
          </h3>
          <p className="mt-2.5 text-xs sm:text-sm text-ink/75 max-w-xl leading-relaxed">
            {effectiveDescription}
          </p>
          <div className="mt-5 sm:mt-6">
            <Link
              href={ctaHref}
              className="inline-flex items-center justify-center rounded-xl border border-ink/30 bg-[#f8f9fa]/90 px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-ink transition-all hover:border-ink hover:bg-white active:scale-[0.98] shadow-xs"
            >
              {ctaLabel}
            </Link>
          </div>
        </div>

        {/* Right Illustration */}
        <div className="relative flex-shrink-0 w-48 sm:w-60 md:w-72 h-36 sm:h-44 md:h-48 pointer-events-none select-none">
          <Image
            src="/images/upcoming-collection-bags.png"
            alt="Bộ sưu tập mới sắp ra mắt"
            fill
            className="object-contain object-right-bottom"
            sizes="(min-width: 768px) 300px, 240px"
          />
        </div>
      </div>
    </div>
  );
}
