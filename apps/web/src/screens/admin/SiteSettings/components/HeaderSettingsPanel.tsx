"use client";

import { ArrayEditor } from "@/components/admin/form-fields";
import type { LogoSize, SiteSettingsData } from "@/interfaces/site-settings";
import { LogoUploadField } from "./LogoUploadField";
import { NavLinkFields, newNavLink } from "./NavLinkFields";

const LOGO_SIZE_OPTIONS: { value: LogoSize; label: string }[] = [
  { value: "sm", label: "Nhỏ" },
  { value: "md", label: "Vừa" },
  { value: "lg", label: "Lớn" },
];

interface HeaderSettingsPanelProps {
  settings: SiteSettingsData;
  onPatch: (patch: Partial<SiteSettingsData>) => void;
}

/** Header settings: logo, logo size, favicon and the menus on each side of the logo. */
export const HeaderSettingsPanel = ({ settings, onPatch }: HeaderSettingsPanelProps) => {
  const { headerNavItems } = settings;

  return (
    <>
      <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-ink">Logo</h3>
        <LogoUploadField
          label="Logo header"
          imageUrl={settings.logoUrl}
          onUploaded={(logoUrl) => onPatch({ logoUrl })}
          onClear={() => onPatch({ logoUrl: "/images/logo.png" })}
        />
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">Kích thước logo</label>
          <div className="flex gap-2">
            {LOGO_SIZE_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => onPatch({ logoSize: option.value })}
                className={`flex-1 rounded-xl border px-3 py-2 text-xs font-bold transition-colors ${
                  settings.logoSize === option.value
                    ? "border-brand-forest bg-brand-forest/10 text-brand-forest"
                    : "border-slate-200 text-slate-500 hover:border-slate-300"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
        <LogoUploadField
          label="Favicon (icon tab trình duyệt)"
          imageUrl={settings.faviconUrl ?? ""}
          onUploaded={(faviconUrl) => onPatch({ faviconUrl })}
          onClear={() => onPatch({ faviconUrl: "" })}
          clearLabel="Gỡ favicon"
        />
      </div>

      <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-xs space-y-5">
        <h3 className="text-sm font-bold text-ink">Menu điều hướng</h3>
        <ArrayEditor
          label="Menu bên trái logo"
          items={headerNavItems.left}
          onChange={(left) => onPatch({ headerNavItems: { ...headerNavItems, left } })}
          newItem={newNavLink}
          renderItem={(item, onUpdate) => <NavLinkFields item={item} onUpdate={onUpdate} />}
        />
        <ArrayEditor
          label="Menu bên phải logo"
          items={headerNavItems.right}
          onChange={(right) => onPatch({ headerNavItems: { ...headerNavItems, right } })}
          newItem={newNavLink}
          renderItem={(item, onUpdate) => <NavLinkFields item={item} onUpdate={onUpdate} />}
        />
      </div>
    </>
  );
};
