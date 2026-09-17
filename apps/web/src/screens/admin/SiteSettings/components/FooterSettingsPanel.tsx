"use client";

import { ArrayEditor, TextField } from "@/components/admin/form-fields";
import type { SiteSettingsData } from "@/interfaces/site-settings";
import { LogoUploadField } from "./LogoUploadField";
import { NavLinkFields, newNavLink } from "./NavLinkFields";

interface FooterSettingsPanelProps {
  settings: SiteSettingsData;
  onPatch: (patch: Partial<SiteSettingsData>) => void;
}

const cardClass = "rounded-2xl bg-white p-5 border border-slate-200/80 shadow-xs";

/** Footer settings: logo and brand text, contact details, social links and link columns. */
export const FooterSettingsPanel = ({ settings, onPatch }: FooterSettingsPanelProps) => (
  <>
    <div className={`${cardClass} space-y-4`}>
      <h3 className="text-sm font-bold text-ink">Logo &amp; giới thiệu</h3>
      <LogoUploadField
        label="Logo footer"
        imageUrl={settings.footerLogoUrl}
        onUploaded={(footerLogoUrl) => onPatch({ footerLogoUrl })}
        onClear={() => onPatch({ footerLogoUrl: settings.logoUrl })}
        clearLabel="Gỡ ảnh, dùng chung logo header"
      />
      <TextField
        label="Đoạn giới thiệu thương hiệu"
        value={settings.footerBrandText}
        onChange={(footerBrandText) => onPatch({ footerBrandText })}
        isMultiline
      />
    </div>

    <p className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-500">
      Hotline, Zalo, email và địa chỉ được chỉnh ở tab <strong>Liên hệ</strong>.
    </p>

    <div className={cardClass}>
      <ArrayEditor
        label="Mạng xã hội"
        items={settings.footerSocialLinks}
        onChange={(footerSocialLinks) => onPatch({ footerSocialLinks })}
        newItem={() => ({ platform: "", url: "https://" })}
        renderItem={(item, onUpdate) => (
          <div className="grid grid-cols-2 gap-2">
            <TextField label="Tên nền tảng" value={item.platform} onChange={(v) => onUpdate({ platform: v })} placeholder="Facebook" />
            <TextField label="Đường dẫn" value={item.url} onChange={(v) => onUpdate({ url: v })} placeholder="https://..." />
          </div>
        )}
      />
    </div>

    <div className={cardClass}>
      <ArrayEditor
        label="Các cột liên kết"
        items={settings.footerColumns}
        onChange={(footerColumns) => onPatch({ footerColumns })}
        newItem={() => ({ title: "", items: [] })}
        renderItem={(column, onUpdate) => (
          <div className="space-y-3">
            <TextField label="Tiêu đề cột" value={column.title} onChange={(v) => onUpdate({ title: v })} placeholder="Về Chúng Tôi" />
            <ArrayEditor
              label="Liên kết trong cột"
              items={column.items}
              onChange={(items) => onUpdate({ items })}
              newItem={newNavLink}
              renderItem={(item, onUpdateItem) => <NavLinkFields item={item} onUpdate={onUpdateItem} />}
            />
          </div>
        )}
      />
    </div>
  </>
);
