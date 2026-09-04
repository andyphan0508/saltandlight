import Link from "next/link";
import { Button } from "@saltandlight/ui";

export const revalidate = 60;
import { HeroSlider } from "@/components/HeroSlider";
import { getCachedFeaturedProducts, getCachedBanners } from "@/lib/queries";
import { toPlain } from "@/lib/serialize";
import { ProductGrid } from "@/components/ProductGrid";
import {
  Sparkles,
  Truck,
  ShieldCheck,
  RefreshCw,
  Heart,
  Star,
  ArrowRight,
  CrossIcon,
  Check,
  Gift,
} from "@/components/Icons";

const REVIEWS = [
  {
    name: "Tuyết Nhi",
    role: "Khách hàng tại TP.HCM",
    rating: 5,
    product: "Áo Thun FEARLESS",
    comment:
      "Vải áo siêu dày dặn nhưng mặc rất mát, form rộng vừa vặn mặc đi nhà thờ hay đi làm đều rất hợp. Mình rất thích câu gốc in sau lưng áo!",
  },
  {
    name: "Anh Tuấn",
    role: "Ban Thanh Niên - Hà Nội",
    rating: 5,
    product: "Áo Thun WALK BY FAITH",
    comment:
      "Shop đóng gói cẩn thận, có kèm thiệp cảm ơn và câu gốc rất ấm áp. Cả ban thanh niên nhóm mình đều khen áo đẹp!",
  },
  {
    name: "Thảo Vy",
    role: "Khách hàng tại Đà Nẵng",
    rating: 5,
    product: "Túi Tote FAITH OVER FEAR",
    comment:
      "Túi tote đựng vừa laptop 14 inch, vải canvas dày dặn quai may chắc chắn. Giao hàng 2 ngày là nhận được rồi, đồng giá ship 19k siêu hời.",
  },
];

