// backend/services/notificationService.ts
import Notification from '../models/Notification';

class NotificationService {
  static async createNotification(userId: string, message: string) {
    const notification = await Notification.create({ userId, message });
    return notification;
  }

  static async getNotifications(userId: string) {
    return Notification.find({ userId }).sort({ createdAt: -1 });
  }

  static async markAsRead(notificationId: string) {
    const notification = await Notification.findByIdAndUpdate(notificationId, { read: true }, { new: true });
    return notification;
  }
}

export default NotificationService;