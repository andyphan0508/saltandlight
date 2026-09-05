import Link from "next/link";
import Image from "next/image";
import {
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  Truck,
  RefreshCw,
  Sparkles,
} from "./Icons";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-ink/10 bg-mint-50/70">
      {/* Top Value Banner in Footer */}
      <div className="border-b border-ink/10 bg-white/60 py-8 px-4">
        <div className="mx-auto grid max-w-7xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-mint-200 text-brand-forest">
              <Truck size={22} />
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

          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-mint-200 text-brand-forest">
              <ShieldCheck size={22} />
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

          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-mint-200 text-brand-forest">
              <RefreshCw size={22} />
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

          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-mint-200 text-brand-forest">
              <Sparkles size={22} />
            </div>
            <div>
              <h4 className="font-bold text-sm text-ink uppercase tracking-wide">
                Tư Vấn Tận Tâm 24/7
              </h4>
              <p className="text-xs text-ink/60 mt-0.5">
                Hỗ trợ size &amp; mẫu qua Zalo/Hotline
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links - Aligned with saltandlight.com.vn */}
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:grid-cols-2 lg:grid-cols-5">
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
              <span>Hồ Chí Minh, Việt Nam</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone size={15} className="text-brand-forest flex-shrink-0" />
              <span>Phone: (+84) 847 25 2025</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail size={15} className="text-brand-forest flex-shrink-0" />
              <span>Email: saltandlight.lienhe@gmail.com</span>
            </div>
          </div>
        </div>

        {/* Col 2: VỀ CHÚNG TÔI */}
        <div>
          <div className="text-xs font-black uppercase tracking-wider text-ink">
            Về Chúng Tôi
          </div>
          <ul className="mt-4 space-y-2.5 text-sm text-ink/70">
            <li>
              <Link href="/gioi-thieu" className="hover:text-ink transition-colors">
                Giới thiệu
              </Link>
            </li>
            <li>
              <Link href="/lien-he" className="hover:text-ink transition-colors">
                Liên hệ
              </Link>
            </li>
            <li>
              <Link href="/chinh-sach" className="hover:text-ink transition-colors">
                Chính sách đổi trả
              </Link>
            </li>
            <li>
              <Link href="/tra-cuu-don-hang" className="hover:text-ink transition-colors">
                Tra cứu đơn hàng
              </Link>
            </li>
          </ul>
        </div>

        {/* Col 3: SẢN PHẨM */}
        <div>
          <div className="text-xs font-black uppercase tracking-wider text-ink">
            Sản Phẩm
          </div>
          <ul className="mt-4 space-y-2.5 text-sm text-ink/70">
            <li>
              <Link href="/san-pham" className="hover:text-ink transition-colors">
                Tất cả sản phẩm
              </Link>
            </li>
            <li>
              <Link href="/danh-muc/ao-thun" className="hover:text-ink transition-colors">
                Áo thun
              </Link>
            </li>
            <li>
              <Link href="/danh-muc/tui-canvas" className="hover:text-ink transition-colors">
                Túi tote
              </Link>
            </li>
            <li>
              <Link href="/danh-muc/set-qua-ao-tui" className="hover:text-ink transition-colors">
                Set quà áo + túi
              </Link>
            </li>
          </ul>
        </div>

        {/* Col 4: ĐẶT THEO YÊU CẦU & KÊNH MẠNG XÃ HỘI */}
        <div>
          <div className="text-xs font-black uppercase tracking-wider text-ink">
            Đặt Theo Yêu Cầu
          </div>
          <ul className="mt-4 space-y-2.5 text-sm text-ink/70">
            <li>
              <Link href="/dat-theo-yeu-cau" className="hover:text-ink transition-colors">
                Đặt số lượng lớn
              </Link>
            </li>
            <li>
              <Link href="/dat-theo-yeu-cau" className="hover:text-ink transition-colors">
                Đặt in theo yêu cầu
              </Link>
            </li>
          </ul>

          <div className="mt-6 text-xs font-black uppercase tracking-wider text-ink">
            Theo Dõi Chúng Mình Tại
          </div>
          <div className="mt-3 flex items-center gap-3">
            <a
              href="https://www.facebook.com/profile.php?id=61567842338156"
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-9 items-center gap-2 rounded-xl bg-white border border-ink/10 px-3 text-xs font-bold text-ink/80 hover:border-brand-forest hover:text-brand-forest transition-colors shadow-xs"
            >
              <span>Facebook</span>
            </a>
            <a
              href="https://www.tiktok.com/@aothun_saltandlight?_t=8rnA8OkmCd6&_r=1"
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-9 items-center gap-2 rounded-xl bg-white border border-ink/10 px-3 text-xs font-bold text-ink/80 hover:border-brand-forest hover:text-brand-forest transition-colors shadow-xs"
            >
              <span>TikTok</span>
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Copyright */}
      <div className="border-t border-ink/10 bg-cream-100 py-5 text-center text-xs text-ink/60">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 sm:flex-row">
          <p>
            &copy; {new Date().getFullYear()} Bản quyền thuộc về Salt &amp; Light. All Rights Reserved.
          </p>
          <p className="text-[11px] text-ink/40">
            Lan toả Lời Chúa bằng cả tấm lòng 🕊️
          </p>
        </div>
      </div>
    </footer>
  );
}

