import { ContactForm } from "@/components/ContactForm";
import { BlockRenderer, type PageBlockData } from "@/components/blocks/BlockRenderer";
import { getCachedPageBlocks } from "@/lib/queries";
import { toPlain } from "@/lib/serialize";

export const metadata = {
  title: "Liên hệ · Salt & Light",
  description: "Thông tin liên hệ và gửi tin nhắn hỗ trợ tới Salt & Light.",
};

export const revalidate = 60;

export default async function ContactPage() {
  let blocks: PageBlockData[] = [];
  try {
    blocks = toPlain(await getCachedPageBlocks("lien-he"));
  } catch (err) {
    console.error("ContactPage data fetching error:", err);
  }

  const heroBlock = blocks.find((b) => b.type === "PAGE_HERO");
  const infoBlock = blocks.find((b) => b.type === "CONTACT_INFO");

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:py-16 space-y-12">
      {heroBlock && <BlockRenderer block={heroBlock} />}

      <div className="grid gap-10 lg:grid-cols-12 items-start">
        <div className="lg:col-span-5">{infoBlock && <BlockRenderer block={infoBlock} />}</div>

        <div className="rounded-3xl bg-white p-6 sm:p-8 shadow-card border border-ink/5 lg:col-span-7">
          <h2 className="font-display text-base font-black uppercase text-ink mb-6">Gửi Tin Nhắn Cho Shop</h2>
          <ContactForm type="contact" />
        </div>
      </div>
    </div>
  );
}
