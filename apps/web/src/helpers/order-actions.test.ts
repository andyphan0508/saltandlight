import { test } from "node:test";
import assert from "node:assert/strict";
import { orderActionsFor, stockDirection } from "./order-actions";

test("a new order with a pending transfer is confirmed through the payment route", () => {
  const [primary] = orderActionsFor("pending_payment", true);
  assert.equal(primary!.via, "payment");
  assert.equal(primary!.to, "processing");
  // No transfer to confirm → plain status change instead of a 404 on the payment route
  assert.equal(orderActionsFor("pending_payment", false)[0]!.via, "status");
});

test("destructive actions always ask first, and finished orders offer nothing", () => {
  for (const status of ["pending_payment", "processing", "on_hold", "completed"]) {
    for (const action of orderActionsFor(status, true)) {
      if (action.tone === "danger") assert.equal(action.needsConfirm, true, `${status} → ${action.to}`);
    }
  }
  assert.deepEqual(orderActionsFor("cancelled", true), []);
  assert.deepEqual(orderActionsFor("refunded", true), []);
});

test("cancelling restocks, reviving a cancelled order takes stock again, a refund does neither", () => {
  assert.equal(stockDirection("pending_payment", "cancelled"), 1);
  assert.equal(stockDirection("processing", "cancelled"), 1);
  assert.equal(stockDirection("cancelled", "processing"), -1);
  assert.equal(stockDirection("completed", "refunded"), 0);
  assert.equal(stockDirection("processing", "completed"), 0);
  // Re-saving the same status must never double-restock
  assert.equal(stockDirection("cancelled", "cancelled"), 0);
});

test("a COD order skips waiting for payment; a transfer order waits for it", async () => {
  const { initialOrderStatus, createOrderSchema } = await import("@saltandlight/domain");
  assert.equal(initialOrderStatus("cod"), "processing");
  assert.equal(initialOrderStatus("bank_transfer"), "pending_payment");
  // Older clients that never send a method keep getting bank transfer
  const base = {
    customer: { fullName: "Nguyen Van A", phone: "0912345678" },
    shippingAddress: { recipientName: "Nguyen Van A", phone: "0912345678", province: "x", provinceCode: 0, ward: "y", wardCode: 0, streetAddress: "123 abc" },
    items: [{ productVariantId: "00000000-0000-4000-8000-000000000000", quantity: 1 }],
  };
  const parsed = createOrderSchema.safeParse(base);
  const method = parsed.success ? parsed.data.paymentMethod : (createOrderSchema as any).shape.paymentMethod.parse(undefined);
  assert.equal(method, "bank_transfer");
  assert.equal((createOrderSchema as any).shape.paymentMethod.safeParse("momo").success, false);
});
