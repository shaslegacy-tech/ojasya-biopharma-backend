// src/services/commissionService.ts
import Commission from "../models/Commission";
import Order from "../models/Order";
import { Types } from "mongoose";
import { toObjectId } from "../utils/oObjectId";

const CommissionService = {
  async calculateCommission(orderId: string) {
    const order = await Order.findById(orderId);
    if (!order) throw new Error("Order not found");

    // decide hospital/supplier from order fields
    const hospital = order.customer;
    const supplier = order.assignedSupplier ?? null;
    const commissionAmount = (order.totalAmount ?? 0) * 0.15;

    const doc = await Commission.create({
     order: toObjectId(order._id as any),
      hospital: toObjectId(hospital as any),
      supplier: supplier ? toObjectId(supplier as any) : undefined,
      commissionAmount,
      paid: false,
    });

    return doc;
  },

  async getCommissionsBySupplier(supplierId: string) {
    return Commission.find({ supplier: toObjectId(supplierId) }).populate("order hospital supplier");
  },

  async getCommissionsByAdmin() {
    return Commission.find().populate("order hospital supplier");
  },
};

export default CommissionService;