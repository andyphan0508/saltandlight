import { RevealOnScroll } from "@/components/RevealOnScroll";
import { getCachedCategoriesWithCounts, getCachedFeaturedProducts } from "@/server/queries";
import type { CategoryOption, ProductCardData } from "@/interfaces/catalog";
import { bodyFont } from "./components/shared";
import { WelcomeHero } from "./components/WelcomeHero";
import { BrandStory, SaltAndLightVerses, VerseMarquee } from "./components/WelcomeStory";
import { CategoryIndex, FeaturedShowcase } from "./components/WelcomeCatalog";
import { Commitments, CustomOrderCta, WelcomeFooter } from "./components/WelcomeClosing";

/**
 * Stand-alone brand landing page at /welcome, outside the storefront layout (no header,
 * cart or tab bar) so it reads as one story. Products and categories are the live catalog.
 */
const WelcomePage = async () => {
  let products: ProductCardData[] = [];
  let categories: CategoryOption[] = [];
  try {
    const [featured, nav] = await Promise.all([getCachedFeaturedProducts(8), getCachedCategoriesWithCounts()]);
    products = featured.products;
    categories = nav.categories
      .filter((c) => c.count > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, 6)
      .map(({ id, name, slug, count }) => ({ id, name, slug, count }));
  } catch (err) {
    console.error("WelcomePage data fetching error:", err);
  }

  return (
    <div className={`${bodyFont.className} bg-cream text-ink`}>
      <WelcomeHero products={products} />
      <VerseMarquee />
      <BrandStory />
      <SaltAndLightVerses />
      <FeaturedShowcase products={products} />
      <CategoryIndex categories={categories} />
      <Commitments />
      <CustomOrderCta />
      <WelcomeFooter />
      <RevealOnScroll />
    </div>
  );
};

export default WelcomePage;
