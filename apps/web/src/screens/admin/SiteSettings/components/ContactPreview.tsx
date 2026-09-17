import { resolveContactInfo } from "@/helpers/contact-info";
import type { SiteSettingsData } from "@/interfaces/site-settings";

/** Shows exactly where each button will send a customer, so a typo is caught before saving. */
export const ContactPreview = ({ settings }: { settings: SiteSettingsData }) => {
  const info = resolveContactInfo(settings);
  const rows = [
    { label: "Nút Gọi", value: info.phone, href: info.telHref },
    {
      label: "Nút Zalo",
      value: info.hasCustomZalo ? "Theo link Zalo đã nhập" : "Dùng số hotline",
      href: info.zaloHref,
    },
    { label: "Email", value: info.email, href: info.mailHref },
    { label: "Địa chỉ", value: info.address, href: "" },
  ];

  return (
    <div className="space-y-2.5 p-5">
      {rows.map((row) => (
        <div key={row.label} className="rounded-xl border border-ink/10 bg-white p-3">
          <div className="text-[10px] font-bold uppercase tracking-wider text-ink/40">{row.label}</div>
          <div className="mt-0.5 text-sm font-bold text-ink">{row.value || "—"}</div>
          {row.href ? (
            <code className="mt-1 block truncate text-[11px] text-brand-forest">{row.href}</code>
          ) : (
            row.label !== "Địa chỉ" && <div className="mt-1 text-[11px] font-semibold text-rose-600">Chưa có — nút này sẽ bị ẩn</div>
          )}
        </div>
      ))}
    </div>
  );
};
