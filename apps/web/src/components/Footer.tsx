import Link from "next/link";
import Image from "next/image";
import { Phone, Mail, MapPin, ShieldCheck, Truck, RefreshCw, Heart, Sparkles } from "./Icons";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-ink/10 bg-mint-50/80 text-ink">
      {/* 1. Top Value Proposition Banner */}
      <div className="border-b border-ink/10 bg-white/80 py-10 px-4">
        <div className="mx-auto grid max-w-7xl gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-mint-200 text-brand-forest shadow-sm">
              <Truck size={24} />
            </div>
            <div>
              <h4 className="font-bold text-xs sm:text-sm text-ink uppercase tracking-wider">
                Đồng Giá Ship 19K
              </h4>
              <p className="text-xs text-ink/65 mt-0.5">Toàn quốc • Freeship đơn từ 299K</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-mint-200 text-brand-forest shadow-sm">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h4 className="font-bold text-xs sm:text-sm text-ink uppercase tracking-wider">
                100% Cotton 4 Chiều
              </h4>
              <p className="text-xs text-ink/65 mt-0.5">Vải mềm mịn, in DTG bền màu</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-mint-200 text-brand-forest shadow-sm">
              <RefreshCw size={24} />
            </div>
            <div>
              <h4 className="font-bold text-xs sm:text-sm text-ink uppercase tracking-wider">
                Đổi Size 7 Ngày Tận Nhà
              </h4>
              <p className="text-xs text-ink/65 mt-0.5">Hỗ trợ đổi mẫu nhanh chóng</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-mint-200 text-brand-forest shadow-sm">
              <Heart size={24} />
            </div>
            <div>
              <h4 className="font-bold text-xs sm:text-sm text-ink uppercase tracking-wider">
                Quỹ Bác Ái Yêu Thương
              </h4>
              <p className="text-xs text-ink/65 mt-0.5">Trích 5% lợi nhuận vì cộng đồng</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Footer Links & Info */}
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:grid-cols-2 lg:grid-cols-5">
        {/* Col 1: Brand Info with Circular Emblem Logo */}
        <div className="lg:col-span-2 space-y-4">
          <Link href="/" className="flex items-center gap-4 group">
            <div className="relative h-20 w-20 sm:h-24 sm:w-24 flex-shrink-0 overflow-hidden rounded-full bg-white p-1 shadow-md border border-mint-200 transition-transform duration-300 group-hover:scale-105">
              <Image
                src="/images/logo-emblem.webp"
                alt="Salt & Light Emblem Logo"
                fill
                sizes="96px"
                className="object-contain p-1"
              />
            </div>
            <div>
              <span className="font-display text-xl sm:text-2xl font-black uppercase tracking-tight text-ink block">
                Salt &amp; Light
              </span>
              <span className="text-xs font-bold text-brand-forest tracking-wider uppercase block mt-0.5">
                Áo Thun &amp; Quà Tặng Lời Chúa
              </span>
              <p className="text-[11px] text-ink/60 mt-1 italic">
                &ldquo;Muối của đất &amp; Ánh sáng của thế gian&rdquo;
              </p>
            </div>
          </Link>

          <p className="text-xs sm:text-sm text-ink/75 leading-relaxed max-w-sm pt-2">
            Chúng mình mong muốn mang Lời Hằng Sống của Chúa len lỏi vào từng khoảnh khắc thường nhật,
            lan toả đức tin và yêu thương qua từng sản phẩm thời trang Cơ Đốc chỉn chu.
          </p>

          <div className="space-y-2 text-xs text-ink/70 pt-2">
            <div className="flex items-center gap-2">
              <MapPin size={15} className="text-brand-forest flex-shrink-0" />
              <span>TP. Hồ Chí Minh, Việt Nam</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone size={15} className="text-brand-forest flex-shrink-0" />
              <span>Hotline/Zalo: <strong>0847 25 2025</strong> (8:30 - 21:00)</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail size={15} className="text-brand-forest flex-shrink-0" />
              <span>Email: <strong>saltandlight.lienhe@gmail.com</strong></span>
            </div>
          </div>
        </div>

        {/* Col 2: Mua sắm */}
        <div>
          <h3 className="text-xs font-black uppercase tracking-wider text-ink mb-4">
            Mua sắm
          </h3>
          <ul className="space-y-2.5 text-xs sm:text-sm text-ink/75">
            <li>
              <Link href="/san-pham" className="hover:text-brand-forest transition-colors">
                Tất cả sản phẩm
              </Link>
            </li>
            <li>
              <Link href="/danh-muc/ao-thun" className="hover:text-brand-forest transition-colors">
                Áo thun người lớn
              </Link>
            </li>
            <li>
              <Link href="/danh-muc/ao-thun-cho-be" className="hover:text-brand-forest transition-colors">
                Áo thun cho bé
              </Link>
            </li>
            <li>
              <Link href="/danh-muc/tui-canvas" className="hover:text-brand-forest transition-colors">
                Túi tote canvas
              </Link>
            </li>
            <li>
              <Link
                href="/dat-theo-yeu-cau"
                className="font-bold text-brand-forest hover:underline transition-all"
              >
                Đặt may áo nhóm / Hội thánh ✦
              </Link>
            </li>
          </ul>
        </div>

        {/* Col 3: Hỗ trợ & Dịch vụ */}
        <div>
          <h3 className="text-xs font-black uppercase tracking-wider text-ink mb-4">
            Hỗ trợ &amp; Dịch vụ
          </h3>
          <ul className="space-y-2.5 text-xs sm:text-sm text-ink/75">
            <li>
              <Link href="/tra-cuu-don-hang" className="hover:text-brand-forest transition-colors">
                Tra cứu đơn hàng
              </Link>
            </li>
            <li>
              <Link href="/chinh-sach" className="hover:text-brand-forest transition-colors">
                Chính sách đổi trả 7 ngày
              </Link>
            </li>
            <li>
              <Link href="/chinh-sach" className="hover:text-brand-forest transition-colors">
                Biểu phí giao hàng 19K
              </Link>
            </li>
            <li>
              <Link href="/gioi-thieu" className="hover:text-brand-forest transition-colors">
                Câu chuyện thương hiệu
              </Link>
            </li>
            <li>
              <Link href="/lien-he" className="hover:text-brand-forest transition-colors">
                Liên hệ hỗ trợ
              </Link>
            </li>
          </ul>
        </div>

        {/* Col 4: Thanh toán an toàn */}
        <div>
          <h3 className="text-xs font-black uppercase tracking-wider text-ink mb-4">
            Thanh toán an toàn
          </h3>
          <p className="text-xs text-ink/70 leading-relaxed mb-4">
            Hỗ trợ chuyển khoản tự động qua mã VietQR Napas 24/7, Ví MoMo và thanh toán COD khi nhận hàng.
          </p>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-lg border border-ink/10 bg-white px-2.5 py-1 text-[11px] font-bold text-ink shadow-xs">
              VietQR
            </span>
            <span className="rounded-lg border border-ink/10 bg-white px-2.5 py-1 text-[11px] font-bold text-ink shadow-xs">
              Napas 24/7
            </span>
            <span className="rounded-lg border border-ink/10 bg-white px-2.5 py-1 text-[11px] font-bold text-ink shadow-xs">
              MoMo
            </span>
            <span className="rounded-lg border border-ink/10 bg-white px-2.5 py-1 text-[11px] font-bold text-ink shadow-xs">
              COD
            </span>
          </div>

          <div className="mt-6 rounded-2xl bg-mint-200/70 p-3.5 text-xs text-brand-forest border border-mint-300/50">
            <p className="font-bold">&ldquo;Các con là muối của đất... Các con là ánh sáng của thế gian.&rdquo;</p>
            <p className="mt-1 text-[11px] opacity-80">— Ma-thi-ơ 5:13-14</p>
          </div>
        </div>
      </div>

      {/* 3. Bottom Copyright Bar */}
      <div className="border-t border-ink/10 bg-cream-100 py-6 text-center text-xs text-ink/65">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 sm:flex-row">
          <p>© {new Date().getFullYear()} Salt &amp; Light. All rights reserved. Lan toả Lời Chúa bằng cả tấm lòng.</p>
          <p className="text-[11px] text-brand-forest font-semibold">saltandlight.com.vn 🕊️</p>
        </div>
      </div>
    </footer>
  );
}
