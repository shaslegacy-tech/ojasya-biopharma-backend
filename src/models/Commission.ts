// src/models/Commission.ts
import { Schema, model, Document } from "mongoose";
import { toJSONPlugin } from "./plugins/mongoose-plugins";

export interface ICommission extends Document {
  order: Schema.Types.ObjectId;
  hospital: Schema.Types.ObjectId;
  supplier: Schema.Types.ObjectId;
  commissionAmount: number;
  paid: boolean;
  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const CommissionSchema = new Schema<ICommission>(
  {
    order: { type: Schema.Types.ObjectId, ref: "Order", required: true },
    hospital: { type: Schema.Types.ObjectId, ref: "User", required: true },
    supplier: { type: Schema.Types.ObjectId, ref: "User", required: true },
    commissionAmount: { type: Number, required: true },
    paid: { type: Boolean, default: false },
    paidAt: Date,
  },
  { timestamps: true }
);

CommissionSchema.plugin(toJSONPlugin);

export default model<ICommission>("Commission", CommissionSchema);