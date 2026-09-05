import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";

const patrickHand = localFont({
  src: "../assets/fonts/PatrickHand-Regular.ttf",
  variable: "--font-patrick",
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
    <html lang="vi" className={`${patrickHand.variable} overflow-x-hidden font-patrick`}>
      <body className="flex min-h-screen flex-col font-patrick overflow-x-hidden w-full max-w-full text-ink bg-cream antialiased selection:bg-mint-200 selection:text-brand-forest">
        {children}
      </body>
    </html>
  );
}
