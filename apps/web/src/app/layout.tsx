import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Be_Vietnam_Pro } from "next/font/google";
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={`${plusJakarta.variable} ${beVietnam.variable}`}>
      <body className="flex min-h-screen flex-col font-sans">
        {children}
      </body>
    </html>
  );
}
