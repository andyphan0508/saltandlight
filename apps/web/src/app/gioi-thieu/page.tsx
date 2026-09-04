import Link from "next/link";
import { Button } from "@saltandlight/ui";
import { CrossIcon, Heart, Sparkles, ShieldCheck, Truck, Star } from "@/components/Icons";

export const metadata = {
  title: "Về chúng tôi · Salt & Light",
  description: "Câu chuyện và sứ mạng của thương hiệu thời trang Cơ Đốc Salt & Light.",
};

export const dynamic = "force-static";

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:py-16 space-y-16">
      {/* Hero */}
      <div className="text-center space-y-4">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-ink text-white shadow-md">
          <CrossIcon size={24} className="text-mint-200" />
        </div>
        <span className="text-xs font-black uppercase tracking-widest text-brand-forest">
          Câu Chuyện Thương Hiệu
        </span>
        <h1 className="font-display text-3xl sm:text-5xl font-black uppercase text-ink tracking-tight">
          Muối Của Đất &amp; Ánh Sáng Của Thế Gian
        </h1>
        <p className="text-sm sm:text-base text-ink/75 max-w-2xl mx-auto leading-relaxed">
          &ldquo;Các con là muối của đất... Các con là ánh sáng của thế gian. Một cái thành ở trên núi thì không thể bị khuất được.&rdquo;
          <br />
          <strong className="text-brand-forest text-xs uppercase tracking-wider">— Ma-thi-ơ 5:13-14</strong>
        </p>
      </div>

      {/* Main Story Cards */}
      <div className="grid gap-8 sm:grid-cols-2">
        <div className="rounded-3xl bg-white p-8 shadow-card border border-ink/5 space-y-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-mint-100 text-brand-forest">
            <Sparkles size={24} />
          </div>
          <h2 className="font-display text-xl font-black uppercase text-ink">
            Ước Mơ Khởi Nguồn
          </h2>
          <p className="text-xs sm:text-sm text-ink/75 leading-relaxed">
            Salt &amp; Light ra đời từ một ước ao giản dị: Làm sao để Lời Chúa không chỉ nằm trong
            những trang Kinh Thánh hay trên bục giảng, mà có thể đồng hành cùng các bạn trẻ trong mọi
            khoảnh khắc cuộc sống — từ trường học, nơi làm việc, quán cà phê cho đến những chuyến đi
            xa.
          </p>
        </div>

        <div className="rounded-3xl bg-white p-8 shadow-card border border-ink/5 space-y-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-mint-100 text-brand-forest">
            <ShieldCheck size={24} />
          </div>
          <h2 className="font-display text-xl font-black uppercase text-ink">
            Chất Lượng Chỉn Chu
          </h2>
          <p className="text-xs sm:text-sm text-ink/75 leading-relaxed">
            Vì đại diện cho danh Chúa, chúng mình đặt tiêu chuẩn cao nhất cho từng sản phẩm: 100%
            Cotton 4 chiều mềm mịn, công nghệ in bền bỉ không nứt gãy, đường may tỉ mỉ và cách đóng
            gói trang trọng như một món quà từ tấm lòng.
          </p>
        </div>
      </div>

      {/* 3 Core Values */}
      <div className="rounded-3xl bg-mint-50 p-8 sm:p-12 border border-mint-200/80 space-y-8">
        <div className="text-center max-w-xl mx-auto">
          <h2 className="font-display text-2xl font-black uppercase text-ink">
            3 Giá Trị Cốt Lõi
          </h2>
          <p className="text-xs text-ink/65 mt-1">Kim chỉ nam trong từng sản phẩm của Salt &amp; Light</p>
        </div>

        <div className="grid gap-6 sm:grid-cols-3 text-center sm:text-left">
          <div className="rounded-2xl bg-white p-6 shadow-sm border border-ink/5 space-y-2">
            <span className="font-display text-2xl font-black text-brand-forest">01.</span>
            <h3 className="font-bold text-sm uppercase text-ink">Chân Thật</h3>
            <p className="text-xs text-ink/70 leading-relaxed">
              Trang phục mang thông điệp tích cực, chân thật từ Lời Chúa, khích lệ đức tin mỗi ngày.
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm border border-ink/5 space-y-2">
            <span className="font-display text-2xl font-black text-brand-forest">02.</span>
            <h3 className="font-bold text-sm uppercase text-ink">Xuất Sắc</h3>
            <p className="text-xs text-ink/70 leading-relaxed">
              Tận tâm trong từng sợi vải, đường kim mũi chỉ, xứng đáng với tinh thần phụng sự tốt nhất.
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm border border-ink/5 space-y-2">
            <span className="font-display text-2xl font-black text-brand-forest">03.</span>
            <h3 className="font-bold text-sm uppercase text-ink">Bác Ái</h3>
            <p className="text-xs text-ink/70 leading-relaxed">
              Dành 5% doanh thu sẻ chia với các hoàn cảnh khó khăn, mái ấm và quỹ phát triển Cơ Đốc.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Box */}
      <div className="text-center space-y-6 pt-4">
        <h3 className="font-display text-xl font-black uppercase text-ink">
          Cùng Salt &amp; Light Lan Toả Đức Tin Ngay Hôm Nay
        </h3>
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/san-pham">
            <Button variant="primary" size="lg" className="shadow-md">
              Xem bộ sưu tập sản phẩm
            </Button>
          </Link>
          <Link href="/lien-he">
            <Button variant="outline" size="lg">
              Liên hệ với chúng mình
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
