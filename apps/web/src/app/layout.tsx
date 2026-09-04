import type { Metadata } from "next";
import { Suspense } from "react";
import { Plus_Jakarta_Sans, Be_Vietnam_Pro } from "next/font/google";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BottomTabBar } from "@/components/BottomTabBar";
import { MobileDrawer } from "@/components/MobileDrawer";
import { SearchSpotlight } from "@/components/SearchSpotlight";
import { CartFab } from "@/components/CartFab";
import { NavigationProgress } from "@/components/NavigationProgress";
import { getCachedCategoriesWithCounts } from "@/lib/queries";
import { toPlain } from "@/lib/serialize";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-display",
  display: "swap",
});

const beVietnam = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Salt & Light – Thời Trang & Quà Tặng Lời Chúa",
    template: "%s · Salt & Light",
  },
  description:
    "Thời trang và quà tặng Cơ Đốc chính hãng: Áo thun 100% Cotton, túi tote canvas in lời Kinh Thánh. Đồng giá ship 19K toàn quốc.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  let navCategories: any[] = [];
  try {
    const { categories } = await getCachedCategoriesWithCounts();
    navCategories = toPlain(categories.filter((c) => c.count > 0));
  } catch (err) {
    console.error("RootLayout getCachedCategoriesWithCounts error:", err);
  }

  return (
    <html lang="vi" className={`${plusJakarta.variable} ${beVietnam.variable}`}>
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
