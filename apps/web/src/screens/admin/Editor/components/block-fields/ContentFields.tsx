"use client";

import type { ComponentType } from "react";
import type { BlockFieldsProps, PageBlockTypeValue } from "@/interfaces/page-block";
import { ContactInfoFields } from "./ContactInfoFields";
import { CtaBannerFields } from "./CtaBannerFields";
import { FeatureCardsFields } from "./FeatureCardsFields";
import { FeaturedProductsFields } from "./FeaturedProductsFields";
import { PageHeroFields } from "./PageHeroFields";
import { PromoCtaFields } from "./PromoCtaFields";
import { RichTextSectionsFields } from "./RichTextSectionsFields";
import { StoryBannerFields } from "./StoryBannerFields";
import { TestimonialsFields } from "./TestimonialsFields";

const ProductListFields = (props: BlockFieldsProps) => <FeaturedProductsFields {...props} isProductList />;

const FIELDS_BY_TYPE: Record<PageBlockTypeValue, ComponentType<BlockFieldsProps>> = {
  FEATURE_CARDS: FeatureCardsFields,
  FEATURED_PRODUCTS: FeaturedProductsFields,
  PRODUCT_LIST: ProductListFields,
  STORY_BANNER: StoryBannerFields,
  PROMO_CTA: PromoCtaFields,
  TESTIMONIALS: TestimonialsFields,
  PAGE_HERO: PageHeroFields,
  RICH_TEXT_SECTIONS: RichTextSectionsFields,
  CONTACT_INFO: ContactInfoFields,
  CTA_BANNER: CtaBannerFields,
};

/** Renders the field editor that matches a page block type. */
export const ContentFields = ({ type, ...props }: BlockFieldsProps & { type: PageBlockTypeValue }) => {
  const Fields = FIELDS_BY_TYPE[type];
  return <Fields {...props} />;
};
