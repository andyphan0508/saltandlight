import { FeatureCardsBlock } from "./FeatureCardsBlock";
import { FeaturedProductsBlock } from "./FeaturedProductsBlock";
import { StoryBannerBlock } from "./StoryBannerBlock";
import { PromoCtaBlock } from "./PromoCtaBlock";
import { TestimonialsBlock } from "./TestimonialsBlock";
import { PageHeroBlock } from "./PageHeroBlock";
import { RichTextSectionsBlock } from "./RichTextSectionsBlock";
import { ContactInfoBlock } from "./ContactInfoBlock";
import { CtaBannerBlock } from "./CtaBannerBlock";
import { LiveBlockClient } from "./LiveBlockClient";
import { BLOCK_TYPE_LABELS } from "@/lib/admin/page-block-types";

export interface PageBlockData {
  id: string;
  type: string;
  content: any;
}

export function BlockRenderer({ block }: { block: PageBlockData }) {
  function renderInner() {
    switch (block.type) {
      case "FEATURE_CARDS":
        return <FeatureCardsBlock content={block.content} />;
      case "FEATURED_PRODUCTS":
      case "PRODUCT_LIST":
        return <FeaturedProductsBlock content={block.content} />;
      case "STORY_BANNER":
        return <StoryBannerBlock content={block.content} />;
      case "PROMO_CTA":
        return <PromoCtaBlock content={block.content} />;
      case "TESTIMONIALS":
        return <TestimonialsBlock content={block.content} />;
      case "PAGE_HERO":
        return <PageHeroBlock content={block.content} />;
      case "RICH_TEXT_SECTIONS":
        return <RichTextSectionsBlock content={block.content} />;
      case "CONTACT_INFO":
        return <ContactInfoBlock content={block.content} />;
      case "CTA_BANNER":
        return <CtaBannerBlock content={block.content} />;
      default:
        return null;
    }
  }

  const inner = renderInner();
  if (!inner) return null;

  const label = (BLOCK_TYPE_LABELS as Record<string, string>)[block.type] || block.type;

  return (
    <LiveBlockClient
      blockId={block.id}
      blockType={block.type}
      blockLabel={label}
      initialContent={block.content}
    >
      {inner}
    </LiveBlockClient>
  );
}
