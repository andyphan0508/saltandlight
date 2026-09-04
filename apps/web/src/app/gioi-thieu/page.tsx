import { BlockRenderer, type PageBlockData } from "@/components/blocks/BlockRenderer";
import { getCachedPageBlocks } from "@/lib/queries";
import { toPlain } from "@/lib/serialize";

export const metadata = {
  title: "Về chúng tôi · Salt & Light",
  description: "Câu chuyện và sứ mạng của thương hiệu thời trang Cơ Đốc Salt & Light.",
};

export const revalidate = 60;

export default async function AboutPage() {
  let blocks: PageBlockData[] = [];
  try {
    blocks = toPlain(await getCachedPageBlocks("gioi-thieu"));
  } catch (err) {
    console.error("AboutPage data fetching error:", err);
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:py-16 space-y-16">
      {blocks.map((block) => (
        <BlockRenderer key={block.id} block={block} />
      ))}
    </div>
  );
}
