import { formatVND } from "@saltandlight/domain";

/** The editable part of the order email; the order table is always filled in by code. */
export interface OrderEmailTemplate {
  subject: string;
  title: string;
  description: string;
  content: string;
  buttonLabel: string;
  /** Storefront path the button opens, e.g. "/tra-cuu-don-hang?order={mã đơn}". */
  buttonPath: string;
  accentColor: string;
  backgroundColor: string;
}

export interface OrderEmailData {
  orderNumber: string;
  customerName: string;
  items: { name: string; variant: string; quantity: number; unitPrice: number }[];
  subtotal: number;
  shippingFee: number;
  total: number;
  paymentLabel: string;
  address: string;
}

export const ORDER_EMAIL_ID = "order_created";

/** Words an admin can drop into any text field; each is replaced per order. */
export const ORDER_EMAIL_TOKENS = ["{tên khách}", "{mã đơn}", "{tổng tiền}"] as const;

export const DEFAULT_ORDER_EMAIL: OrderEmailTemplate = {
  subject: "Salt & Light đã nhận đơn {mã đơn}",
  title: "Cảm ơn {tên khách}!",
  description: "Đơn hàng {mã đơn} của bạn đã được ghi nhận.",
  content:
    "Chúng mình sẽ gọi xác nhận và chuẩn bị hàng sớm nhất có thể.\n\nBạn có thể xem trạng thái đơn bất cứ lúc nào bằng nút bên dưới, chỉ cần nhập số điện thoại đã dùng khi đặt hàng.",
  buttonLabel: "Xem trạng thái đơn hàng",
  buttonPath: "/tra-cuu-don-hang?order={mã đơn}",
  accentColor: "#133e2b",
  backgroundColor: "#f4f9f5",
};

/** Colour pairs offered in admin; any hex can still be picked by hand. */
export const ORDER_EMAIL_THEMES = [
  { name: "Xanh Salt & Light", accentColor: "#133e2b", backgroundColor: "#f4f9f5" },
  { name: "Kem ấm", accentColor: "#133e2b", backgroundColor: "#faf9f6" },
  { name: "Lá mạ", accentColor: "#1f7a55", backgroundColor: "#e6f2e8" },
  { name: "Tối giản", accentColor: "#18181b", backgroundColor: "#f4f4f5" },
  { name: "Mùa Giáng sinh", accentColor: "#b91c1c", backgroundColor: "#fef2f2" },
];

/** Storefront pages the button can open; anything else goes in as a custom path. */
export const ORDER_EMAIL_BUTTON_TARGETS = [
  { label: "Tra cứu đơn hàng (điền sẵn mã đơn)", path: "/tra-cuu-don-hang?order={mã đơn}" },
  { label: "Tài khoản khách hàng", path: "/tai-khoan" },
  { label: "Tất cả sản phẩm", path: "/san-pham" },
  { label: "Trang chủ", path: "/" },
];

export const SAMPLE_ORDER: OrderEmailData = {
  orderNumber: "SL-2026-000142",
  customerName: "Minh Anh",
  items: [
    { name: "Áo thun SHALOM trắng unisex", variant: "Trắng / M", quantity: 2, unitPrice: 189000 },
    { name: "Túi tote canvas Thi Thiên 23", variant: "Kem", quantity: 1, unitPrice: 229000 },
  ],
  subtotal: 607000,
  shippingFee: 19000,
  total: 626000,
  paymentLabel: "Chuyển khoản ngân hàng",
  address: "12 Nguyễn Trãi, Phường Bến Thành, TP. Hồ Chí Minh",
};

const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

const HEX = /^#[0-9a-f]{6}$/i;

/** White or ink text, whichever reads on this fill (WCAG relative luminance). */
export const textOn = (hex: string) => {
  const channel = (i: number) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  const luminance = 0.2126 * channel(1) + 0.7152 * channel(3) + 0.0722 * channel(5);
  return luminance > 0.4 ? "#18181b" : "#ffffff";
};

const fillTokens = (text: string, order: OrderEmailData) =>
  text
    .replaceAll("{tên khách}", order.customerName)
    .replaceAll("{mã đơn}", order.orderNumber)
    .replaceAll("{tổng tiền}", formatVND(order.total));

