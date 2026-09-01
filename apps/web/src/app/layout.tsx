import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Salt & Light – Áo Thun Lời Chúa",
    template: "%s · Salt & Light",
  },
  description:
    "Thời trang và quà tặng Cơ Đốc: áo thun, túi tote canvas in lời Kinh Thánh. Đồng giá ship 19K toàn quốc.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body className="flex min-h-screen flex-col font-sans">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
