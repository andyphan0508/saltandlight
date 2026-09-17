import { BlockRenderer, type PageBlockData } from "@/components/blocks/BlockRenderer";
import { getCachedPageBlocks, listPageBlocks } from "@/server/queries";
import { toPlain } from "@/helpers/serialize";
import { CONTACT_PAGE_FORM_CONTENT } from "@/helpers/page-block-seeds";

export const metadata = {
  title: "Liên hệ · Salt & Light",
  description: "Thông tin liên hệ và gửi tin nhắn hỗ trợ tới Salt & Light.",
};

const DEFAULT_CONTACT_BLOCKS: PageBlockData[] = [
  {
    id: "default-contact-hero",
    type: "PAGE_HERO",
    content: {
      eyebrow: "Kết Nối Cùng Salt & Light",
      title: "Liên Hệ Với Chúng Mình",
      subtitle:
        "Bạn cần tư vấn size, đặt hàng số lượng lớn cho Hội thánh, hay có bất kỳ thắc mắc nào? Đội ngũ Salt & Light luôn sẵn sàng hỗ trợ bạn.",
    },
  },
  { id: "default-contact-form", type: "CONTACT_FORM", content: CONTACT_PAGE_FORM_CONTENT },
];

const ContactPage = async ({
  searchParams,
}: {
  searchParams?: { editor?: string };
}) => {
  let blocks: PageBlockData[] = [];
  const isEditor = searchParams?.editor === "1";
  try {
    const fetched = isEditor
      ? await listPageBlocks("lien-he")
      : await getCachedPageBlocks("lien-he");
    blocks = toPlain(fetched);
  } catch (err) {
    console.error("ContactPage data fetching error:", err);
  }

  const effectiveBlocks = blocks.length > 0 ? blocks : DEFAULT_CONTACT_BLOCKS;

  // Rendered strictly in the editor's order — no section is pinned in place
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:py-16 space-y-12 animate-slide-up-fade">
      {effectiveBlocks.map((block) => (
        <BlockRenderer key={block.id} block={block} />
      ))}
    </div>
  );
};

export default ContactPage;
