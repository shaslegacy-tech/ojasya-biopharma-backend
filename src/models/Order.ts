// src/models/Order.ts
import { Schema, model, Document } from "mongoose";
import { toJSONPlugin } from "./plugins/mongoose-plugins";
import { OrderStatuses, PaymentStatuses } from "./enums";

export interface IOrderItem {
  product: Schema.Types.ObjectId;
  qty: number;
  price?: number;
  batchNo?: string | null;
}

export interface IOrder extends Document {
  orderNo?: string;
  customer: Schema.Types.ObjectId; // hospital or pharmacy
  placedBy: Schema.Types.ObjectId; // MR or user
  source?: string;
  items: IOrderItem[];
  assignedSupplier?: Schema.Types.ObjectId | null;
  status: string;
  totalAmount: number;
  paymentStatus: string;
  shipping?: {
    courier?: string;
    trackingNo?: string;
  };
  prescriptionFileUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>({
  product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  qty: { type: Number, required: true },
  price: Number,
  batchNo: String,
});

const OrderSchema = new Schema<IOrder>(
  {
    orderNo: { type: String, index: true, unique: true, sparse: true },
    customer: { type: Schema.Types.ObjectId, ref: "User", required: true },
    placedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    source: String,
    items: [OrderItemSchema],
    assignedSupplier: { type: Schema.Types.ObjectId, ref: "User", default: null },
    status: { type: String, enum: OrderStatuses as unknown as string[], default: "PLACED" },
    totalAmount: { type: Number, default: 0 },
    paymentStatus: { type: String, enum: PaymentStatuses as unknown as string[], default: "UNPAID" },
    shipping: {
      courier: String,
      trackingNo: String,
    },
    prescriptionFileUrl: String,
  },
  { timestamps: true }
);

OrderSchema.plugin(toJSONPlugin);

// auto-calc total before save if not provided
OrderSchema.pre<IOrder>("save", function (next) {
  if (this.items && this.items.length) {
    const total = this.items.reduce((acc, it) => acc + (it.price ?? 0) * (it.qty ?? 0), 0);
    this.totalAmount = total;
  }
  // generate simple orderNo if missing
  if (!this.orderNo) {
    this.orderNo = `ORD-${Date.now().toString(36).toUpperCase()}`;
  }
  next();
});

export default model<IOrder>("Order", OrderSchema);