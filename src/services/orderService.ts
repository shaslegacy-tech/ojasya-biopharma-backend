// backend/services/orderService.ts
import Order from '../models/Order';
import CommissionService from './commissionService';

class OrderService {
  static async createOrder(hospitalId: string, { supplierId, products, totalPrice, prescriptionFileUrl }: any) {
    const order = await Order.create({ hospitalId, supplierId, products, totalPrice, prescriptionFileUrl });
    await CommissionService.calculateCommission(String(order._id));
    return order;
  }

  static async getOrdersByHospital(hospitalId: string) {
    return Order.find({ hospitalId }).populate('products.productId').populate('supplierId');
  }

  static async getOrdersBySupplier(supplierId: string) {
    return Order.find({ supplierId }).populate('products.productId').populate('hospitalId');
  }

  static async updateOrderStatus(orderId: string, status: 'pending' | 'accepted' | 'delivered') {
    const order = await Order.findById(orderId);
    if(!order) throw new Error('Order not found');
    order.status = status;
    await order.save();
    return order;
  }
}

export default OrderService;