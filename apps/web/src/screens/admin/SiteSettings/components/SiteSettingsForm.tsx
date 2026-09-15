"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@saltandlight/ui";
import { toast } from "sonner";
import { adminFetch } from "@/api/admin-fetch";
import { CheckCircle } from "@/components/admin/Icons";
import type { SiteSettingsData } from "@/interfaces/site-settings";
import { FooterPreview } from "./FooterPreview";
import { FooterSettingsPanel } from "./FooterSettingsPanel";
import { HeaderPreview } from "./HeaderPreview";
import { HeaderSettingsPanel } from "./HeaderSettingsPanel";

type SettingsTab = "header" | "footer";

const TABS: { id: SettingsTab; label: string }[] = [
  { id: "header", label: "Header & Logo" },
  { id: "footer", label: "Footer" },
];

/** Header & footer settings with a live preview; everything is saved in one PATCH. */
export const SiteSettingsForm = ({ initialSettings }: { initialSettings: SiteSettingsData }) => {
  const router = useRouter();
  const [tab, setTab] = useState<SettingsTab>("header");
  const [settings, setSettings] = useState<SiteSettingsData>(initialSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onPatch = (patch: Partial<SiteSettingsData>) => setSettings((prev) => ({ ...prev, ...patch }));

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    try {
      await adminFetch("/api/admin/settings/site", {
        method: "PATCH",
        body: { ...settings, faviconUrl: settings.faviconUrl?.trim() || null },
      });
      toast.success("Đã lưu cài đặt Header & Footer!");
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Có lỗi xảy ra";
      setError(message);
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {error && <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">{error}</div>}

      <div className="flex gap-2 border-b border-slate-200">
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors ${
              tab === id ? "border-brand-forest text-brand-forest" : "border-transparent text-slate-400 hover:text-slate-600"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          {tab === "header" ? (
            <HeaderSettingsPanel settings={settings} onPatch={onPatch} />
          ) : (
            <FooterSettingsPanel settings={settings} onPatch={onPatch} />
          )}

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isSaving}
              className="rounded-xl px-5 py-2.5 text-xs font-bold !bg-brand-forest hover:!bg-brand-forest/90 !text-white shadow-xs inline-flex items-center gap-1.5"
            >
              <CheckCircle size={15} />
              {isSaving ? "Đang lưu..." : "Lưu cài đặt"}
            </Button>
          </div>
        </div>

        <div className="lg:sticky lg:top-6 lg:self-start">
          <div className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">Xem trước trực tiếp</div>
          <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-cream shadow-xs">
            {tab === "header" ? <HeaderPreview settings={settings} /> : <FooterPreview settings={settings} />}
          </div>
        </div>
      </div>
    </form>
  );
};
