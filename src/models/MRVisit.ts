// src/models/MRVisit.ts
import { Schema, model, Document } from "mongoose";
import { toJSONPlugin } from "./plugins/mongoose-plugins";

export interface IMRVisit extends Document {
  mr: Schema.Types.ObjectId;
  customer: Schema.Types.ObjectId;
  checkin: { lat: number; lng: number; time: Date };
  checkout?: { lat: number; lng: number; time: Date };
  notes?: string;
  ordersCreated?: Schema.Types.ObjectId[];
  samplesGiven?: string[]; // sample SKUs or notes
  createdAt: Date;
  updatedAt: Date;
}

const MRVisitSchema = new Schema<IMRVisit>(
  {
    mr: { type: Schema.Types.ObjectId, ref: "User", required: true },
    customer: { type: Schema.Types.ObjectId, ref: "User", required: true },
    checkin: { lat: Number, lng: Number, time: { type: Date, default: () => new Date() } },
    checkout: { lat: Number, lng: Number, time: Date },
    notes: String,
    ordersCreated: [{ type: Schema.Types.ObjectId, ref: "Order" }],
    samplesGiven: [String],
  },
  { timestamps: true }
);

MRVisitSchema.plugin(toJSONPlugin);

export default model<IMRVisit>("MRVisit", MRVisitSchema);