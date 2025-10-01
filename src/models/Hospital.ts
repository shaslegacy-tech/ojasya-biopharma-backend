// backend/models/Hospital.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IHospital extends Document {
  userId?: mongoose.Types.ObjectId; // optional link to User account
  name: string;
  email: string;
  phone?: string;
  contactPerson?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  dlNumber?: string;   // drug license number
  gstNumber?: string;
  approved?: boolean;
}

const HospitalSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User' }, // optional
    name: { type: String, required: true },
    email: { type: String, required: true, index: true },
    phone: { type: String },
    contactPerson: { type: String },
    address: { type: String },
    city: { type: String },
    state: { type: String },
    zip: { type: String },
    country: { type: String },
    dlNumber: { type: String },
    gstNumber: { type: String },
    approved: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model<IHospital>('Hospital', HospitalSchema);
