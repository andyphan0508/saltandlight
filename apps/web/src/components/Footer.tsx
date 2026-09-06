import Link from "next/link";
import { DEFAULT_SITE_SETTINGS, type SiteSettingsData } from "@/lib/site-settings-types";
import { Logo } from "./Logo";
import {
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  Truck,
  RefreshCw,
  Sparkles,
} from "./Icons";

export function Footer({ siteSettings = DEFAULT_SITE_SETTINGS }: { siteSettings?: SiteSettingsData }) {
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
            <Logo src={siteSettings.footerLogoUrl} size={siteSettings.logoSize} placement="footer" alt="Salt & Light" />
          </Link>
          <p className="mt-4 text-sm text-ink/70 leading-relaxed max-w-sm">{siteSettings.footerBrandText}</p>

          <div className="mt-6 flex flex-col gap-2.5 text-xs text-ink/70">
            <div className="flex items-center gap-2">
              <MapPin size={15} className="text-brand-forest flex-shrink-0" />
              <span>{siteSettings.footerAddress}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone size={15} className="text-brand-forest flex-shrink-0" />
              <span>Phone: {siteSettings.footerPhone}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail size={15} className="text-brand-forest flex-shrink-0" />
              <span>Email: {siteSettings.footerEmail}</span>
            </div>
          </div>
        </div>

        {siteSettings.footerColumns.map((column, i) => (
          <div key={`${column.title}-${i}`}>
            <div className="text-xs font-black uppercase tracking-wider text-ink">{column.title}</div>
            <ul className="mt-4 space-y-2.5 text-sm text-ink/70">
              {column.items.map((item) => (
                <li key={item.href + item.label}>
                  <Link href={item.href} className="hover:text-ink transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>

            {i === siteSettings.footerColumns.length - 1 && siteSettings.footerSocialLinks.length > 0 && (
              <>
                <div className="mt-6 text-xs font-black uppercase tracking-wider text-ink">
                  Theo Dõi Chúng Mình Tại
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  {siteSettings.footerSocialLinks.map((social) => (
                    <a
                      key={social.platform}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-9 items-center gap-2 rounded-xl bg-white border border-ink/10 px-3 text-xs font-bold text-ink/80 hover:border-brand-forest hover:text-brand-forest transition-colors shadow-xs"
                    >
                      <span>{social.platform}</span>
                    </a>
                  ))}
                </div>
              </>
            )}
          </div>
        ))}
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

