"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@saltandlight/ui";
import { Upload, ImageOff, CheckCircle } from "@/components/admin/Icons";
import { TextField, ArrayEditor } from "@/components/admin/form-fields";
import { toast } from "sonner";
import type {
  SiteSettingsData,
  NavLinkItem,
  FooterSocialLink,
  FooterColumn,
  LogoSize,
} from "@/lib/site-settings-types";
import { LOGO_SIZE_CLASSES } from "@/lib/site-settings-types";

const LOGO_SIZE_OPTIONS: { value: LogoSize; label: string }[] = [
  { value: "sm", label: "Nhỏ" },
  { value: "md", label: "Vừa" },
  { value: "lg", label: "Lớn" },
];

function useImageUpload(onUploaded: (url: string) => void) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/admin/media/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Tải ảnh thất bại");
      onUploaded(data.url);
      toast.success("Tải ảnh lên thành công!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Tải ảnh thất bại");
    } finally {
      setIsUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return { inputRef, isUploading, handleFile };
}

function LogoUploadField({
  label,
  imageUrl,
  onUploaded,
  onClear,
  clearLabel,
}: {
  label: string;
  imageUrl: string;
  onUploaded: (url: string) => void;
  onClear?: () => void;
  clearLabel?: string;
}) {
  const { inputRef, isUploading, handleFile } = useImageUpload(onUploaded);
  return (
    <div>
      <label className="block text-xs font-bold text-slate-700 mb-1.5">{label}</label>
      <div className="flex items-start gap-4">
        <div className="relative h-16 w-32 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center">
          {imageUrl ? (
            <Image src={imageUrl} alt={label} fill className="object-contain p-2" unoptimized />
          ) : (
            <ImageOff size={20} className="text-slate-300" />
          )}
        </div>
        <div className="flex-1 space-y-1.5">
          <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFile} className="hidden" />
          <Button
            type="button"
            variant="outline"
            onClick={() => inputRef.current?.click()}
            disabled={isUploading}
            className="text-xs px-3.5 py-2 rounded-xl font-medium border-slate-200 hover:bg-slate-50"
          >
            <Upload size={14} className="mr-1" />
            {isUploading ? "Đang tải..." : "Tải ảnh lên"}
          </Button>
          {onClear && imageUrl && (
            <button type="button" onClick={onClear} className="block text-[11px] font-semibold text-rose-500 hover:underline">
              {clearLabel ?? "Gỡ ảnh, dùng mặc định"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function newNavLink(): NavLinkItem {
  return { label: "", href: "/" };
}

function NavLinkFields({ item, update }: { item: NavLinkItem; update: (patch: Partial<NavLinkItem>) => void }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <TextField label="Tên mục" value={item.label} onChange={(v) => update({ label: v })} placeholder="Trang chủ" />
      <TextField label="Đường dẫn" value={item.href} onChange={(v) => update({ href: v })} placeholder="/" />
    </div>
  );
}

export function SiteSettingsForm({ initialSettings }: { initialSettings: SiteSettingsData }) {
  const router = useRouter();
  const [tab, setTab] = useState<"header" | "footer">("header");

  const [logoUrl, setLogoUrl] = useState(initialSettings.logoUrl);
  const [logoSize, setLogoSize] = useState<LogoSize>(initialSettings.logoSize);
  const [footerLogoUrl, setFooterLogoUrl] = useState(initialSettings.footerLogoUrl);
  const [faviconUrl, setFaviconUrl] = useState(initialSettings.faviconUrl ?? "");
  const [navLeft, setNavLeft] = useState<NavLinkItem[]>(initialSettings.headerNavItems.left);
  const [navRight, setNavRight] = useState<NavLinkItem[]>(initialSettings.headerNavItems.right);

  const [footerBrandText, setFooterBrandText] = useState(initialSettings.footerBrandText);
  const [footerPhone, setFooterPhone] = useState(initialSettings.footerPhone);
  const [footerEmail, setFooterEmail] = useState(initialSettings.footerEmail);
  const [footerAddress, setFooterAddress] = useState(initialSettings.footerAddress);
  const [footerSocialLinks, setFooterSocialLinks] = useState<FooterSocialLink[]>(initialSettings.footerSocialLinks);
  const [footerColumns, setFooterColumns] = useState<FooterColumn[]>(initialSettings.footerColumns);

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/settings/site", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          logoUrl,
          logoSize,
          footerLogoUrl,
          faviconUrl: faviconUrl.trim() || null,
          headerNavItems: { left: navLeft, right: navRight },
          footerBrandText,
          footerPhone,
          footerEmail,
          footerAddress,
          footerSocialLinks,
          footerColumns,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Lưu thất bại");
      toast.success("Đã lưu cài đặt Header & Footer!");
      router.refresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Có lỗi xảy ra";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">{error}</div>
      )}

      <div className="flex gap-2 border-b border-slate-200">
        <button
          type="button"
          onClick={() => setTab("header")}
          className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors ${
            tab === "header" ? "border-brand-forest text-brand-forest" : "border-transparent text-slate-400 hover:text-slate-600"
          }`}
        >
          Header &amp; Logo
        </button>
        <button
          type="button"
          onClick={() => setTab("footer")}
          className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors ${
            tab === "footer" ? "border-brand-forest text-brand-forest" : "border-transparent text-slate-400 hover:text-slate-600"
          }`}
        >
          Footer
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Form column */}
        <div className="space-y-4">
          {tab === "header" ? (
            <>
              <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-xs space-y-4">
                <h3 className="text-sm font-bold text-ink">Logo</h3>
                <LogoUploadField
                  label="Logo header"
                  imageUrl={logoUrl}
                  onUploaded={setLogoUrl}
                  onClear={() => setLogoUrl("/images/logo.png")}
                />
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Kích thước logo</label>
                  <div className="flex gap-2">
                    {LOGO_SIZE_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setLogoSize(opt.value)}
                        className={`flex-1 rounded-xl border px-3 py-2 text-xs font-bold transition-colors ${
                          logoSize === opt.value
                            ? "border-brand-forest bg-brand-forest/10 text-brand-forest"
                            : "border-slate-200 text-slate-500 hover:border-slate-300"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
                <LogoUploadField
                  label="Favicon (icon tab trình duyệt)"
                  imageUrl={faviconUrl}
                  onUploaded={setFaviconUrl}
                  onClear={() => setFaviconUrl("")}
                  clearLabel="Gỡ favicon"
                />
              </div>

              <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-xs space-y-5">
                <h3 className="text-sm font-bold text-ink">Menu điều hướng</h3>
                <ArrayEditor
                  label="Menu bên trái logo"
                  items={navLeft}
                  onChange={setNavLeft}
                  newItem={newNavLink}
                  renderItem={(item, update) => <NavLinkFields item={item} update={update} />}
                />
                <ArrayEditor
                  label="Menu bên phải logo"
                  items={navRight}
                  onChange={setNavRight}
                  newItem={newNavLink}
                  renderItem={(item, update) => <NavLinkFields item={item} update={update} />}
                />
              </div>
            </>
          ) : (
            <>
              <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-xs space-y-4">
                <h3 className="text-sm font-bold text-ink">Logo &amp; giới thiệu</h3>
                <LogoUploadField
                  label="Logo footer"
                  imageUrl={footerLogoUrl}
                  onUploaded={setFooterLogoUrl}
                  onClear={() => setFooterLogoUrl(logoUrl)}
                  clearLabel="Gỡ ảnh, dùng chung logo header"
                />
                <TextField label="Đoạn giới thiệu thương hiệu" value={footerBrandText} onChange={setFooterBrandText} multiline />
              </div>

              <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-xs space-y-4">
                <h3 className="text-sm font-bold text-ink">Thông tin liên hệ</h3>
                <TextField label="Địa chỉ" value={footerAddress} onChange={setFooterAddress} />
                <TextField label="Điện thoại" value={footerPhone} onChange={setFooterPhone} />
                <TextField label="Email" value={footerEmail} onChange={setFooterEmail} />
              </div>

              <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-xs">
                <ArrayEditor
                  label="Mạng xã hội"
                  items={footerSocialLinks}
                  onChange={setFooterSocialLinks}
                  newItem={() => ({ platform: "", url: "https://" })}
                  renderItem={(item, update) => (
                    <div className="grid grid-cols-2 gap-2">
                      <TextField label="Tên nền tảng" value={item.platform} onChange={(v) => update({ platform: v })} placeholder="Facebook" />
                      <TextField label="Đường dẫn" value={item.url} onChange={(v) => update({ url: v })} placeholder="https://..." />
                    </div>
                  )}
                />
              </div>

              <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-xs">
                <ArrayEditor
                  label="Các cột liên kết"
                  items={footerColumns}
                  onChange={setFooterColumns}
                  newItem={() => ({ title: "", items: [] })}
                  renderItem={(column, update) => (
                    <div className="space-y-3">
                      <TextField label="Tiêu đề cột" value={column.title} onChange={(v) => update({ title: v })} placeholder="Về Chúng Tôi" />
                      <ArrayEditor
                        label="Liên kết trong cột"
                        items={column.items}
                        onChange={(items) => update({ items })}
                        newItem={newNavLink}
                        renderItem={(item, updateItem) => <NavLinkFields item={item} update={updateItem} />}
                      />
                    </div>
                  )}
                />
              </div>
            </>
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

        {/* Live preview column */}
        <div className="lg:sticky lg:top-6 lg:self-start">
          <div className="mb-2 text-[11px] font-black uppercase tracking-wider text-slate-400">Xem trước trực tiếp</div>
          <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-cream shadow-xs">
            {tab === "header" ? (
              <HeaderPreview logoUrl={logoUrl} logoSize={logoSize} navLeft={navLeft} navRight={navRight} />
            ) : (
              <FooterPreview
                logoUrl={footerLogoUrl}
                logoSize={logoSize}
                brandText={footerBrandText}
                phone={footerPhone}
                email={footerEmail}
                address={footerAddress}
                socialLinks={footerSocialLinks}
                columns={footerColumns}
              />
            )}
          </div>
        </div>
      </div>
    </form>
  );
}

/** Scaled-down mock of the real Header — mirrors Header.tsx's structure, not an iframe of the live site. */
function HeaderPreview({
  logoUrl,
  logoSize,
  navLeft,
  navRight,
}: {
  logoUrl: string;
  logoSize: LogoSize;
  navLeft: NavLinkItem[];
  navRight: NavLinkItem[];
}) {
  return (
    <div className="p-4">
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 rounded-xl border border-ink/10 bg-white p-3">
        <div className="flex flex-wrap items-center gap-1 justify-self-start">
          {navLeft.map((item, i) => (
            <span key={i} className="rounded-full bg-ink/5 px-2 py-1 text-[9px] font-bold uppercase text-ink/70 whitespace-nowrap">
              {item.label || "…"}
            </span>
          ))}
        </div>
        <div className={`relative ${LOGO_SIZE_CLASSES[logoSize].header.split(" ").filter((c) => !c.includes("sm:") && !c.includes("lg:")).join(" ")}`}>
          {logoUrl && <Image src={logoUrl} alt="Logo" fill className="object-contain" unoptimized />}
        </div>
        <div className="flex flex-wrap items-center gap-1 justify-self-end">
          {navRight.map((item, i) => (
            <span key={i} className="rounded-full bg-ink/5 px-2 py-1 text-[9px] font-bold uppercase text-ink/70 whitespace-nowrap">
              {item.label || "…"}
            </span>
          ))}
        </div>
      </div>
      <p className="mt-3 text-center text-[10px] text-slate-400">Bản xem trước thu nhỏ — kích thước thật sẽ lớn hơn trên desktop.</p>
    </div>
  );
}

/** Scaled-down mock of the real Footer. */
function FooterPreview({
  logoUrl,
  logoSize,
  brandText,
  phone,
  email,
  address,
  socialLinks,
  columns,
}: {
  logoUrl: string;
  logoSize: LogoSize;
  brandText: string;
  phone: string;
  email: string;
  address: string;
  socialLinks: FooterSocialLink[];
  columns: FooterColumn[];
}) {
  return (
    <div className="p-4">
      <div className="rounded-xl border border-ink/10 bg-mint-50/70 p-4 space-y-4">
        <div className="relative h-8 w-32">
          {logoUrl && <Image src={logoUrl} alt="Logo" fill className="object-contain object-left" unoptimized />}
        </div>
        <p className="text-[10px] text-ink/60 leading-relaxed line-clamp-3">{brandText}</p>
        <div className="space-y-1 text-[10px] text-ink/60">
          <div>{address}</div>
          <div>{phone}</div>
          <div>{email}</div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {columns.map((col, i) => (
            <div key={i}>
              <div className="text-[9px] font-black uppercase text-ink">{col.title || "…"}</div>
              <div className="mt-1 space-y-0.5">
                {col.items.map((item, j) => (
                  <div key={j} className="text-[9px] text-ink/60">
                    {item.label || "…"}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        {socialLinks.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {socialLinks.map((s, i) => (
              <span key={i} className="rounded-lg bg-white border border-ink/10 px-2 py-1 text-[9px] font-bold text-ink/70">
                {s.platform || "…"}
              </span>
            ))}
          </div>
        )}
      </div>
      <p className="mt-3 text-center text-[10px] text-slate-400">Bản xem trước thu nhỏ.</p>
    </div>
  );
}
