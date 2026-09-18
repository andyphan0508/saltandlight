"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { adminFetch } from "@/api/admin-fetch";
import { Mail, RefreshCw, Smartphone, Monitor } from "@/components/admin/Icons";
import {
  DEFAULT_ORDER_EMAIL,
  ORDER_EMAIL_BUTTON_TARGETS,
  ORDER_EMAIL_THEMES,
  ORDER_EMAIL_TOKENS,
  SAMPLE_ORDER,
  renderOrderEmail,
  type OrderEmailTemplate,
} from "@/helpers/order-email";

type TextKey = "subject" | "title" | "description" | "content";
type Field = HTMLInputElement | HTMLTextAreaElement;

const CUSTOM_TARGET = "__custom__";
const INPUT_CLASS =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-base text-ink focus:border-brand-forest focus:outline-none sm:text-sm";

const Section = ({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) => (
  <section className="space-y-4 rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5">
    <div>
      <h2 className="text-sm font-bold text-slate-900">{title}</h2>
      {hint && <p className="mt-0.5 text-xs text-slate-500">{hint}</p>}
    </div>
    {children}
  </section>
);

const Label = ({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) => (
  <label htmlFor={htmlFor} className="mb-1 block text-xs font-bold text-slate-700">
    {children}
  </label>
);

const ColorField = ({ id, label, value, onChange }: { id: string; label: string; value: string; onChange: (v: string) => void }) => (
  <div>
    <Label htmlFor={id}>{label}</Label>
    <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-1.5 pr-3">
      <input
        type="color"
        aria-label={`${label} — bảng màu`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 w-11 cursor-pointer rounded-lg border-0 bg-transparent p-0"
      />
      <input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value.trim())}
        maxLength={7}
        spellCheck={false}
        className="w-full bg-transparent font-mono text-base uppercase text-ink focus:outline-none sm:text-sm"
      />
    </div>
  </div>
);

/**
 * Edits the order email with a live preview rendered by the same function the
 * server sends with, so what the admin sees is exactly what the customer gets.
 */
export const EmailTemplateEditor = ({ initialTemplate, logoPath }: { initialTemplate: OrderEmailTemplate; logoPath: string }) => {
  const [saved, setSaved] = useState(initialTemplate);
  const [template, setTemplate] = useState(initialTemplate);
  const [isCustomTarget, setIsCustomTarget] = useState(
    !ORDER_EMAIL_BUTTON_TARGETS.some((t) => t.path === initialTemplate.buttonPath),
  );
  const [pending, setPending] = useState<"save" | "test" | null>(null);
  const [view, setView] = useState<"edit" | "preview">("edit");
  const [device, setDevice] = useState<"mobile" | "desktop">("desktop");
  const [origin, setOrigin] = useState("");
  const [frameHeight, setFrameHeight] = useState(900);

  const fields = useRef<Partial<Record<TextKey, Field | null>>>({});
  const lastFocused = useRef<TextKey>("content");

  useEffect(() => setOrigin(window.location.origin), []);

  const isDirty = JSON.stringify(template) !== JSON.stringify(saved);
  const set = (patch: Partial<OrderEmailTemplate>) => setTemplate((t) => ({ ...t, ...patch }));

  const html = useMemo(
    () =>
      renderOrderEmail({
        template,
        order: SAMPLE_ORDER,
        siteUrl: origin,
        logoUrl: logoPath.startsWith("/") ? `${origin}${logoPath}` : logoPath,
      }).html,
    [template, origin, logoPath],
  );

  /** Puts a token at the cursor of the field last typed in, keeping the cursor after it. */
  const insertToken = (token: string) => {
    const key = lastFocused.current;
    const el = fields.current[key];
    const value = template[key];
    const start = el?.selectionStart ?? value.length;
    const end = el?.selectionEnd ?? value.length;
    set({ [key]: value.slice(0, start) + token + value.slice(end) });
    requestAnimationFrame(() => {
      el?.focus();
      el?.setSelectionRange(start + token.length, start + token.length);
    });
  };

  const textProps = (key: TextKey) => ({
    id: `email-${key}`,
    value: template[key],
    ref: (el: Field | null) => {
      fields.current[key] = el;
    },
    onFocus: () => {
      lastFocused.current = key;
    },
    onChange: (e: React.ChangeEvent<Field>) => set({ [key]: e.target.value }),
    className: INPUT_CLASS,
  });

  const onSave = async () => {
    setPending("save");
    try {
      await adminFetch("/api/admin/settings/email-template", { method: "PATCH", body: template });
      setSaved(template);
      toast.success("Đã lưu mẫu email");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Không thể lưu mẫu email");
    } finally {
      setPending(null);
    }
  };

  const onSendTest = async () => {
    setPending("test");
    try {
      const { sentTo } = await adminFetch<{ sentTo: string }>("/api/admin/settings/email-template/test", {
        method: "POST",
        body: template,
      });
      toast.success(`Đã gửi email thử tới ${sentTo}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Không gửi được email thử");
    } finally {
      setPending(null);
    }
  };

  const onReset = () => {
    if (!confirm("Đưa mẫu về nội dung và màu mặc định? Thay đổi chỉ áp dụng khi bạn bấm Lưu.")) return;
    setTemplate(DEFAULT_ORDER_EMAIL);
    setIsCustomTarget(false);
  };

  const exampleUrl = `${origin}${template.buttonPath.replaceAll("{mã đơn}", SAMPLE_ORDER.orderNumber)}`;

  return (
    <div className="space-y-4">
      {/* Phones: one pane at a time */}
      <nav aria-label="Chế độ" className="grid grid-cols-2 gap-1 rounded-full bg-slate-200/70 p-1 lg:hidden">
        {(["edit", "preview"] as const).map((v) => (
          <button
            key={v}
            type="button"
            aria-pressed={view === v}
            onClick={() => setView(v)}
            className={`rounded-full py-2 text-sm font-semibold ${view === v ? "bg-white text-slate-900 shadow-sm" : "text-slate-600"}`}
          >
            {v === "edit" ? "Chỉnh sửa" : "Xem trước"}
          </button>
        ))}
      </nav>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
        <div className={`space-y-4 ${view === "edit" ? "" : "max-lg:hidden"}`}>
          <Section title="Giao diện" hint="Chọn một bộ màu có sẵn hoặc tự chỉnh từng màu.">
            <div className="flex flex-wrap gap-2">
              {ORDER_EMAIL_THEMES.map((theme) => {
                const isActive =
                  theme.accentColor === template.accentColor.toLowerCase() &&
                  theme.backgroundColor === template.backgroundColor.toLowerCase();
                return (
                  <button
                    key={theme.name}
                    type="button"
                    aria-pressed={isActive}
                    onClick={() => set({ accentColor: theme.accentColor, backgroundColor: theme.backgroundColor })}
                    className={`flex items-center gap-2 rounded-full border py-1.5 pl-1.5 pr-3 text-xs font-semibold transition-colors ${
                      isActive ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white text-slate-700 hover:border-slate-400"
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className="relative h-6 w-6 overflow-hidden rounded-full border border-black/10"
                      style={{ backgroundColor: theme.backgroundColor }}
                    >
                      <span className="absolute inset-y-0 right-0 w-1/2" style={{ backgroundColor: theme.accentColor }} />
                    </span>
                    {theme.name}
                  </button>
                );
              })}
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <ColorField id="email-accent" label="Màu chủ đạo (nút, viền trên)" value={template.accentColor} onChange={(v) => set({ accentColor: v })} />
              <ColorField id="email-background" label="Màu nền" value={template.backgroundColor} onChange={(v) => set({ backgroundColor: v })} />
            </div>
          </Section>

          <Section title="Nội dung" hint="Bấm một biến để chèn vào ô đang gõ; mỗi đơn sẽ tự điền thông tin thật.">
            <div className="flex flex-wrap gap-1.5">
              {ORDER_EMAIL_TOKENS.map((token) => (
                <button
                  key={token}
                  type="button"
                  // Keep focus (and the cursor) in the field being edited
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => insertToken(token)}
                  className="rounded-lg bg-mint-50 px-2.5 py-1.5 font-mono text-xs font-semibold text-brand-forest hover:bg-mint-100"
                >
                  {token}
                </button>
              ))}
            </div>
            <div>
              <Label htmlFor="email-subject">Tiêu đề email (dòng khách thấy trong hộp thư)</Label>
              <input {...textProps("subject")} />
            </div>
            <div>
              <Label htmlFor="email-title">Tiêu đề lớn</Label>
              <input {...textProps("title")} />
            </div>
            <div>
              <Label htmlFor="email-description">Mô tả ngắn (dưới tiêu đề)</Label>
              <input {...textProps("description")} />
            </div>
            <div>
              <Label htmlFor="email-content">Lời nhắn</Label>
              <textarea {...textProps("content")} rows={6} />
              <p className="mt-1 text-[11px] text-slate-500">Để trống một dòng giữa hai đoạn để tách đoạn.</p>
            </div>
          </Section>

          <Section title="Nút bấm" hint="Nút nằm dưới lời nhắn, mở một trang trên website.">
            <div>
              <Label htmlFor="email-button-label">Chữ trên nút</Label>
              <input
                id="email-button-label"
                value={template.buttonLabel}
                onChange={(e) => set({ buttonLabel: e.target.value })}
                className={INPUT_CLASS}
              />
            </div>
            <div>
              <Label htmlFor="email-button-target">Nút dẫn tới</Label>
              <select
                id="email-button-target"
                value={isCustomTarget ? CUSTOM_TARGET : template.buttonPath}
                onChange={(e) => {
                  const isCustom = e.target.value === CUSTOM_TARGET;
                  setIsCustomTarget(isCustom);
                  if (!isCustom) set({ buttonPath: e.target.value });
                }}
                className={INPUT_CLASS}
              >
                {ORDER_EMAIL_BUTTON_TARGETS.map((t) => (
                  <option key={t.path} value={t.path}>
                    {t.label}
                  </option>
                ))}
                <option value={CUSTOM_TARGET}>Trang khác trên website…</option>
              </select>
            </div>
            {isCustomTarget && (
              <div>
                <Label htmlFor="email-button-path">Đường dẫn (bắt đầu bằng /)</Label>
                <input
                  id="email-button-path"
                  value={template.buttonPath}
                  onChange={(e) => set({ buttonPath: e.target.value })}
                  placeholder="/danh-muc/ao-thun-nguoi-lon"
                  spellCheck={false}
                  className={`${INPUT_CLASS} font-mono`}
                />
              </div>
            )}
            <p className="break-all text-[11px] text-slate-500">
              Ví dụ với đơn mẫu: <span className="font-mono text-slate-700">{exampleUrl}</span>
            </p>
          </Section>

          {/* Stays reachable while scrolling a long form; sits above the phone tab bar */}
          <div className="sticky bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-10 flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-lg backdrop-blur lg:bottom-4">
            <button
              type="button"
              onClick={onSave}
              disabled={!isDirty || pending !== null}
              className="min-h-11 flex-1 rounded-full bg-brand-forest px-5 text-sm font-bold text-white transition-colors hover:bg-emerald-800 disabled:opacity-50 sm:flex-none"
            >
              {pending === "save" ? "Đang lưu…" : isDirty ? "Lưu mẫu email" : "Đã lưu"}
            </button>
            <button
              type="button"
              onClick={onSendTest}
              disabled={pending !== null}
              className="inline-flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 hover:border-slate-400 disabled:opacity-50 sm:flex-none"
            >
              <Mail size={15} />
              {pending === "test" ? "Đang gửi…" : "Gửi thử cho tôi"}
            </button>
            <button
              type="button"
              onClick={onReset}
              className="inline-flex min-h-11 items-center gap-1.5 rounded-full px-3 text-xs font-semibold text-slate-500 hover:text-slate-900 sm:ml-auto"
            >
              <RefreshCw size={14} />
              Mặc định
            </button>
          </div>
        </div>

        <div className={`lg:sticky lg:top-4 ${view === "preview" ? "" : "max-lg:hidden"}`}>
          <div className="rounded-2xl border border-slate-200/80 bg-white">
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-slate-900">
                  {renderOrderEmail({ template, order: SAMPLE_ORDER, siteUrl: origin, logoUrl: null }).subject}
                </p>
                <p className="text-[11px] text-slate-500">Xem trước với một đơn mẫu</p>
              </div>
              <div className="flex flex-shrink-0 gap-1 rounded-full bg-slate-100 p-1 max-sm:hidden">
                {(
                  [
                    ["mobile", Smartphone, "Điện thoại"],
                    ["desktop", Monitor, "Máy tính"],
                  ] as const
                ).map(([key, Icon, label]) => (
                  <button
                    key={key}
                    type="button"
                    aria-pressed={device === key}
                    aria-label={label}
                    title={label}
                    onClick={() => setDevice(key)}
                    className={`flex h-8 w-8 items-center justify-center rounded-full ${device === key ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}
                  >
                    <Icon size={15} />
                  </button>
                ))}
              </div>
            </div>
            <div className="overflow-hidden rounded-b-2xl" style={{ backgroundColor: template.backgroundColor }}>
              <iframe
                title="Xem trước email"
                srcDoc={html}
                // No scripts run in the preview; same-origin only so its height can be read
                sandbox="allow-same-origin"
                onLoad={(e) => {
                  const doc = e.currentTarget.contentDocument;
                  if (doc) setFrameHeight(doc.documentElement.scrollHeight);
                }}
                className="mx-auto block w-full border-0 transition-[max-width] duration-200"
                style={{ height: frameHeight, maxWidth: device === "mobile" ? 375 : "100%" }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
