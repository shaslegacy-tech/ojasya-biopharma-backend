// src/models/Notification.ts
import { Schema, model, Document } from "mongoose";
import { toJSONPlugin } from "./plugins/mongoose-plugins";

export interface INotification extends Document {
  user: Schema.Types.ObjectId;
  message: string;
  meta?: any;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    message: { type: String, required: true },
    meta: Schema.Types.Mixed,
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

NotificationSchema.plugin(toJSONPlugin);

export default model<INotification>("Notification", NotificationSchema);