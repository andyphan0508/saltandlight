-- Checkout offers cash on delivery alongside bank transfer.
ALTER TYPE "PaymentMethod" ADD VALUE IF NOT EXISTS 'cod';
