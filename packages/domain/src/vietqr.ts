export interface VietQrConfig {
  bankBin: string;
  accountNo: string;
  accountName: string;
}

/**
 * Builds a static VietQR (Napas 247) image URL via img.vietqr.io — no
 * payment-gateway integration needed, customers scan with any banking app.
 * See spec §5.
 */
export function buildVietQrUrl(
  config: VietQrConfig,
  params: { amount: number; addInfo: string },
): string {
  const url = new URL(
    `https://img.vietqr.io/image/${config.bankBin}-${config.accountNo}-compact2.png`,
  );
  url.searchParams.set("amount", String(Math.round(params.amount)));
  url.searchParams.set("addInfo", params.addInfo);
  url.searchParams.set("accountName", config.accountName);
  return url.toString();
}

/** Payment content customers must include so staff can reconcile bank statements. */
export function buildTransferContent(orderNumber: string): string {
  return orderNumber.replace(/-/g, "");
}
