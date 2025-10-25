// src/models/MR.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IMR extends Document {
  userId: mongoose.Types.ObjectId; // reference to User
  territories: string[]; // list of cities/areas assigned
  assignedHospitals: mongoose.Types.ObjectId[]; // hospital ids
  phone?: string;
  active: boolean;
  region?: string;
  reportsCount?: number;
  lastVisit?: Date;
  createdBy?: mongoose.Types.ObjectId; // admin reference
  createdAt: Date;
  updatedAt: Date;
}

const MRSchema = new Schema<IMR>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true, index: true },
    territories: [{ type: String }],
    assignedHospitals: [{ type: Schema.Types.ObjectId, ref: "Hospital" }],
    phone: { type: String },
    active: { type: Boolean, default: true, index: true },
    region: { type: String },
    reportsCount: { type: Number, default: 0 },
    lastVisit: { type: Date },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" }, // usually admin
  },
  { timestamps: true }
);

// Virtual for populating MR’s user details
MRSchema.virtual("user", {
  ref: "User",
  localField: "userId",
  foreignField: "_id",
  justOne: true,
});

export default mongoose.model<IMR>("MR", MRSchema);