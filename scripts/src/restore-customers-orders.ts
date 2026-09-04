/**
 * Script to restore all 141 WooCommerce orders and customer accounts from live WooCommerce REST API
 */
import { prisma } from "@saltandlight/db";

const WC_BASE_URL = "https://saltandlight.com.vn";
const WC_KEY = "ck_8a732a35625f463cfbfd4bbb72b10ca62e1fbb46";
const WC_SECRET = "cs_837b3cd1a4a3f225154a5156d342d26f6ae7de3c";
const AUTH_TOKEN = Buffer.from(`${WC_KEY}:${WC_SECRET}`).toString("base64");

interface WcLineItem {
  id: number;
  name: string;
  product_id: number;
  variation_id: number;
  quantity: number;
  subtotal: string;
  total: string;
  price: number;
  sku: string;
  meta_data: { key: string; value: any }[];
}

interface WcOrder {
  id: number;
  number: string;
  status: string;
  date_created: string;
  billing: {
    first_name: string;
    last_name: string;
    phone: string;
    email: string;
    address_1: string;
    city: string;
    state: string;
  };
  shipping: {
    first_name: string;
    last_name: string;
    phone?: string;
    address_1: string;
    city: string;
    state: string;
  };
  payment_method: string;
  line_items: WcLineItem[];
  shipping_total: string;
  total: string;
  customer_note: string;
}

const WC_STATUS_MAP: Record<string, "pending_payment" | "processing" | "on_hold" | "completed" | "cancelled" | "refunded"> = {
  pending: "pending_payment",
  processing: "processing",
  "on-hold": "on_hold",
  completed: "completed",
  cancelled: "cancelled",
  refunded: "refunded",
  failed: "cancelled",
};

async function fetchAllWcOrders(): Promise<WcOrder[]> {
  console.log("Fetching all orders from WooCommerce REST API...");
  const perPage = 50;
  let page = 1;
  const allOrders: WcOrder[] = [];

  while (true) {
    const res = await fetch(`${WC_BASE_URL}/wp-json/wc/v3/orders?per_page=${perPage}&page=${page}`, {
      headers: { Authorization: `Basic ${AUTH_TOKEN}` },
    });

    if (!res.ok) {
      throw new Error(`WooCommerce API returned ${res.status}: ${await res.text()}`);
    }

    const batch: WcOrder[] = await res.json();
    allOrders.push(...batch);
    console.log(`  Fetched page ${page}: ${batch.length} orders`);
    if (batch.length < perPage) break;
    page++;
  }

  console.log(`Total orders retrieved: ${allOrders.length}`);
  return allOrders;
}

export async function restoreCustomersAndOrders() {
  const wcOrders = await fetchAllWcOrders();

  // Load products to map productId if matched
  const existingProducts = await prisma.product.findMany({
    select: { id: true, name: true, slug: true },
  });
  const productMap = new Map<string, string>();
  for (const p of existingProducts) {
    productMap.set(p.name.toLowerCase().trim(), p.id);
  }

  // Customer cache by phone or email to deduplicate repeat customers
  const customerCache = new Map<string, any>();

  let createdCustomers = 0;
  let createdOrders = 0;
  let skippedOrders = 0;

  for (const wc of wcOrders) {
    try {
      const orderNumber = `SL-WC-${wc.number}`;
      const existingOrder = await prisma.order.findUnique({
        where: { orderNumber },
      });

      if (existingOrder) {
        skippedOrders++;
        continue;
      }

      const billingName = `${wc.billing.first_name || ""} ${wc.billing.last_name || ""}`.trim();
      const shippingName = `${wc.shipping.first_name || ""} ${wc.shipping.last_name || ""}`.trim();
      const fullName = billingName || shippingName || "Khách hàng Salt & Light";
      const phone = (wc.billing.phone || wc.shipping.phone || "").trim() || "0000000000";
      const email = (wc.billing.email || "").trim() || null;
      const orderDate = new Date(wc.date_created);

      const customerKey = phone !== "0000000000" ? `phone:${phone}` : email ? `email:${email}` : `name:${fullName}`;

      let customer = customerCache.get(customerKey);
      if (!customer) {
        // Try finding existing customer in DB
        customer = await prisma.customer.findFirst({
          where: {
            OR: [
              ...(phone !== "0000000000" ? [{ phone }] : []),
              ...(email ? [{ email }] : []),
            ],
          },
        });

        if (!customer) {
          customer = await prisma.customer.create({
            data: {
              fullName,
              phone,
              email,
              isGuest: true,
              createdAt: orderDate,
            },
          });
          createdCustomers++;
        }
        customerCache.set(customerKey, customer);
      }

      // Customer address
      const streetAddress = wc.shipping.address_1 || wc.billing.address_1 || "Chưa cập nhật địa chỉ";
      const province = wc.shipping.state || wc.shipping.city || wc.billing.city || wc.billing.state || "Việt Nam";

      const address = await prisma.customerAddress.create({
        data: {
          customerId: customer.id,
          recipientName: shippingName || fullName,
          phone: wc.shipping.phone || phone,
          province,
          district: "",
          ward: "",
          streetAddress,
          isDefault: true,
        },
      });

      const status = WC_STATUS_MAP[wc.status] ?? "on_hold";
      const shippingFee = Number(wc.shipping_total || 0);
      const total = Number(wc.total || 0);
      const subtotal = total - shippingFee;

      const codeNote =
        wc.payment_method && wc.payment_method !== "bacs"
          ? `[WooCommerce] Phương thức: ${wc.payment_method}`
          : null;

      const fullNote = [wc.customer_note, codeNote].filter(Boolean).join(" | ") || null;

      await prisma.order.create({
        data: {
          orderNumber,
          customerId: customer.id,
          status,
          subtotal,
          shippingFee,
          total,
          shippingAddressId: address.id,
          note: fullNote,
          createdAt: orderDate,
          items: {
            create: wc.line_items.map((li) => {
              const matchedProductId = productMap.get(li.name.toLowerCase().trim()) || null;
              const color = li.meta_data?.find((m) => /color|màu/i.test(m.key))?.value ?? null;
              const size = li.meta_data?.find((m) => /size|kích/i.test(m.key))?.value ?? null;
              const unitPrice = li.quantity > 0 ? Number(li.price || 0) : Number(li.total || 0);

              return {
                productId: matchedProductId,
                productNameSnapshot: li.name,
                color: typeof color === "string" ? color : null,
                size: typeof size === "string" ? size : null,
                unitPrice,
                quantity: li.quantity || 1,
              };
            }),
          },
          statusHistory: {
            create: {
              fromStatus: null,
              toStatus: status,
              note: "Đồng bộ lịch sử từ WooCommerce",
              changedAt: orderDate,
            },
          },
          payments: {
            create: {
              method: "bank_transfer",
              amount: total,
              status: status === "pending_payment" ? "awaiting_confirmation" : "confirmed",
              createdAt: orderDate,
            },
          },
        },
      });

      createdOrders++;
    } catch (err) {
      console.error(`Error migrating order #${wc.number}:`, err);
    }
  }

  console.log(`\n===========================================`);
  console.log(`✓ Restoration complete!`);
  console.log(`  - New Customers Created: ${createdCustomers}`);
  console.log(`  - Orders Restored: ${createdOrders}`);
  console.log(`  - Orders Skipped (already exist): ${skippedOrders}`);
  console.log(`===========================================\n`);
}

if (require.main === module) {
  restoreCustomersAndOrders()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
