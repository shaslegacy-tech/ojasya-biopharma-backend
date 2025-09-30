// backend/models/Commission.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface ICommission extends Document {
  orderId: mongoose.Types.ObjectId;
  hospitalId: mongoose.Types.ObjectId;
  supplierId: mongoose.Types.ObjectId;
  commissionAmount: number;
  paid: boolean;
}

const CommissionSchema: Schema = new Schema({
  orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
  hospitalId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  supplierId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  commissionAmount: { type: Number, required: true },
  paid: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model<ICommission>('Commission', CommissionSchema);