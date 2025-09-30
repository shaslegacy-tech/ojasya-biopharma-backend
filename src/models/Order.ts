// backend/models/Order.ts
import mongoose, { Schema, Document } from 'mongoose';

interface IOrderProduct {
  productId: mongoose.Types.ObjectId;
  quantity: number;
  price: number;
}

export interface IOrder extends Document {
  hospitalId: mongoose.Types.ObjectId;
  supplierId: mongoose.Types.ObjectId;
  products: IOrderProduct[];
  status: 'pending' | 'accepted' | 'delivered';
  totalPrice: number;
  prescriptionFileUrl?: string;
}

const OrderSchema: Schema = new Schema({
  hospitalId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  supplierId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  products: [{ productId: { type: Schema.Types.ObjectId, ref: 'Product' }, quantity: Number, price: Number }],
  status: { type: String, enum: ['pending','accepted','delivered'], default: 'pending' },
  totalPrice: { type: Number, required: true },
  prescriptionFileUrl: { type: String }
}, { timestamps: true });

export default mongoose.model<IOrder>('Order', OrderSchema);