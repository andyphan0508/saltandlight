import { z } from "zod";

export const cartItemSchema = z.object({
  productVariantId: z.string().uuid(),
  quantity: z.number().int().min(1).max(20),
});

export const cartQuoteSchema = z.object({
  items: z.array(cartItemSchema).min(1),
});

export const shippingAddressSchema = z.object({
  recipientName: z.string().min(2).max(120),
  phone: z
    .string()
    .regex(/^(0|\+84)[0-9]{9,10}$/, "Số điện thoại không hợp lệ"),
  province: z.string().min(1),
  district: z.string().min(1),
  ward: z.string().min(1),
  streetAddress: z.string().min(3).max(255),
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
});
export type ContactFormInput = z.infer<typeof contactFormSchema>;
