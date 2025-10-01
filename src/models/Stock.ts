import { Schema, model, Document } from "mongoose";

export interface IStock extends Document {
  product: Schema.Types.ObjectId;
  hospital: Schema.Types.ObjectId;
  supplier: Schema.Types.ObjectId;
  quantity: number;
  threshold: number; // min qty before alert
  createdAt: Date;
  updatedAt: Date;
}

const stockSchema = new Schema<IStock>(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    hospital: { type: Schema.Types.ObjectId, ref: "Hospital", required: true },
    supplier: { type: Schema.Types.ObjectId, ref: "User", required: true },
    quantity: { type: Number, default: 0 },
    threshold: { type: Number, default: 10 },
  },
  { timestamps: true }
);

export default model<IStock>("Stock", stockSchema);
