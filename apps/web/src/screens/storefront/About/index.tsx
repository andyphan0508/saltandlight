import { BlockRenderer, type PageBlockData } from "@/components/blocks/BlockRenderer";
import { getCachedPageBlocks, listPageBlocks } from "@/server/queries";
import { toPlain } from "@/helpers/serialize";
import { ABOUT_STORY_CONTENT } from "@/helpers/page-block-seeds";

export const metadata = {
  title: "Về chúng tôi · Salt & Light",
  description:
    "Đó cũng là lí do Salt & Light được ra đời — Mang Lời Chúa vào cuộc sống thường nhật qua thời trang Cơ Đốc chất lượng và ý nghĩa.",
};

const DEFAULT_ABOUT_BLOCKS: PageBlockData[] = [
  { id: "default-about-story", type: "INTRO_STORY", content: ABOUT_STORY_CONTENT },
];

const AboutPage = async ({
  searchParams,
}: {
  searchParams?: { editor?: string };
}) => {
  let blocks: PageBlockData[] = [];
  const isEditor = searchParams?.editor === "1";
  try {
    const fetched = isEditor
      ? await listPageBlocks("gioi-thieu")
      : await getCachedPageBlocks("gioi-thieu");
    blocks = toPlain(fetched);
  } catch (err) {
    console.error("AboutPage data fetching error:", err);
  }

  const effectiveBlocks = blocks.length > 0 ? blocks : DEFAULT_ABOUT_BLOCKS;

  // Editor order throughout; a hero spans the full width, everything else sits in the reading column
  return (
    <div className="min-h-screen bg-cream-50/50 pb-16 animate-slide-up-fade">
      {effectiveBlocks.map((block) =>
        block.type === "PAGE_HERO" ? (
          <BlockRenderer key={block.id} block={block} />
        ) : (
          <div key={block.id} className="mx-auto max-w-4xl px-4 pt-12 sm:pt-16">
            <BlockRenderer block={block} />
          </div>
        ),
      )}
    </div>
  );
};

export default AboutPage;
