import type { Metadata } from "next";

export { default } from "@/screens/storefront/Welcome";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Mặc Lời Chúa mỗi ngày",
  description: "Áo thun 100% cotton và túi tote canvas in lời Kinh Thánh từ Salt & Light.",
  // Still under review: kept out of search results until it replaces a real entry point
  robots: { index: false, follow: false },
};
