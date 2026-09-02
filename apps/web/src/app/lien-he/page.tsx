import { ContactForm } from "@/components/ContactForm";
import { Phone, Mail, MapPin, Sparkles, CrossIcon } from "@/components/Icons";

export const metadata = {
  title: "Liên hệ · Salt & Light",
  description: "Thông tin liên hệ và gửi tin nhắn hỗ trợ tới Salt & Light.",
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:py-16 space-y-12">
      <div className="text-center space-y-3">
        <span className="text-xs font-black uppercase tracking-widest text-brand-forest">
          Kết nối cùng chúng mình
        </span>
        <h1 className="font-display text-3xl sm:text-4xl font-black uppercase text-ink">
          Liên Hệ Với Salt &amp; Light
        </h1>
        <p className="text-sm text-ink/70 max-w-md mx-auto">
          Chúng mình luôn sẵn lòng lắng nghe, giải đáp thắc mắc và đồng hành cùng bạn.
        </p>
      </div>

      <div className="grid gap-10 lg:grid-cols-12 items-start">
        {/* Contact Info Cards */}
        <div className="space-y-4 lg:col-span-5">
          <div className="rounded-3xl bg-white p-6 shadow-card border border-ink/5 space-y-5">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-mint-100 text-brand-forest">
                <Phone size={18} />
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase text-ink/60">Hotline &amp; Zalo</h4>
                <p className="text-sm font-bold text-ink mt-0.5">0847 25 2025</p>
                <p className="text-[11px] text-ink/50 mt-0.5">8:30 - 21:00 hàng ngày</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-mint-100 text-brand-forest">
                <Mail size={18} />
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase text-ink/60">Hộp thư Email</h4>
                <p className="text-sm font-bold text-ink mt-0.5">saltandlight.lienhe@gmail.com</p>
                <p className="text-[11px] text-ink/50 mt-0.5">Phản hồi trong 24h làm việc</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-mint-100 text-brand-forest">
                <MapPin size={18} />
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase text-ink/60">Địa chỉ văn phòng</h4>
                <p className="text-sm font-bold text-ink mt-0.5">TP. Hồ Chí Minh, Việt Nam</p>
                <p className="text-[11px] text-ink/50 mt-0.5">Giao hàng toàn quốc</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-mint-100 p-6 border border-mint-200 text-xs text-brand-forest">
            <p className="font-bold">&ldquo;Lòng yêu thương chẳng hề hư mất bao giờ.&rdquo;</p>
            <p className="mt-1 text-[11px] opacity-75">— 1 Cô-rinh-tô 13:8</p>
          </div>
        </div>

        {/* Form */}
        <div className="rounded-3xl bg-white p-6 sm:p-8 shadow-card border border-ink/5 lg:col-span-7">
          <h2 className="font-display text-base font-black uppercase text-ink mb-6">
            Gửi Tin Nhắn Cho Shop
          </h2>
          <ContactForm type="contact" />
        </div>
      </div>
    </div>
  );
}
