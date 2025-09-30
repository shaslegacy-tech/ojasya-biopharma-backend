// backend/services/commissionService.ts
import Commission from '../models/Commission';
import Order from '../models/Order';

class CommissionService {
  static async calculateCommission(orderId: string) {
    const order = await Order.findById(orderId);
    if(!order) throw new Error('Order not found');
    const commissionAmount = order.totalPrice * 0.15; // 15% commission
    await Commission.create({
      orderId: order._id,
      hospitalId: order.hospitalId,
      supplierId: order.supplierId,
      commissionAmount,
      paid: false
    });
  }

  static async getCommissionsBySupplier(supplierId: string) {
    return Commission.find({ supplierId }).populate('orderId');
  }

  static async getCommissionsByAdmin() {
    return Commission.find().populate('orderId');
  }
}

export default CommissionService;