/** Plain text → escaped HTML paragraphs: blank line = new paragraph, single newline = line break. */
const paragraphs = (text: string, style: string) =>
  text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p style="${style}">${escapeHtml(p).replace(/\n/g, "<br>")}</p>`)
    .join("");

const FONT = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";
const INK = "#18181b";
const MUTED = "#6b7280";
const RULE = "#e5e7eb";

/**
 * The order email as HTML every mail client renders: tables, inline styles, a
 * 600px card on the chosen background, and a bulletproof (table cell) button.
 * Every piece of text is escaped here, so callers pass raw values.
 */
export const renderOrderEmail = ({
  template,
  order,
  siteUrl,
  logoUrl,
}: {
  template: OrderEmailTemplate;
  order: OrderEmailData;
  siteUrl: string;
  logoUrl: string | null;
}) => {
  const accent = HEX.test(template.accentColor) ? template.accentColor : DEFAULT_ORDER_EMAIL.accentColor;
  const background = HEX.test(template.backgroundColor) ? template.backgroundColor : DEFAULT_ORDER_EMAIL.backgroundColor;
  const text = (value: string) => escapeHtml(fillTokens(value, order));
  const path = template.buttonPath.replaceAll("{mã đơn}", encodeURIComponent(order.orderNumber));
  const buttonUrl = `${siteUrl.replace(/\/$/, "")}${path.startsWith("/") ? path : "/"}`;

  const itemRows = order.items
    .map(
      (item) => `<tr>
  <td style="padding:12px 0;border-bottom:1px solid ${RULE};">
    <div style="font-size:14px;font-weight:600;color:${INK};">${escapeHtml(item.name)}</div>
    ${item.variant ? `<div style="font-size:13px;color:${MUTED};padding-top:2px;">${escapeHtml(item.variant)}</div>` : ""}
  </td>
  <td style="padding:12px 0 12px 12px;border-bottom:1px solid ${RULE};font-size:13px;color:${MUTED};white-space:nowrap;text-align:right;" valign="top">× ${item.quantity}</td>
  <td style="padding:12px 0 12px 16px;border-bottom:1px solid ${RULE};font-size:14px;color:${INK};white-space:nowrap;text-align:right;" valign="top">${formatVND(item.unitPrice * item.quantity)}</td>
</tr>`,
    )
    .join("");

  const summaryRow = (label: string, value: string, isTotal = false) => `<tr>
  <td colspan="2" style="padding:${isTotal ? "12px" : "6px"} 0 0;font-size:${isTotal ? "15px" : "14px"};color:${isTotal ? INK : MUTED};${isTotal ? "font-weight:700;" : ""}">${label}</td>
  <td style="padding:${isTotal ? "12px" : "6px"} 0 0 16px;font-size:${isTotal ? "17px" : "14px"};color:${INK};text-align:right;white-space:nowrap;${isTotal ? "font-weight:700;" : ""}">${value}</td>
</tr>`;

  const html = `<!doctype html>
<html lang="vi">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light">
<title>${text(template.subject)}</title>
</head>
<body style="margin:0;padding:0;background:${background};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${text(template.description)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${background};">
<tr><td align="center" style="padding:32px 12px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden;font-family:${FONT};">
    <tr><td style="height:6px;background:${accent};font-size:0;line-height:0;">&nbsp;</td></tr>
    ${
      logoUrl
        ? `<tr><td align="center" style="padding:28px 32px 0;"><img src="${escapeHtml(logoUrl)}" alt="Salt &amp; Light" height="40" style="display:block;height:40px;width:auto;border:0;"></td></tr>`
        : ""
    }
    <tr><td style="padding:28px 32px 0;">
      <h1 style="margin:0;font-size:24px;line-height:1.3;font-weight:700;color:${INK};">${text(template.title)}</h1>
      <p style="margin:8px 0 0;font-size:15px;line-height:1.5;color:${MUTED};">${text(template.description)}</p>
    </td></tr>
    <tr><td style="padding:20px 32px 0;">
      ${paragraphs(fillTokens(template.content, order), `margin:0 0 14px;font-size:15px;line-height:1.65;color:${INK};`)}
    </td></tr>
    <tr><td style="padding:8px 32px 0;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
        <td style="border-radius:999px;background:${accent};">
          <a href="${escapeHtml(buttonUrl)}" target="_blank" style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:700;color:${textOn(accent)};text-decoration:none;border-radius:999px;">${text(template.buttonLabel)}</a>
        </td>
      </tr></table>
    </td></tr>
    <tr><td style="padding:32px 32px 0;">
      <div style="font-size:13px;font-weight:700;color:${MUTED};padding-bottom:4px;">Đơn hàng ${escapeHtml(order.orderNumber)}</div>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
        ${itemRows}
        ${summaryRow("Tạm tính", formatVND(order.subtotal))}
        ${summaryRow("Phí vận chuyển", order.shippingFee ? formatVND(order.shippingFee) : "Miễn phí")}
        ${summaryRow("Tổng cộng", formatVND(order.total), true)}
      </table>
    </td></tr>
    <tr><td style="padding:24px 32px 32px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f9fafb;border-radius:12px;">
        <tr><td style="padding:16px;font-size:14px;line-height:1.6;color:${INK};">
          <div><span style="color:${MUTED};">Thanh toán:</span> ${escapeHtml(order.paymentLabel)}</div>
          <div style="padding-top:4px;"><span style="color:${MUTED};">Giao tới:</span> ${escapeHtml(order.address)}</div>
        </td></tr>
      </table>
    </td></tr>
  </table>
  <p style="margin:20px 0 0;font-family:${FONT};font-size:12px;line-height:1.5;color:${MUTED};">
    Bạn nhận được email này vì đã đặt hàng tại <a href="${escapeHtml(siteUrl)}" style="color:${MUTED};">Salt &amp; Light</a>.
  </p>
</td></tr>
</table>
</body>
</html>`;

  return { subject: fillTokens(template.subject, order), html };
};
