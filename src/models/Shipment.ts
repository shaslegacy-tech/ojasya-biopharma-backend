// src/models/Shipment.ts
import { Schema, model, Document } from "mongoose";
import { toJSONPlugin } from "./plugins/mongoose-plugins";

export interface IShipment extends Document {
  order: Schema.Types.ObjectId;
  courier?: string;
  trackingNo?: string;
  pickupAt?: Date;
  deliveredAt?: Date;
  podUrl?: string; // photo/signature
  createdAt: Date;
  updatedAt: Date;
}

const ShipmentSchema = new Schema<IShipment>(
  {
    order: { type: Schema.Types.ObjectId, ref: "Order", required: true },
    courier: String,
    trackingNo: String,
    pickupAt: Date,
    deliveredAt: Date,
    podUrl: String,
  },
  { timestamps: true }
);

ShipmentSchema.plugin(toJSONPlugin);

export default model<IShipment>("Shipment", ShipmentSchema);