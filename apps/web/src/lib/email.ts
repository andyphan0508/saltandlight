import { Resend } from "resend";
import { formatVND } from "@saltandlight/domain";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FROM = process.env.RESEND_FROM_EMAIL ?? "Salt & Light <no-reply@saltandlight.com.vn>";

export async function sendOrderCreatedEmail(opts: {
  orderId: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string | null;
  customerPhone: string;
  total: number;
}) {
  if (!resend) return; // email not configured in this environment (e.g. local dev)

  const sends: Promise<unknown>[] = [];

  if (opts.customerEmail) {
    sends.push(
      resend.emails.send({
        from: FROM,
        to: opts.customerEmail,
        subject: `Đơn hàng ${opts.orderNumber} đã được ghi nhận`,
        html: `<p>Cảm ơn bạn đã đặt hàng tại Salt &amp; Light.</p>
               <p>Mã đơn hàng: <strong>${opts.orderNumber}</strong></p>
               <p>Tổng tiền: <strong>${formatVND(opts.total)}</strong></p>
               <p>Vui lòng chuyển khoản theo hướng dẫn trên trang xác nhận đơn hàng. Chúng mình sẽ xác nhận và xử lý đơn ngay khi nhận được thanh toán.</p>`,
      }),
    );
  }

  if (process.env.NOTIFY_ADMIN_EMAIL) {
    const adminUrl = process.env.NEXT_PUBLIC_ADMIN_URL ?? "http://localhost:3000/admin";
    sends.push(
      resend.emails.send({
        from: FROM,
        to: process.env.NOTIFY_ADMIN_EMAIL,
        subject: `🔔 Đơn hàng mới ${opts.orderNumber} — cần xử lý`,
        html: `<p><strong>Có đơn hàng mới, vui lòng vào dashboard xử lý.</strong></p>
               <p>Mã đơn hàng: <strong>${opts.orderNumber}</strong></p>
               <p>Khách hàng: <strong>${opts.customerName}</strong> — ${opts.customerPhone}</p>
               <p>Tổng tiền: <strong>${formatVND(opts.total)}</strong></p>
               <p><a href="${adminUrl}/orders/${opts.orderId}">Mở đơn hàng trong Dashboard →</a></p>`,
      }),
    );
  }

  await Promise.allSettled(sends);
}

export async function sendPaymentConfirmedEmail(opts: {
  orderNumber: string;
  customerEmail: string | null;
}) {
  if (!resend || !opts.customerEmail) return;
  await resend.emails.send({
    from: FROM,
    to: opts.customerEmail,
    subject: `Đơn hàng ${opts.orderNumber} đã xác nhận thanh toán`,
    html: `<p>Chúng mình đã nhận được thanh toán cho đơn hàng <strong>${opts.orderNumber}</strong> và đang chuẩn bị giao hàng. Cảm ơn bạn!</p>`,
  });
}
