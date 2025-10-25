// src/services/orderService.ts
import { Types, startSession } from "mongoose";
import Order from "../models/Order";
import Inventory from "../models/Inventory";
import CommissionService from "./commissionService";
import { toObjectId } from "../utils/oObjectId";

type OrderItemPayload = { product: string; qty: number; price?: number; batchNo?: string };

const OrderService = {
  /**
   * Create order with inventory reservation and commission calculation.
   * @param placedBy - user id who placed the order (MR or user)
   * @param payload - { customer, items: [{product, qty, price}], assignedSupplier? }
   */
  async createOrder(placedBy: string, payload: any) {
    const session = await startSession();
    session.startTransaction();
    try {
      const items: OrderItemPayload[] = payload.items || [];
      if (items.length === 0) throw new Error("Order must contain at least one item");

      // reserve inventory for each item (simple strategy: find any inventory with enough qty)
      for (const it of items) {
        const inv = await Inventory.findOneAndUpdate(
          { product: toObjectId(it.product), availableQty: { $gte: it.qty } },
          { $inc: { availableQty: -it.qty, reservedQty: it.qty }, $set: { lastUpdated: new Date() } },
          { new: true, session }
        );
        if (!inv) {
          throw new Error(`Insufficient inventory for product ${it.product}`);
        }
      }

      // compute total
      const totalAmount =
        typeof payload.totalAmount === "number"
          ? payload.totalAmount
          : items.reduce((acc, it) => acc + (it.price ?? 0) * it.qty, 0);

      const docArr = await Order.create(
        [
          {
            customer: toObjectId(payload.customer),
            placedBy: toObjectId(placedBy),
            source: payload.source,
            items: items.map((it) => ({
              product: toObjectId(it.product),
              qty: it.qty,
              price: it.price,
            })),
            assignedSupplier: payload.assignedSupplier ? toObjectId(payload.assignedSupplier) : null,
            paymentStatus: payload.paymentStatus ?? "UNPAID",
            totalAmount,
            prescriptionFileUrl: payload.prescriptionFileUrl,
          },
        ],
        { session }
      ) as unknown as Array<typeof Order.schema["obj"] & { _id: Types.ObjectId }>;

      const orderDoc = docArr[0];

      // calculate commission (async but ensure created before commit)
      await CommissionService.calculateCommission(orderDoc._id.toString());

      await session.commitTransaction();
      session.endSession();

      return orderDoc;
    } catch (err) {
      await session.abortTransaction();
      session.endSession();
      throw err;
    }
  },

  async getOrdersBySupplier(supplierId?: string) {
    const filter: any = {};
    if (supplierId) filter.assignedSupplier = new Types.ObjectId(supplierId);
    return Order.find(filter).populate("items.product assignedSupplier customer");
  },

  async getOrdersByCustomer(customerId: string) {
    return Order.find({ customer: toObjectId(customerId) }).populate("items.product assignedSupplier");
  },

  async updateOrderStatus(orderId: string, status: string) {
    const o = await Order.findByIdAndUpdate(orderId, { status }, { new: true });
    if (!o) throw new Error("Order not found");
    return o;
  },
};

export default OrderService;