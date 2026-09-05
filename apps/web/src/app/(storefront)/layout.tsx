import { Suspense } from "react";
import { Toaster } from "sonner";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BottomTabBar } from "@/components/BottomTabBar";
import { MobileDrawer } from "@/components/MobileDrawer";
import { SearchSpotlight } from "@/components/SearchSpotlight";
import { CartFab } from "@/components/CartFab";
import { NavigationProgress } from "@/components/NavigationProgress";
import { CuteAmbientBackground } from "@/components/CuteAmbientBackground";
import { getCachedCategoriesWithCounts, getCachedActivePromotions } from "@/lib/queries";
import { toPlain } from "@/lib/serialize";

export default async function StorefrontLayout({ children }: { children: React.ReactNode }) {
  let navCategories: any[] = [];
  let activePromotion: any = null;
  try {
    const [{ categories }, promotions] = await Promise.all([
      getCachedCategoriesWithCounts(),
      getCachedActivePromotions(),
    ]);
    navCategories = toPlain(categories.filter((c) => c.count > 0));
    if (promotions && promotions.length > 0) {
      activePromotion = toPlain(promotions[0]);
    }
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
      <Suspense fallback={null}>
        <NavigationProgress />
      </Suspense>
      <Header categories={navCategories} activePromotion={activePromotion} />
      <main className="flex-1 pb-16 lg:pb-0">{children}</main>
      <Footer />
      <BottomTabBar />
      <MobileDrawer categories={navCategories} />
      <SearchSpotlight />
      <CartFab />
      <CuteAmbientBackground />
    </>
  );
}
