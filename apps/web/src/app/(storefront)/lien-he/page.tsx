import { ContactForm } from "@/components/ContactForm";
import { BlockRenderer, type PageBlockData } from "@/components/blocks/BlockRenderer";
import { getCachedPageBlocks, listPageBlocks } from "@/lib/queries";
import { toPlain } from "@/lib/serialize";

export const metadata = {
  title: "Liên hệ · Salt & Light",
  description: "Thông tin liên hệ và gửi tin nhắn hỗ trợ tới Salt & Light.",
};

export const revalidate = 60;

export default async function ContactPage({
  searchParams,
}: {
  searchParams?: { editor?: string };
}) {
  let blocks: PageBlockData[] = [];
  try {
    const isEditor = searchParams?.editor === "1";
    const fetched = isEditor
      ? await listPageBlocks("lien-he")
      : await getCachedPageBlocks("lien-he");
    blocks = toPlain(fetched);
  } catch (err) {
    console.error("ContactPage data fetching error:", err);
  }

  const heroBlock = blocks.find((b) => b.type === "PAGE_HERO");
  const infoBlock = blocks.find((b) => b.type === "CONTACT_INFO");
  const extraBlocks = blocks.filter((b) => b.type !== "PAGE_HERO" && b.type !== "CONTACT_INFO");

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:py-16 space-y-12 animate-slide-up-fade">
      {heroBlock ? (
        <BlockRenderer block={heroBlock} />
      ) : (
        <div className="text-center space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-forest">
            Kết Nối Cùng Salt &amp; Light
          </span>
          <h1 className="font-display text-3xl sm:text-4xl font-bold uppercase text-ink">
            Liên Hệ Với Chúng Mình
          </h1>
          <p className="text-sm text-ink/70 max-w-lg mx-auto leading-relaxed">
            Bạn cần tư vấn size, đặt hàng số lượng lớn cho Hội thánh, hay có bất kỳ thắc mắc nào? Đội ngũ Salt &amp; Light luôn sẵn sàng hỗ trợ bạn.
          </p>
        </div>
      )}

      <div className="grid gap-10 lg:grid-cols-12 items-start">
        <div className="lg:col-span-5">
          {infoBlock ? (
            <BlockRenderer block={infoBlock} />
          ) : (
            <div className="rounded-3xl bg-white p-6 sm:p-8 shadow-card border border-ink/5 space-y-6">
              <h3 className="font-display text-base font-bold uppercase text-ink">
                Thông Tin Hỗ Trợ
              </h3>
              <div className="space-y-4 text-xs text-ink/80">
                <div className="space-y-1">
                  <span className="font-bold uppercase tracking-wider text-ink/50 text-[10px] block">
                    Hotline &amp; Zalo Tư Vấn
                  </span>
                  <a
                    href="tel:0847252025"
                    className="text-sm font-bold text-brand-forest hover:underline block"
                  >
                    0847 25 2025
                  </a>
                </div>

                <div className="space-y-1">
                  <span className="font-bold uppercase tracking-wider text-ink/50 text-[10px] block">
                    Email Hỗ Trợ
                  </span>
                  <a
                    href="mailto:saltandlight.vn@gmail.com"
                    className="font-bold text-ink hover:underline block"
                  >
                    saltandlight.vn@gmail.com
                  </a>
                </div>

                <div className="space-y-1">
                  <span className="font-bold uppercase tracking-wider text-ink/50 text-[10px] block">
                    Thời Gian Hoạt Động
                  </span>
                  <p className="font-medium text-ink">08:00 – 21:30 (Thứ 2 – Chủ Nhật)</p>
                </div>

                <div className="border-t border-ink/10 pt-4 text-ink/65 leading-relaxed text-[11px]">
                  ✨ Mọi yêu cầu tư vấn mẫu đồng phục hoặc báo giá đơn hàng sỉ sẽ được phản hồi trong vòng 30 phút.
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="rounded-3xl bg-white p-6 sm:p-8 shadow-card border border-ink/5 lg:col-span-7">
          <h2 className="font-display text-base font-bold uppercase text-ink mb-6">
            Gửi Tin Nhắn Cho Shop
          </h2>
          <ContactForm type="contact" />
        </div>
      </div>

      {extraBlocks.length > 0 && (
        <div className="space-y-12 pt-6">
          {extraBlocks.map((block) => (
            <BlockRenderer key={block.id} block={block} />
          ))}
        </div>
      )}
    </div>
  );
}
