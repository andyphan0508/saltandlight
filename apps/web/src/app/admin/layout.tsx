import type { Metadata } from "next";
import { Suspense } from "react";
import { Toaster } from "sonner";
import { NavigationProgress } from "@/components/admin/NavigationProgress";

export const metadata: Metadata = {
  title: {
    default: "Salt & Light Admin Dashboard",
    template: "%s · Salt & Light Admin",
  },
  robots: { index: false, follow: false },
};

export default function AdminBaseLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f8f9fa] text-ink antialiased selection:bg-mint-300 selection:text-ink">
      <Toaster richColors position="top-right" duration={3500} closeButton />
      <Suspense fallback={null}>
        <NavigationProgress />
      </Suspense>
      {children}
    </div>
  );
}
