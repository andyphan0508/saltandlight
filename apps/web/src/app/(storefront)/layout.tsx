import { Suspense } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BottomTabBar } from "@/components/BottomTabBar";
import { MobileDrawer } from "@/components/MobileDrawer";
import { SearchSpotlight } from "@/components/SearchSpotlight";
import { CartFab } from "@/components/CartFab";
import { NavigationProgress } from "@/components/NavigationProgress";
import { getCachedCategoriesWithCounts } from "@/lib/queries";
import { toPlain } from "@/lib/serialize";

export default async function StorefrontLayout({ children }: { children: React.ReactNode }) {
  let navCategories: any[] = [];
  try {
    const { categories } = await getCachedCategoriesWithCounts();
    navCategories = toPlain(categories.filter((c) => c.count > 0));
  } catch (err) {
    console.error("StorefrontLayout getCachedCategoriesWithCounts error:", err);
  }

  return (
    <>
      <Suspense fallback={null}>
        <NavigationProgress />
      </Suspense>
      <Header categories={navCategories} />
      <main className="flex-1 pb-16 lg:pb-0">{children}</main>
      <Footer />
      <BottomTabBar />
      <MobileDrawer categories={navCategories} />
      <SearchSpotlight />
      <CartFab />
    </>
  );
}
