// src/models/Inventory.ts
import mongoose, { Schema, Document } from "mongoose";
import { toJSONPlugin } from "./plugins/mongoose-plugins";

export interface IInventory extends Document {
  product: mongoose.Types.ObjectId;
  supplier: mongoose.Types.ObjectId;
  warehouse?: string;
  batchNo?: string;
  manufactureDate?: Date;
  expiryDate?: Date;
  availableQty: number;
  reservedQty: number;
  costPrice?: number;
  threshold?: number;
  lastUpdated?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const InventorySchema = new Schema<IInventory>(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true, index: true },
    supplier: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    warehouse: String,
    batchNo: String,
    manufactureDate: Date,
    expiryDate: Date,
    availableQty: { type: Number, default: 0 },
    reservedQty: { type: Number, default: 0 },
    costPrice: Number,
    threshold: { type: Number, default: 10 },
    lastUpdated: { type: Date, default: () => new Date() },
  },
  { timestamps: true }
);

// indexes for FEFO selection
InventorySchema.index({ product: 1, expiryDate: 1, availableQty: -1 });

// plugin
InventorySchema.plugin(toJSONPlugin);

/**
 * Reserve quantity atomically (simple example).
 * In production consider using transaction or findOneAndUpdate with $inc and check.
 */
InventorySchema.statics.reserve = async function (inventoryId: string, qty: number) {
  const res = await this.findOneAndUpdate(
    { _id: inventoryId, availableQty: { $gte: qty } },
    { $inc: { availableQty: -qty, reservedQty: qty }, $set: { lastUpdated: new Date() } },
    { new: true }
  );
  return res;
};

export default mongoose.model<IInventory>("Inventory", InventorySchema);