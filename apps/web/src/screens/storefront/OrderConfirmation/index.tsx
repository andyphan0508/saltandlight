import { PAYMENT_METHODS } from "@saltandlight/domain";
import { getCachedTransferInfo } from "@/server/queries";
import { OrderConfirmationContent } from "./components/OrderConfirmationContent";

const OrderConfirmationPage = async ({
  params,
  searchParams,
}: {
  params: { orderNumber: string };
  searchParams: { method?: string; total?: string };
}) => {
  const method = PAYMENT_METHODS.find((m) => m === searchParams.method) ?? null;
  // The QR / transfer details only belong on the bank-transfer screen
  const transfer =
    method === "bank_transfer"
      ? await getCachedTransferInfo().catch((err) => {
          console.error("[don-hang] transfer info unavailable:", err);
          return null;
        })
      : null;

  return (
    <OrderConfirmationContent
      orderNumber={params.orderNumber}
      method={method}
      total={Number(searchParams.total) || 0}
      transfer={transfer}
    />
  );
};

export default OrderConfirmationPage;
