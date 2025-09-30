// backend/models/Product.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  brand: string;
  category: string;
  stock: number;
  supplierId: mongoose.Types.ObjectId;
  price: number;
}

const ProductSchema: Schema = new Schema({
  name: { type: String, required: true },
  brand: { type: String, required: true },
  category: { type: String, required: true },
  stock: { type: Number, default: 0 },
  supplierId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  price: { type: Number, required: true }
}, { timestamps: true });

export default mongoose.model<IProduct>('Product', ProductSchema);