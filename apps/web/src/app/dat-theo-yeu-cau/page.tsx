import { ContactForm } from "@/components/ContactForm";

export const metadata = { title: "Đặt theo yêu cầu" };

export default function CustomOrderPage() {
  return (
    <div className="mx-auto max-w-xl px-4 py-16">
      <h1 className="text-center font-display text-2xl font-black uppercase">Đặt theo yêu cầu</h1>
      <p className="mt-2 text-center text-sm text-ink/60">
        Gửi yêu cầu đặt áo/quà tặng theo thiết kế riêng, số lượng lớn cho nhóm/hội thánh. Đội
        ngũ Salt &amp; Light sẽ liên hệ tư vấn trong 1-2 ngày làm việc.
      </p>
      <div className="mt-8">
        <ContactForm type="custom_order" />
      </div>
    </div>
  );
}
