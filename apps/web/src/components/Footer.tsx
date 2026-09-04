import Link from "next/link";
import Image from "next/image";
import {
  CrossIcon,
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  Truck,
  RefreshCw,
  Heart
} from "./Icons";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-ink/10 bg-mint-50/70">
      {/* Top Value Banner in Footer */}
      <div className="border-b border-ink/10 bg-white/60 py-10 px-4">
        <div className="mx-auto grid max-w-7xl gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-mint-200 text-brand-forest">
              <Truck size={24} />
            </div>
            <div>
              <h4 className="font-bold text-sm text-ink uppercase tracking-wide">
                Đồng Giá Ship 19K
              </h4>
              <p className="text-xs text-ink/60 mt-0.5">
                Toàn quốc, Freeship đơn từ 299K
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-mint-200 text-brand-forest">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h4 className="font-bold text-sm text-ink uppercase tracking-wide">
                Chất Lượng 100% Cotton
              </h4>
              <p className="text-xs text-ink/60 mt-0.5">
                Vải mềm mịn, co giãn 4 chiều
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-mint-200 text-brand-forest">
              <RefreshCw size={24} />
            </div>
            <div>
              <h4 className="font-bold text-sm text-ink uppercase tracking-wide">
                Đổi Trả 7 Ngày Tận Nơi
              </h4>
              <p className="text-xs text-ink/60 mt-0.5">
                Hỗ trợ đổi size nhanh chóng
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-mint-200 text-brand-forest">
              <Heart size={24} />
            </div>
            <div>
              <h4 className="font-bold text-sm text-ink uppercase tracking-wide">
                Quỹ Yêu Thương
              </h4>
              <p className="text-xs text-ink/60 mt-0.5">
                Trích 5% cho công tác bác ái
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:grid-cols-2 lg:grid-cols-5">
        {/* Col 1: Brand Info */}
        <div className="lg:col-span-2">
          <Link href="/" className="inline-block">
            <div className="relative h-11 w-44">
              <Image
                src="/images/logo.png"
                alt="Salt & Light"
                width={176}
                height={44}
                className="h-full w-auto object-contain object-left"
              />
            </div>
          </Link>
          <p className="mt-4 text-sm text-ink/70 leading-relaxed max-w-sm">
            Thời trang &amp; quà tặng Cơ Đốc — chúng mình mong muốn mang Lời
            Chúa len lỏi vào từng khoảnh khắc thường nhật, là &ldquo;muối&rdquo;
            mặn mà và &ldquo;ánh sáng&rdquo; soi rọi yêu thương.
          </p>

          <div className="mt-6 flex flex-col gap-2.5 text-xs text-ink/70">
            <div className="flex items-center gap-2">
              <MapPin size={15} className="text-brand-forest flex-shrink-0" />
              <span>TP. Hồ Chí Minh, Việt Nam</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone size={15} className="text-brand-forest flex-shrink-0" />
              <span>Hotline/Zalo: 0847 25 2025</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail size={15} className="text-brand-forest flex-shrink-0" />
              <span>Email: saltandlight.lienhe@gmail.com</span>
            </div>
          </div>
        </div>

        {/* Col 2: Categories */}
        <div>
          <div className="text-xs font-black uppercase tracking-wider text-ink">
            Mua sắm
          </div>
          <ul className="mt-4 space-y-2.5 text-sm text-ink/70">
            <li>
              <Link
                href="/san-pham"
                className="hover:text-ink transition-colors"
              >
                Tất cả sản phẩm
              </Link>
            </li>
            <li>
              <Link
                href="/danh-muc/ao-thun-nguoi-lon"
                className="hover:text-ink transition-colors"
              >
                Áo thun người lớn
              </Link>
            </li>
            <li>
              <Link
                href="/danh-muc/ao-thun-cho-be"
                className="hover:text-ink transition-colors"
              >
                Áo thun cho bé
              </Link>
            </li>
            <li>
              <Link
                href="/danh-muc/tui-tote-canvas"
                className="hover:text-ink transition-colors"
              >
                Túi tote canvas
              </Link>
            </li>
            <li>
              <Link
                href="/dat-theo-yeu-cau"
                className="hover:text-ink transition-colors font-medium text-brand-forest"
              >
                Đặt may/in theo yêu cầu ✦
              </Link>
            </li>
          </ul>
        </div>

        {/* Col 3: Support */}
        <div>
          <div className="text-xs font-black uppercase tracking-wider text-ink">
            Hỗ trợ &amp; Dịch vụ
          </div>
          <ul className="mt-4 space-y-2.5 text-sm text-ink/70">
            <li>
              <Link
                href="/tra-cuu-don-hang"
                className="hover:text-ink transition-colors"
              >
                Tra cứu đơn hàng
              </Link>
            </li>
            <li>
              <Link
                href="/chinh-sach"
                className="hover:text-ink transition-colors"
              >
                Chính sách đổi trả 7 ngày
              </Link>
            </li>
            <li>
              <Link
                href="/chinh-sach"
                className="hover:text-ink transition-colors"
              >
                Chính sách giao hàng &amp; thanh toán
              </Link>
            </li>
            <li>
              <Link
                href="/gioi-thieu"
                className="hover:text-ink transition-colors"
              >
                Câu chuyện thương hiệu
              </Link>
            </li>
            <li>
              <Link
                href="/lien-he"
                className="hover:text-ink transition-colors"
              >
                Liên hệ hỗ trợ
              </Link>
            </li>
          </ul>
        </div>

        {/* Col 4: Payment & Trust */}
        <div>
          <div className="text-xs font-black uppercase tracking-wider text-ink">
            Thanh toán an toàn
          </div>
          <p className="mt-4 text-xs text-ink/60">
            Hỗ trợ quét mã VietQR tự động, Chuyển khoản mọi ngân hàng, Ví điện
            tử và COD nhận hàng kiểm tra rồi thanh toán.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-lg border border-ink/10 bg-white px-2.5 py-1 text-[11px] font-bold text-ink">
              VietQR
            </span>
            <span className="rounded-lg border border-ink/10 bg-white px-2.5 py-1 text-[11px] font-bold text-ink">
              Napas 24/7
            </span>
            <span className="rounded-lg border border-ink/10 bg-white px-2.5 py-1 text-[11px] font-bold text-ink">
              MoMo
            </span>
            <span className="rounded-lg border border-ink/10 bg-white px-2.5 py-1 text-[11px] font-bold text-ink">
              COD
            </span>
          </div>


        </div>
      </div>

      {/* Bottom Copyright */}
      <div className="border-t border-ink/10 bg-cream-100 py-6 text-center text-xs text-ink/60">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 sm:flex-row">
          <p>
            © {new Date().getFullYear()} Salt &amp; Light. All rights reserved.
            Lan toả Lời Chúa bằng cả tấm lòng.
          </p>
          <p className="text-[11px] text-ink/40">
            Made with love for the Kingdom 🕊️
          </p>
        </div>
      </div>
    </footer>
  );
}
