import { getCachedPaymentSettings } from "@/lib/queries";
import { OrderConfirmationContent, type PaymentSettingsProps } from "./OrderConfirmationContent";

export default async function OrderConfirmationPage({
  params,
  searchParams,
}: {
  params: { orderNumber: string };
  searchParams: { total?: string; transferContent?: string; qrUrl?: string };
}) {
  let settings: PaymentSettingsProps | null = null;
  try {
    settings = await getCachedPaymentSettings();
  } catch (err) {
    console.error("OrderConfirmationPage settings fetch error:", err);
  }

  return (
    <OrderConfirmationContent
      orderNumber={params.orderNumber}
      total={Number(searchParams.total ?? 0)}
      transferContent={searchParams.transferContent ?? params.orderNumber}
      qrUrl={searchParams.qrUrl ?? null}
      settings={settings}
    />
  );
}
