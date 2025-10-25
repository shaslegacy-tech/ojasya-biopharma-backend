// src/services/notificationService.ts
import Notification from "../models/Notification";
import { Types } from "mongoose";
import { toObjectId } from "../utils/oObjectId";

const NotificationService = {
  async createNotification(userId: string, message: string, meta?: any) {
    const n = await Notification.create({
      user: new Types.ObjectId(userId),
      message,
      meta,
    });
    return n;
  },

  async getNotifications(userId: string) {
    return Notification.find({ user: toObjectId(userId) }).sort({ createdAt: -1 });
  },

  async markAsRead(notificationId: string) {
    return Notification.findByIdAndUpdate(notificationId, { read: true }, { new: true });
  },
};

export default NotificationService;