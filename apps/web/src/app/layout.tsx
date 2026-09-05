import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  variable: "--font-inter",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: "#FAF7F2",
};

export const metadata: Metadata = {
  title: {
    default: "Salt & Light – Thời Trang & Quà Tặng Lời Chúa",
    template: "%s · Salt & Light",
  },
  description:
    "Thời trang và quà tặng Cơ Đốc chính hãng: Áo thun 100% Cotton, túi tote canvas in lời Kinh Thánh. Đồng giá ship 19K toàn quốc.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={`${inter.variable} overflow-x-hidden font-sans`}>
      <body className="flex min-h-screen flex-col font-sans overflow-x-hidden w-full max-w-full text-ink bg-cream antialiased selection:bg-mint-200 selection:text-brand-forest">
        {children}
      </body>
    </html>
  );
}
