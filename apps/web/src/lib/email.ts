import { Resend } from "resend";
import { formatVND } from "@saltandlight/domain";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FROM = process.env.RESEND_FROM_EMAIL ?? "Salt & Light <no-reply@saltandlight.com.vn>";

export async function sendOrderCreatedEmail(opts: {
  orderNumber: string;
  customerEmail: string | null;
  total: number;
}) {
  if (!resend) return; // email not configured in this environment (e.g. local dev)

  const recipients = [opts.customerEmail, process.env.NOTIFY_ADMIN_EMAIL].filter(
    (v): v is string => !!v,
  );
  if (recipients.length === 0) return;

  await resend.emails.send({
    from: FROM,
    to: recipients,
    subject: `Đơn hàng ${opts.orderNumber} đã được ghi nhận`,
    html: `<p>Cảm ơn bạn đã đặt hàng tại Salt &amp; Light.</p>
           <p>Mã đơn hàng: <strong>${opts.orderNumber}</strong></p>
           <p>Tổng tiền: <strong>${formatVND(opts.total)}</strong></p>
           <p>Vui lòng chuyển khoản theo hướng dẫn trên trang xác nhận đơn hàng. Chúng mình sẽ xác nhận và xử lý đơn ngay khi nhận được thanh toán.</p>`,
  });
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
