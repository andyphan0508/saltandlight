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

    <div className={`${cardClass} space-y-4`}>
      <div>
        <h3 className="text-sm font-bold text-ink">Thông tin liên hệ &amp; Hotline</h3>
        <p className="text-xs text-slate-500 mt-1">
          Số điện thoại này sẽ tự động đồng bộ trên thanh Header, Footer, Menu di động và cụm nút nổi FAB (Hotline/Zalo).
        </p>
      </div>
      <TextField
        label="Số điện thoại Hotline / Liên hệ"
        value={settings.footerPhone}
        onChange={(footerPhone) => onPatch({ footerPhone })}
        placeholder="0847 25 2025"
      />
      <TextField label="Địa chỉ" value={settings.footerAddress} onChange={(footerAddress) => onPatch({ footerAddress })} />
      <TextField label="Email" value={settings.footerEmail} onChange={(footerEmail) => onPatch({ footerEmail })} />
    </div>

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
