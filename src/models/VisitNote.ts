// src/models/VisitNote.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IVisitNote extends Document {
  mr: mongoose.Types.ObjectId;
  hospital: mongoose.Types.ObjectId;
  subject?: string;
  notes: string;
  createdAt: Date;
  synced?: boolean;
}

const VisitNoteSchema: Schema = new Schema({
  mr: { type: Schema.Types.ObjectId, ref: "User", required: true },
  hospital: { type: Schema.Types.ObjectId, ref: "Hospital", required: true },
  subject: { type: String },
  notes: { type: String, required: true },
  synced: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model<IVisitNote>("VisitNote", VisitNoteSchema);