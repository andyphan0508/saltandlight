import { Toaster } from "sonner";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BottomTabBar } from "@/components/BottomTabBar";
import { MobileDrawer } from "@/components/MobileDrawer";
import { SearchSpotlight } from "@/components/SearchSpotlight";
import { CartFab } from "@/components/CartFab";
import { CuteAmbientBackground } from "@/components/CuteAmbientBackground";
import { NavigationBuffer } from "@/components/NavigationBuffer";
import { getCachedCategoriesWithCounts, getCachedActivePromotions, getCachedSiteSettings } from "@/lib/queries";
import { toPlain } from "@/lib/serialize";
import { DEFAULT_SITE_SETTINGS, resolveSiteSettings, type SiteSettingsData } from "@/lib/site-settings-types";

export default async function StorefrontLayout({ children }: { children: React.ReactNode }) {
  let navCategories: any[] = [];
  let activePromotion: any = null;
  let siteSettings: SiteSettingsData = DEFAULT_SITE_SETTINGS;
  try {
    const [{ categories }, promotions, settingsRow] = await Promise.all([
      getCachedCategoriesWithCounts(),
      getCachedActivePromotions(),
      getCachedSiteSettings(),
    ]);
    navCategories = toPlain(categories.filter((c) => c.count > 0));
    if (promotions && promotions.length > 0) {
      activePromotion = toPlain(promotions[0]);
    }
    siteSettings = resolveSiteSettings(toPlain(settingsRow));
  } catch (err) {
    console.error("StorefrontLayout data fetching error:", err);
  }

  return (
    <>
      <Toaster
        richColors
        position="top-center"
        duration={2500}
        closeButton
        toastOptions={{
          className: "!rounded-2xl !font-sans !shadow-xl !border !border-ink/10",
        }}
      />
      <NavigationBuffer />
      <CuteAmbientBackground />
      <Header categories={navCategories} activePromotion={activePromotion} siteSettings={siteSettings} />
      <main className="flex-1 pb-16 lg:pb-0">{children}</main>
      <Footer siteSettings={siteSettings} />
      <BottomTabBar />
      <MobileDrawer categories={navCategories} siteSettings={siteSettings} />
      <SearchSpotlight />
      <CartFab />
    </>
  );
}
