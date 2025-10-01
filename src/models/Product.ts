import { Schema, model, Document } from "mongoose";

export interface IProduct extends Document {
  name: string;
  category: string;
  description?: string;
  brand?: string;
  price: number;
  unit: string; // e.g. tablet, box, bottle
  images?: string[];
  createdBy: Schema.Types.ObjectId; // Supplier or Admin
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true },
    category: { type: String, required: true },
    description: String,
    brand: String,
    price: { type: Number, required: true },
    unit: { type: String, required: true },
    images: [String],
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export default model<IProduct>("Product", productSchema);
