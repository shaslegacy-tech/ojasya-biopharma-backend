// src/models/Stock.ts
import { Schema, model, Document } from "mongoose";
import { toJSONPlugin } from "./plugins/mongoose-plugins";

export interface IStock extends Document {
  product: Schema.Types.ObjectId;
  hospital: Schema.Types.ObjectId;
  supplier: Schema.Types.ObjectId;
  quantity: number;
  threshold: number;
  createdAt: Date;
  updatedAt: Date;
}

const StockSchema = new Schema<IStock>(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    hospital: { type: Schema.Types.ObjectId, ref: "User", required: true },
    supplier: { type: Schema.Types.ObjectId, ref: "User", required: true },
    quantity: { type: Number, default: 0 },
    threshold: { type: Number, default: 10 },
  },
  { timestamps: true }
);

StockSchema.plugin(toJSONPlugin);

export default model<IStock>("Stock", StockSchema);