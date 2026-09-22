import { getCachedTransferInfo } from "@/server/queries";
import { OrderConfirmationContent } from "./components/OrderConfirmationContent";

const OrderConfirmationPage = async ({
  params,
  searchParams,
}: {
  params: { orderNumber: string };
  searchParams: { method?: string; total?: string };
}) => {
  const isTransfer = searchParams.method === "bank_transfer";
  const transferInfo = isTransfer
    ? await getCachedTransferInfo().catch((err) => {
        console.error("[don-hang] transfer info unavailable:", err);
        return null;
      })
    : null;

  return (
    <OrderConfirmationContent
      orderNumber={params.orderNumber}
      transfer={
        transferInfo && (transferInfo.qrImageUrl || transferInfo.transferNote)
          ? { ...transferInfo, total: Number(searchParams.total) || 0 }
          : null
      }
    />
  );
};

export default OrderConfirmationPage;
