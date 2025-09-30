// backend/models/Inventory.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IInventory extends Document {
  productId: mongoose.Types.ObjectId;
  supplierId: mongoose.Types.ObjectId;
  stock: number;
  price: number;
}

const InventorySchema: Schema = new Schema({
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  supplierId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  stock: { type: Number, default: 0 },
  price: { type: Number, required: true }
}, { timestamps: true });

export default mongoose.model<IInventory>('Inventory', InventorySchema);