import { Resend } from "resend";
import { formatVND, PAYMENT_METHOD_LABELS, type PaymentMethodValue } from "@saltandlight/domain";
import { renderOrderEmail, type OrderEmailData, type OrderEmailTemplate } from "@/helpers/order-email";
import { getEmailLogoUrl, getOrderEmailTemplate } from "@/server/email-template";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

const FROM = process.env.RESEND_FROM_EMAIL ?? "Salt & Light <no-reply@saltandlight.com.vn>";

/** Sends the customer's email from the admin-designed template. */
const sendCustomerOrderEmail = async (to: string, order: OrderEmailData, siteUrl: string, template?: OrderEmailTemplate) => {
  if (!resend) throw new Error("Chưa cấu hình RESEND_API_KEY");
  const { subject, html } = renderOrderEmail({
    template: template ?? (await getOrderEmailTemplate()),
    order,
    siteUrl,
    logoUrl: await getEmailLogoUrl(siteUrl),
  });
  const { error } = await resend.emails.send({ from: FROM, to, subject, html });
  if (error) throw new Error(error.message);
};

/**
 * After an order is placed: the customer's email (when they gave one) and the
 * shop's heads-up. `siteUrl` is the origin the order came in on, so every link
 * points at the live site rather than a configured URL that may be stale.
 */
export const sendOrderCreatedEmail = async (opts: {
  orderId: string;
  customerEmail: string | null;
  customerPhone: string;
  paymentMethod: PaymentMethodValue;
  order: OrderEmailData;
  siteUrl: string;
}) => {
  if (!resend) return; // email not configured in this environment (e.g. local dev)

  const sends: Promise<unknown>[] = [];

  if (opts.customerEmail) sends.push(sendCustomerOrderEmail(opts.customerEmail, opts.order, opts.siteUrl));

  if (process.env.NOTIFY_ADMIN_EMAIL) {
    sends.push(
      resend.emails.send({
        from: FROM,
        to: process.env.NOTIFY_ADMIN_EMAIL,
        subject: `🔔 Đơn hàng mới ${opts.order.orderNumber} — cần xử lý`,
        html: `<p><strong>Có đơn hàng mới, vui lòng vào dashboard xử lý.</strong></p>
               <p>Mã đơn hàng: <strong>${escapeHtml(opts.order.orderNumber)}</strong></p>
               <p>Khách hàng: <strong>${escapeHtml(opts.order.customerName)}</strong> — ${escapeHtml(opts.customerPhone)}</p>
               <p>Tổng tiền: <strong>${formatVND(opts.order.total)}</strong> · ${PAYMENT_METHOD_LABELS[opts.paymentMethod]}</p>
               <p><a href="${opts.siteUrl}/admin/orders/${opts.orderId}">Mở đơn hàng trong Dashboard →</a></p>`,
      }),
    );
  }

  const results = await Promise.allSettled(sends);
  for (const r of results) if (r.status === "rejected") console.error("[email] order email failed:", r.reason);
};

/** Admin › Mẫu email › "Gửi thử": the unsaved template, filled with a sample order. */
export const sendTestOrderEmail = (to: string, template: OrderEmailTemplate, order: OrderEmailData, siteUrl: string) =>
  sendCustomerOrderEmail(to, order, siteUrl, template);
