import type { Metadata } from "next";
import { Suspense } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BottomTabBar } from "@/components/BottomTabBar";
import { MobileDrawer } from "@/components/MobileDrawer";
import { SearchSpotlight } from "@/components/SearchSpotlight";
import { CartFab } from "@/components/CartFab";
import { NavigationProgress } from "@/components/NavigationProgress";
import { listCategoriesWithCounts } from "@/lib/queries";
import { toPlain } from "@/lib/serialize";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Salt & Light – Thời Trang & Quà Tặng Lời Chúa",
    template: "%s · Salt & Light",
  },
  description:
    "Thời trang và quà tặng Cơ Đốc chính hãng: Áo thun 100% Cotton, túi tote canvas in lời Kinh Thánh. Đồng giá ship 19K toàn quốc.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { categories } = await listCategoriesWithCounts();
  const navCategories = toPlain(categories.filter((c) => c.count > 0));

  return (
    <html lang="vi">
      <body className="flex min-h-screen flex-col font-sans">
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
      </body>
    </html>
  );
}
