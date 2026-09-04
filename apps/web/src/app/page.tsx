import Link from "next/link";
import { Button } from "@saltandlight/ui";

export const dynamic = "force-dynamic";
import { listPublishedProducts } from "@/lib/queries";
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

const CATEGORY_TILES = [
  {
    title: "Áo thun người lớn",
    desc: "Form Regular Fit Unisex 100% Cotton",
    tag: "Bán chạy nhất",
    href: "/danh-muc/ao-thun",
    bgClass: "from-mint-200 via-mint-100 to-mint-50",
  },
  {
    title: "Áo thun cho bé",
    desc: "Cotton mềm mại, an toàn cho làn da nhạy cảm",
    tag: "Dễ thương & Ý nghĩa",
    href: "/danh-muc/ao-thun-cho-be",
    bgClass: "from-rose-100 via-orange-50 to-amber-50",
  },
  {
    title: "Túi Tote Canvas",
    desc: "Vải bố dệt mộc dày dặn, in Lời Chúa bền đẹp",
    tag: "Phụ kiện thường nhật",
    href: "/danh-muc/tui-canvas",
    bgClass: "from-amber-100 via-stone-100 to-cream-100",
  },
];

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
  try {
    const data = await listPublishedProducts({ pageSize: 8 });
    products = toPlain(data).products;
  } catch (err) {
    console.error("HomePage listPublishedProducts error:", err);
  }

  return (
    <div className="space-y-16 sm:space-y-24">
      {/* 1. HERO BANNER SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-mint-100/80 via-mint-50/40 to-cream pt-10 pb-16 px-4 sm:pt-16 sm:pb-24">
        <div className="mx-auto max-w-7xl">
          <div className="grid items-center gap-12 lg:grid-cols-12">
            {/* Left Content */}
            <div className="space-y-6 lg:col-span-7">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-1.5 text-xs font-extrabold uppercase tracking-wider text-brand-forest shadow-sm border border-mint-200">
                <Sparkles size={14} className="text-gold-500" />
                <span>Thời trang &amp; Quà tặng Cơ Đốc chính hãng</span>
              </div>

              {/* Main Headline */}
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-ink leading-[1.1]">
                Sống Là <span className="text-brand-forest underline decoration-mint-300 decoration-wavy decoration-2">Muối</span> &amp; <span className="text-gold-600">Ánh Sáng</span>
              </h1>

              {/* Subtitle */}
              <p className="max-w-xl text-base sm:text-lg text-ink/75 leading-relaxed font-normal">
                Lan toả Lời Chúa và tình yêu thương qua từng chiếc áo thun cotton cao cấp, túi tote và quà tặng ý nghĩa cho bạn và những người thân yêu.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link href="/san-pham">
                  <Button variant="primary" size="lg" className="shadow-lg hover:shadow-xl">
                    Khám phá sản phẩm
                    <ArrowRight size={18} />
                  </Button>
                </Link>
                <Link href="/dat-theo-yeu-cau">
                  <Button variant="secondary" size="lg" className="border border-mint-300 bg-white hover:bg-mint-100">
                    Đặt may áo nhóm / Hội thánh
                  </Button>
                </Link>
              </div>

              {/* Quick stats / trust chips */}
              <div className="flex flex-wrap items-center gap-6 pt-4 text-xs font-bold text-ink/70">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-1">
                    {[1, 2, 3, 4].map((i) => (
                      <span key={i} className="inline-block h-6 w-6 rounded-full bg-mint-300 border-2 border-white flex items-center justify-center text-[10px] font-black text-brand-forest">
                        ★
                      </span>
                    ))}
                  </div>
                  <span>5,000+ Tín hữu tin dùng</span>
                </div>
                <div className="h-4 w-px bg-ink/15 hidden sm:block" />
                <div className="flex items-center gap-1.5 text-brand-forest">
                  <Check size={16} className="text-emerald-600" />
                  <span>100% Cotton 4 Chiều</span>
                </div>
                <div className="h-4 w-px bg-ink/15 hidden sm:block" />
                <div className="flex items-center gap-1.5 text-brand-forest">
                  <Check size={16} className="text-emerald-600" />
                  <span>Đồng giá ship 19K</span>
                </div>
              </div>
            </div>

            {/* Right Visual Tile Showcase */}
            <div className="grid gap-4 sm:grid-cols-2 lg:col-span-5">
              <Link
                href="/danh-muc/ao-thun"
                className="group relative flex aspect-[4/5] flex-col justify-between overflow-hidden rounded-3xl bg-gradient-to-br from-mint-200 to-mint-100 p-6 shadow-card hover:shadow-card-hover transition-all duration-300"
              >
                <div className="flex justify-between items-start">
                  <span className="rounded-full bg-white/90 px-3 py-1 text-[11px] font-bold uppercase text-brand-forest shadow-sm">
                    Hot Trend
                  </span>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-ink text-white transition-transform group-hover:translate-x-1">
                    <ArrowRight size={14} />
                  </div>
                </div>
                <div>
                  <h3 className="font-display text-2xl font-black uppercase text-ink">Áo Thun Lời Chúa</h3>
                  <p className="mt-1 text-xs text-ink/70">Form chuẩn, in sắc nét</p>
                </div>
              </Link>

              <div className="flex flex-col gap-4">
                <Link
                  href="/danh-muc/tui-canvas"
                  className="group flex flex-1 flex-col justify-between rounded-3xl bg-gradient-to-br from-amber-100 to-amber-50 p-6 shadow-card hover:shadow-card-hover transition-all duration-300"
                >
                  <div className="flex justify-between items-start">
                    <span className="rounded-full bg-white/90 px-3 py-1 text-[11px] font-bold uppercase text-amber-900 shadow-sm">
                      Canvas
                    </span>
                    <ArrowRight size={16} className="text-ink/60 transition-transform group-hover:translate-x-1" />
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-black uppercase text-ink">Túi Tote</h3>
                    <p className="text-xs text-ink/60">Vải bố mộc dày dặn</p>
                  </div>
                </Link>

                <Link
                  href="/danh-muc/ao-thun-cho-be"
                  className="group flex flex-1 flex-col justify-between rounded-3xl bg-gradient-to-br from-rose-100 to-rose-50 p-6 shadow-card hover:shadow-card-hover transition-all duration-300"
                >
                  <div className="flex justify-between items-start">
                    <span className="rounded-full bg-white/90 px-3 py-1 text-[11px] font-bold uppercase text-rose-900 shadow-sm">
                      Baby Tee
                    </span>
                    <ArrowRight size={16} className="text-ink/60 transition-transform group-hover:translate-x-1" />
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-black uppercase text-ink">Áo Cho Bé</h3>
                    <p className="text-xs text-ink/60">Mềm mại, an toàn da</p>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. TRUST / VALUE PROPOSITIONS BAR */}
      <section className="mx-auto max-w-7xl px-4">
        <div className="grid gap-6 rounded-3xl bg-white p-8 shadow-card border border-ink/5 sm:grid-cols-2 lg:grid-cols-4">
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

      {/* 3. FEATURED CATEGORIES SHOWCASE */}
      <section className="mx-auto max-w-7xl px-4">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-black uppercase tracking-widest text-brand-forest">Danh mục mua sắm</span>
          <h2 className="mt-1.5 font-display text-2xl sm:text-3xl font-black uppercase text-ink">
            Bộ Sưu Tập Nổi Bật
          </h2>
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          {CATEGORY_TILES.map((cat) => (
            <Link
              key={cat.href}
              href={cat.href}
              className={`group relative flex aspect-[4/5] flex-col justify-between overflow-hidden rounded-3xl bg-gradient-to-b ${cat.bgClass} p-8 shadow-card hover:shadow-card-hover transition-all duration-300`}
            >
              <div>
                <span className="rounded-full bg-white/90 px-3.5 py-1 text-xs font-bold uppercase text-ink shadow-sm">
                  {cat.tag}
                </span>
              </div>

              <div>
                <h3 className="font-display text-2xl font-black uppercase text-ink leading-tight">
                  {cat.title}
                </h3>
                <p className="mt-2 text-xs text-ink/70">{cat.desc}</p>
                <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-sm transition-transform group-hover:translate-x-1">
                  <span>Khám phá ngay</span>
                  <ArrowRight size={14} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. FEATURED PRODUCTS (BEST SELLERS) */}
      <section className="mx-auto max-w-7xl px-4">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-ink/10 pb-4">
          <div>
            <span className="text-xs font-black uppercase tracking-widest text-brand-forest">Được yêu thích nhất</span>
            <h2 className="mt-1 font-display text-2xl sm:text-3xl font-black uppercase text-ink">
              Sản Phẩm Bán Chạy
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
