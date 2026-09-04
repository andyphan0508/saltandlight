import { FeatureCardsBlock } from "./FeatureCardsBlock";
import { FeaturedProductsBlock } from "./FeaturedProductsBlock";
import { StoryBannerBlock } from "./StoryBannerBlock";
import { PromoCtaBlock } from "./PromoCtaBlock";
import { TestimonialsBlock } from "./TestimonialsBlock";
import { PageHeroBlock } from "./PageHeroBlock";
import { RichTextSectionsBlock } from "./RichTextSectionsBlock";
import { ContactInfoBlock } from "./ContactInfoBlock";
import { CtaBannerBlock } from "./CtaBannerBlock";

export interface PageBlockData {
  id: string;
  type: string;
  content: any;
}

export function BlockRenderer({ block }: { block: PageBlockData }) {
  switch (block.type) {
    case "FEATURE_CARDS":
      return <FeatureCardsBlock content={block.content} />;
    case "FEATURED_PRODUCTS":
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
