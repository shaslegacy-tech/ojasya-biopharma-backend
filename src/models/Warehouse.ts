// src/models/Warehouse.ts
import { Schema, model, Document } from "mongoose";
import { toJSONPlugin } from "./plugins/mongoose-plugins";

export interface IWarehouse extends Document {
  name: string;
  address?: string;
  city?: string;
  state?: string;
  contact?: string;
  type?: string;
  createdAt: Date;
  updatedAt: Date;
}

const WarehouseSchema = new Schema<IWarehouse>(
  {
    name: { type: String, required: true },
    address: String,
    city: String,
    state: String,
    contact: String,
    type: String,
  },
  { timestamps: true }
);

WarehouseSchema.plugin(toJSONPlugin);

export default model<IWarehouse>("Warehouse", WarehouseSchema);