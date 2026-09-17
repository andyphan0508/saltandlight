import { getCachedPaymentSettings } from "@/server/queries";
import { OrderConfirmationContent, type PaymentSettingsProps } from "./components/OrderConfirmationContent";

const OrderConfirmationPage = async ({
  params,
  searchParams,
}: {
  params: { orderNumber: string };
  searchParams: { total?: string; transferContent?: string; qrUrl?: string; method?: string };
}) => {
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
      isCod={searchParams.method === "cod"}
      settings={settings}
    />
  );
};

export default OrderConfirmationPage;
