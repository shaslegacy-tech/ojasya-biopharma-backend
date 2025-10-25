// src/models/enums.ts
export const Roles = ["admin", "mr", "supplier", "hospital", "pharmacy"] as const;
export type Role = typeof Roles[number];

export const OrderStatuses = [
  "DRAFT",
  "PLACED",
  "ACCEPTED",
  "PICKED",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "RETURNED",
  "FAILED",
] as const;
export type OrderStatus = typeof OrderStatuses[number];

export const PaymentStatuses = ["UNPAID", "PAID", "REFUNDED"] as const;
export type PaymentStatus = typeof PaymentStatuses[number];