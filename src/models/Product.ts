// src/models/Product.ts
import { Schema, model, Document } from "mongoose";
import { toJSONPlugin } from "./plugins/mongoose-plugins";

export interface IProduct extends Document {
  name: string;
  genericName?: string;
  category?: string;
  description?: string;
  brand?: string;
  manufacturer?: string;
  strength?: string;
  packSize?: string;
  sku?: string;
  hsnCode?: string;
  regulatoryTag?: string; // Rx / OTC
  mrp?: number;
  tradePrice?: number;
  unit?: string;
  images?: string[];
  createdBy: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true },
    genericName: { type: String, trim: true },
    category: { type: String, index: true },
    description: String,
    brand: String,
    manufacturer: String,
    strength: String,
    packSize: String,
    sku: { type: String, index: true, sparse: true },
    hsnCode: String,
    regulatoryTag: String,
    mrp: Number,
    tradePrice: Number,
    unit: String,
    images: [String],
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

// full-text index for search
ProductSchema.index({ name: "text", genericName: "text", brand: "text", description: "text" });

// plugin
ProductSchema.plugin(toJSONPlugin);

export default model<IProduct>("Product", ProductSchema);