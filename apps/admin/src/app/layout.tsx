import type { Metadata } from "next";
import { Suspense } from "react";
import { Plus_Jakarta_Sans, Be_Vietnam_Pro } from "next/font/google";
import { NavigationProgress } from "@/components/NavigationProgress";
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
    default: "Salt & Light Admin Dashboard",
    template: "%s · Salt & Light Admin",
  },
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={`${plusJakarta.variable} ${beVietnam.variable}`}>
      <body className="font-sans antialiased text-ink bg-[#f8f9fa] selection:bg-mint-300 selection:text-ink">
        <Suspense fallback={null}>
          <NavigationProgress />
        </Suspense>
        {children}
      </body>
    </html>
  );
}
