import { BlockRenderer, type PageBlockData } from "@/components/blocks/BlockRenderer";
import { getCachedPageBlocks } from "@/lib/queries";
import { toPlain } from "@/lib/serialize";

export const metadata = {
  title: "Chính sách đổi trả & Giao hàng · Salt & Light",
  description: "Chính sách đổi size trong 7 ngày, biểu phí đồng giá ship 19K và bảng quy đổi size tại Salt & Light.",
};

export const revalidate = 60;

export default async function PolicyPage() {
  let blocks: PageBlockData[] = [];
  try {
    blocks = toPlain(await getCachedPageBlocks("chinh-sach"));
  } catch (err) {
    console.error("PolicyPage data fetching error:", err);
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:py-16 space-y-12">
      {blocks.map((block) => (
        <BlockRenderer key={block.id} block={block} />
      ))}
    </div>
  );
}
