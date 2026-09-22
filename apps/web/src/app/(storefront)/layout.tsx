import { Toaster } from "sonner";
import { ViewTransitions } from "next-view-transitions";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BottomTabBar } from "@/components/BottomTabBar";
import { MobileDrawer } from "@/components/MobileDrawer";
import { SearchSpotlight } from "@/components/SearchSpotlight";
import { CartFab } from "@/components/CartFab";
import { ContactInfoProvider } from "@/components/ContactInfoProvider";
import { AnalyticsTracker } from "@/components/AnalyticsTracker";
import { Suspense } from "react";
import { CuteAmbientBackground } from "@/components/CuteAmbientBackground";
import { NavigationBuffer } from "@/components/NavigationBuffer";
import { RevealOnScroll } from "@/components/RevealOnScroll";
import { getCachedCategoriesWithCounts, getCachedSiteSettings } from "@/server/queries";
import { toPlain } from "@/helpers/serialize";
import { DEFAULT_SITE_SETTINGS, resolveSiteSettings, type SiteSettingsData } from "@/interfaces/site-settings";

const StorefrontLayout = async ({ children }: { children: React.ReactNode }) => {
  let navCategories: any[] = [];
  let siteSettings: SiteSettingsData = DEFAULT_SITE_SETTINGS;
  try {
    const [{ categories }, settingsRow] = await Promise.all([
      getCachedCategoriesWithCounts(),
      getCachedSiteSettings(),
    ]);
    navCategories = toPlain(categories.filter((c) => c.count > 0));
    siteSettings = resolveSiteSettings(toPlain(settingsRow));
  } catch (err) {
    console.error("StorefrontLayout data fetching error:", err);
  }

  return (
    // Lets a product card's photo morph into the product page (components/ProductCard.tsx)
    <ViewTransitions>
    <ContactInfoProvider siteSettings={siteSettings}>
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
      <Header categories={navCategories} siteSettings={siteSettings} />
      <main className="flex-1 pb-16 lg:pb-0">{children}</main>
      <Footer siteSettings={siteSettings} />
      <BottomTabBar />
      <MobileDrawer categories={navCategories} siteSettings={siteSettings} />
      <SearchSpotlight />
      <CartFab />
      <RevealOnScroll />
      {/* useSearchParams needs a Suspense boundary so it doesn't opt the whole layout out of static rendering */}
      <Suspense fallback={null}>
        <AnalyticsTracker />
      </Suspense>
    </ContactInfoProvider>
    </ViewTransitions>
  );
};

export default StorefrontLayout;
