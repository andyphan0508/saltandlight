import { ContactForm } from "@/components/ContactForm";
import { Gift, ShieldCheck, Sparkles, Check, Phone } from "@/components/Icons";

export const metadata = {
  title: "Đặt may & in theo yêu cầu · Salt & Light",
  description: "Dịch vụ thiết kế và may áo đồng phục Cơ Đốc cho Ban Thanh Niên, Trại Hè, Hội Thánh.",
};

export const dynamic = "force-static";

const STEPS = [
  { step: "01", title: "Tiếp nhận ý tưởng", desc: "Gửi thông tin số lượng, ý tưởng câu gốc hoặc logo Hội thánh." },
  { step: "02", title: "Thiết kế Demo", desc: "Đội ngũ Salt & Light lên market mẫu 2D/3D miễn phí cho bạn duyệt." },
  { step: "03", title: "Sản xuất & Kiểm tra", desc: "Cắt may vải 100% cotton, in DTG/lụa cao cấp chuẩn nét từng chi tiết." },
  { step: "04", title: "Giao hàng tận nơi", desc: "Đóng gói theo từng size cá nhân và giao hàng toàn quốc đúng hẹn." },
];

export default function CustomOrderPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:py-16 space-y-16">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-mint-100 text-brand-forest shadow-sm">
          <Gift size={28} />
        </div>
        <span className="text-xs font-black uppercase tracking-widest text-brand-forest">
          Dành Cho Hội Thánh &amp; Nhóm Bạn
        </span>
        <h1 className="font-display text-3xl sm:text-4xl font-black uppercase text-ink">
          Đặt May Áo &amp; Quà Tặng Theo Yêu Cầu
        </h1>
        <p className="text-sm text-ink/70 max-w-xl mx-auto leading-relaxed">
          Đồng phục Trại Hè, Lễ Phục Sinh, Giáng Sinh, Ban Thanh Niên, Ca Đoàn. Chất lượng vải 100% Cotton mềm mịn, bảng giá chiết khấu đặc quyền từ 10 áo.
        </p>
      </div>

      {/* 4 Steps Process */}
      <div className="rounded-3xl bg-mint-50 p-8 sm:p-10 border border-mint-200 space-y-6">
        <div className="text-center">
          <h2 className="font-display text-xl font-black uppercase text-ink">
            Quy Trình 4 Bước Đơn Giản
          </h2>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s) => (
            <div key={s.step} className="rounded-2xl bg-white p-5 shadow-sm border border-ink/5 space-y-2">
              <span className="font-display text-2xl font-black text-brand-forest">{s.step}</span>
              <h3 className="font-bold text-xs uppercase text-ink">{s.title}</h3>
              <p className="text-xs text-ink/65 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Form Container */}
      <div className="grid gap-10 lg:grid-cols-12 items-start">
        <div className="space-y-6 lg:col-span-5">
          <div className="rounded-3xl bg-white p-6 shadow-card border border-ink/5 space-y-4">
            <h3 className="font-display text-base font-black uppercase text-ink">
              Cam Kết Từ Salt &amp; Light
            </h3>
            <ul className="space-y-3 text-xs text-ink/75">
              <li className="flex items-center gap-2">
                <Check size={16} className="text-emerald-600 flex-shrink-0" />
                <span>Thiết kế demo miễn phí đến khi bạn hài lòng.</span>
              </li>
              <li className="flex items-center gap-2">
                <Check size={16} className="text-emerald-600 flex-shrink-0" />
                <span>Chất vải 100% Cotton 4 chiều không phai, không xù.</span>
              </li>
              <li className="flex items-center gap-2">
                <Check size={16} className="text-emerald-600 flex-shrink-0" />
                <span>Đa dạng form size: Trẻ em, Nam, Nữ, Oversize.</span>
              </li>
              <li className="flex items-center gap-2">
                <Check size={16} className="text-emerald-600 flex-shrink-0" />
                <span>Chiết khấu trực tiếp lên đến 25% cho số lượng lớn.</span>
              </li>
            </ul>

            <div className="border-t border-ink/10 pt-4 flex items-center gap-2 text-xs text-brand-forest font-bold">
              <Phone size={16} />
              <span>Tư vấn trực tiếp: 0847 25 2025</span>
            </div>
          </div>
        </div>

        <div className="rounded-3xl bg-white p-6 sm:p-8 shadow-card border border-ink/5 lg:col-span-7">
          <h2 className="font-display text-base font-black uppercase text-ink mb-6">
            Gửi Thông Tin Yêu Cầu Báo Giá
          </h2>
          <ContactForm type="custom_order" />
        </div>
      </div>
    </div>
  );
}
