import Link from "next/link";
import { ExternalLink, Plus, Sparkles } from "@/components/admin/Icons";
import { SITE_URL } from "@/helpers/site-url";

export const WelcomeBanner = () => (
  <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-ink via-slate-900 to-brand-forest p-7 sm:p-9 text-white shadow-lg">
    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div className="space-y-2.5">
        <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1 text-xs font-bold text-mint-200 backdrop-blur-sm border border-white/10">
          <Sparkles size={13} />
          <span>Bảng Quản Trị Salt &amp; Light 2026</span>
        </div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">Chào mừng trở lại, Quản trị viên! 👋</h1>
        <p className="text-xs sm:text-sm text-white/75 max-w-xl leading-relaxed">
          Dưới đây là tổng quan hoạt động kinh doanh, tình trạng đơn hàng và doanh số bán hàng của thương hiệu.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 rounded-full bg-mint-300 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-ink hover:bg-white transition-all shadow-sm active:scale-95"
        >
          <Plus size={15} />
          <span>Thêm sản phẩm mới</span>
        </Link>
        <a
          href={SITE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4.5 py-2.5 text-xs font-bold text-white hover:bg-white/25 transition-all backdrop-blur-sm border border-white/10"
        >
          <span>Xem storefront</span>
          <ExternalLink size={13} />
        </a>
      </div>
    </div>
  </div>
);
