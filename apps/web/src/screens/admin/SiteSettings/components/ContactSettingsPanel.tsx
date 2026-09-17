"use client";

import { TextField } from "@/components/admin/form-fields";
import { findZaloLink, withZaloLink } from "@/helpers/contact-info";
import type { SiteSettingsData } from "@/interfaces/site-settings";

interface ContactSettingsPanelProps {
  settings: SiteSettingsData;
  onPatch: (patch: Partial<SiteSettingsData>) => void;
}

const cardClass = "rounded-2xl bg-white p-5 border border-slate-200/80 shadow-xs";

/** The one place hotline, Zalo, email and address are edited — the whole storefront reads them from here. */
export const ContactSettingsPanel = ({ settings, onPatch }: ContactSettingsPanelProps) => (
  <div className={`${cardClass} space-y-4`}>
    <div>
      <h3 className="text-sm font-bold text-ink">Thông tin liên hệ</h3>
      <p className="mt-1 text-xs text-slate-500">
        Đổi ở đây là đổi đồng loạt: nút nổi Gọi/Zalo, header, footer, menu di động, trang Liên hệ, trang tra cứu và xác nhận
        đơn hàng.
      </p>
    </div>
    <TextField
      label="Số hotline"
      value={settings.footerPhone}
      onChange={(footerPhone) => onPatch({ footerPhone })}
      placeholder="0847 25 2025"
    />
    <div>
      <TextField
        label="Zalo (số điện thoại hoặc đường dẫn)"
        value={findZaloLink(settings.footerSocialLinks)}
        onChange={(value) => onPatch({ footerSocialLinks: withZaloLink(settings.footerSocialLinks, value) })}
        placeholder="Để trống = dùng số hotline ở trên"
      />
      <p className="mt-1 text-[11px] text-slate-400">
        Dán link nhóm/OA (https://zalo.me/…) hoặc chỉ cần gõ số — hệ thống tự tạo link.
      </p>
    </div>
    <TextField label="Email" value={settings.footerEmail} onChange={(footerEmail) => onPatch({ footerEmail })} />
    <TextField label="Địa chỉ" value={settings.footerAddress} onChange={(footerAddress) => onPatch({ footerAddress })} />
  </div>
);
