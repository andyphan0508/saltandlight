import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FROM = process.env.RESEND_FROM_EMAIL ?? "Salt & Light <no-reply@saltandlight.com.vn>";

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
