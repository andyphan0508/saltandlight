import { z } from "zod";
import { isValidLocation } from "./vn-locations";

export const cartItemSchema = z.object({
  productVariantId: z.string().uuid(),
  quantity: z.number().int().min(1).max(20),
});

export const cartQuoteSchema = z.object({
  items: z.array(cartItemSchema).min(1),
  /** Vietnam province code (vn-locations.ts) the customer selected — used to price shipping by region. */
  provinceCode: z.number().int().optional(),
});

export const shippingAddressSchema = z
  .object({
    recipientName: z.string().min(2).max(120),
    phone: z
      .string()
      .regex(/^(0|\+84)[0-9]{9,10}$/, "Số điện thoại không hợp lệ"),
    province: z.string().min(1),
    provinceCode: z.number().int(),
    ward: z.string().min(1),
    wardCode: z.number().int(),
    // 2025 reform removed the district tier — kept optional only so
    // legacy code paths that still read it don't need a null-check.
    district: z.string().optional(),
    streetAddress: z.string().min(3).max(255),
  })
  .refine((data) => isValidLocation(data.provinceCode, data.wardCode), {
    message: "Tỉnh/Thành hoặc Phường/Xã không hợp lệ",
    path: ["wardCode"],
  });

export const createOrderSchema = z.object({
  customer: z.object({
    fullName: z.string().min(2).max(120),
    phone: z
      .string()
      .regex(/^(0|\+84)[0-9]{9,10}$/, "Số điện thoại không hợp lệ"),
    email: z.string().email().optional().or(z.literal("")),
  }),
  shippingAddress: shippingAddressSchema,
  items: z.array(cartItemSchema).min(1),
  note: z.string().max(500).optional(),
});
export type CreateOrderInput = z.infer<typeof createOrderSchema>;

export const trackOrderSchema = z.object({
  orderNumber: z.string().min(4),
  phone: z.string().min(9),
});

export const contactFormSchema = z.object({
  type: z.enum(["contact", "custom_order"]).default("contact"),
  fullName: z.string().min(2).max(120),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  message: z.string().min(5).max(2000),
  turnstileToken: z.string().min(1, "Vui lòng xác minh bạn không phải robot"),
});
export type ContactFormInput = z.infer<typeof contactFormSchema>;
