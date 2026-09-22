import { FeatureCardsBlock } from "./FeatureCardsBlock";
import { FeaturedProductsBlock } from "./FeaturedProductsBlock";
import { StoryBannerBlock } from "./StoryBannerBlock";
import { PromoCtaBlock } from "./PromoCtaBlock";
import { TestimonialsBlock } from "./TestimonialsBlock";
import { PageHeroBlock } from "./PageHeroBlock";
import { RichTextSectionsBlock } from "./RichTextSectionsBlock";
import { ContactInfoBlock } from "./ContactInfoBlock";
import { CtaBannerBlock } from "./CtaBannerBlock";
import { ContactFormBlock } from "./ContactFormBlock";
import { IntroStoryBlock } from "./IntroStoryBlock";
import { LiveBlockClient } from "./LiveBlockClient";
import { BLOCK_TYPE_LABELS } from "@/interfaces/page-block";

export interface PageBlockData {
  id: string;
  type: string;
  content: any;
}

export const BlockRenderer = ({ block }: { block: PageBlockData }) => {
  const renderInner = () => {
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
      case "CONTACT_FORM":
        return <ContactFormBlock content={block.content} />;
      case "INTRO_STORY":
        return <IntroStoryBlock content={block.content} />;
      default:
        return null;
    }
  };

  const inner = renderInner();
  if (!inner) return null;

  const label = (BLOCK_TYPE_LABELS as Record<string, string>)[block.type] || block.type;

  return (
    // Each section rises in as it scrolls into view (components/RevealOnScroll.tsx)
    <div data-reveal>
      <LiveBlockClient
        blockId={block.id}
        blockType={block.type}
        blockLabel={label}
        initialContent={block.content}
      >
        {inner}
      </LiveBlockClient>
    </div>
  );
};