export default async function HomePage() {
  let products: any[] = [];
  let banners: any[] = [];
  try {
    const [bannersData, productsData] = await Promise.all([
      getCachedBanners(),
      getCachedFeaturedProducts(10),
    ]);
    banners = toPlain(bannersData);
    products = toPlain(productsData).products;
  } catch (err) {
    console.error("HomePage data fetching error:", err);
  }

  return (
    <div className="space-y-12 sm:space-y-20 pb-16">
      {/* 1. FULL-SCREEN RESPONSIVE HERO SLIDER */}
      <HeroSlider banners={banners} />

      {/* 2. TRUST / VALUE PROPOSITIONS BAR */}
      <section className="mx-auto max-w-7xl px-4">
        <div className="grid gap-6 rounded-3xl bg-white p-6 sm:p-8 shadow-card border border-ink/5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-mint-100 text-brand-forest">
              <Truck size={24} />
            </div>
            <div>
              <h4 className="font-bold text-sm text-ink uppercase tracking-wide">Đồng Giá Ship 19K</h4>
              <p className="mt-1 text-xs text-ink/65 leading-relaxed">
                Áp dụng toàn quốc cho mọi đơn hàng. Freeship khi đơn từ 299K.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-mint-100 text-brand-forest">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h4 className="font-bold text-sm text-ink uppercase tracking-wide">100% Cotton Tự Nhiên</h4>
              <p className="mt-1 text-xs text-ink/65 leading-relaxed">
                Sợi bông tuyển chọn, co giãn 4 chiều, mực in DTG không bong tróc.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-mint-100 text-brand-forest">
              <RefreshCw size={24} />
            </div>
            <div>
              <h4 className="font-bold text-sm text-ink uppercase tracking-wide">Đổi Size 7 Ngày Tận Nơi</h4>
              <p className="mt-1 text-xs text-ink/65 leading-relaxed">
                Mặc không vừa đổi ngay tận nhà, đội ngũ hỗ trợ tận tâm, nhanh chóng.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-mint-100 text-brand-forest">
              <Heart size={24} />
            </div>
            <div>
              <h4 className="font-bold text-sm text-ink uppercase tracking-wide">Sứ Mạng &amp; Bác Ái</h4>
              <p className="mt-1 text-xs text-ink/65 leading-relaxed">
                Trích 5% doanh thu đồng hành cùng các hoạt động từ thiện Cơ Đốc.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FEATURED PRODUCTS (COMPACT GRID FOR COMPREHENSIVE OVERVIEW) */}
      <section className="mx-auto max-w-7xl px-4">
        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-ink/10 pb-4">
          <div>
            <span className="text-xs font-black uppercase tracking-widest text-brand-forest">Được yêu thích nhất</span>
            <h2 className="mt-1 font-display text-2xl sm:text-3xl font-black uppercase text-ink">
              Sản Phẩm Nổi Bật &amp; Bán Chạy
            </h2>
          </div>
          <Link href="/san-pham">
            <Button variant="outline" size="sm" className="gap-2">
              <span>Xem tất cả sản phẩm</span>
              <ArrowRight size={14} />
            </Button>
          </Link>
        </div>
        <ProductGrid products={products.slice(0, 8)} />
      </section>

      {/* 5. BRAND SCRIPTURE & STORY HIGHLIGHT */}
      <section className="mx-auto max-w-7xl px-4">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand-forest to-brand-new p-8 sm:p-14 text-white shadow-xl">
          <div className="relative z-10 mx-auto max-w-3xl text-center space-y-6">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/15 text-mint-200">
              <CrossIcon size={24} />
            </div>

            <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-black uppercase tracking-tight">
              &ldquo;Các con là muối của đất... Các con là ánh sáng của thế gian.&rdquo;
            </h2>

            <p className="text-xs font-bold tracking-widest text-mint-200 uppercase">
              — Ma-thi-ơ 5:13-14
            </p>

            <p className="text-sm sm:text-base text-white/85 leading-relaxed font-light">
              Salt &amp; Light ra đời với ước ao đem Lời Hằng Sống của Chúa hiện diện một cách gần gũi,
              chỉn chu và thẩm mỹ trong đời sống giới trẻ và cộng đồng Cơ Đốc Việt Nam. Mỗi chiếc áo, mỗi
              chiếc túi là một lời chứng sống động về đức tin, hy vọng và tình yêu thương.
            </p>

            <div className="pt-2">
              <Link href="/gioi-thieu">
                <Button variant="secondary" size="md" className="bg-white text-ink hover:bg-mint-100 font-bold">
                  Đọc câu chuyện của Salt &amp; Light
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 6. CUSTOM ORDER FOR CHURCHES & YOUTH GROUPS BANNER */}
      <section className="mx-auto max-w-7xl px-4">
        <div className="grid gap-8 rounded-3xl bg-white p-8 sm:p-12 shadow-card border border-ink/5 lg:grid-cols-12 items-center">
          <div className="space-y-4 lg:col-span-8">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-mint-100 px-3.5 py-1 text-xs font-bold uppercase text-brand-forest">
              <Gift size={14} />
              Dành cho Hội thánh &amp; Ban ngành
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-black uppercase text-ink">
              Đặt May Áo Đồng Phục &amp; Quà Tặng Theo Yêu Cầu
            </h2>
            <p className="text-sm text-ink/75 leading-relaxed max-w-2xl">
              Bạn đang cần đặt áo đồng phục cho Ban Thanh Niên, Trại Hè, Lễ Phục Sinh, Giáng Sinh hoặc
              quà lưu niệm mang dấu ấn riêng của Hội thánh? Đội ngũ Salt &amp; Light nhận thiết kế mẫu
              miễn phí và chiết khấu đặc biệt cho số lượng lớn.
            </p>
            <div className="flex flex-wrap gap-4 pt-2 text-xs font-semibold text-ink/70">
              <span className="flex items-center gap-1.5">✓ Hỗ trợ thiết kế demo miễn phí</span>
              <span className="flex items-center gap-1.5">✓ Vải 100% Cotton mềm mát</span>
              <span className="flex items-center gap-1.5">✓ Giá ưu đãi từ 10 áo</span>
            </div>
          </div>
          <div className="lg:col-span-4 flex justify-start lg:justify-end">
            <Link href="/dat-theo-yeu-cau">
              <Button variant="primary" size="lg" className="w-full sm:w-auto shadow-md">
                Gửi yêu cầu báo giá
                <ArrowRight size={18} />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 7. CUSTOMER REVIEWS & SOCIAL PROOF */}
      <section className="mx-auto max-w-7xl px-4">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-black uppercase tracking-widest text-brand-forest">Cảm nhận khách hàng</span>
          <h2 className="mt-1.5 font-display text-2xl sm:text-3xl font-black uppercase text-ink">
            Tín Hữu Nói Gì Về Salt &amp; Light?
          </h2>
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          {REVIEWS.map((rev, i) => (
            <div
              key={i}
              className="flex flex-col justify-between rounded-3xl bg-white p-7 shadow-card border border-ink/5"
            >
              <div>
                <div className="flex items-center gap-1 text-gold-500 mb-4">
                  {Array.from({ length: rev.rating }).map((_, j) => (
                    <Star key={j} size={16} fill="currentColor" />
                  ))}
                </div>
                <p className="text-sm text-ink/80 leading-relaxed italic">
                  &ldquo;{rev.comment}&rdquo;
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-ink/10 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-ink">{rev.name}</h4>
                  <p className="text-[11px] text-ink/50">{rev.role}</p>
                </div>
                <span className="rounded-full bg-mint-100 px-2.5 py-1 text-[10px] font-bold text-brand-forest">
                  Đã mua {rev.product}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
