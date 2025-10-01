// backend/models/Inventory.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IInventory extends Document {
  productId: mongoose.Types.ObjectId;
  supplierId: mongoose.Types.ObjectId;
  hospitalId?: mongoose.Types.ObjectId; // optional if hospitals track stock
  stock: number;
  price: number;
  threshold: number; // for low stock alerts
}

const InventorySchema: Schema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    supplierId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    hospitalId: { type: Schema.Types.ObjectId, ref: "User" }, // hospital role
    stock: { type: Number, default: 0 },
    price: { type: Number, required: true },
    threshold: { type: Number, default: 10 },
  },
  { timestamps: true }
);

export default mongoose.model<IInventory>("Inventory", InventorySchema);
