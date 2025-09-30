// backend/controllers/hospitalController.ts
import { Request, Response } from 'express';
import OrderService from '../services/orderService';

export const placeOrder = async (req: any, res: Response) => {
  try {
    const order = await OrderService.createOrder(req.user._id, req.body);
    res.json(order);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const getOrders = async (req: any, res: Response) => {
  try {
    const orders = await OrderService.getOrdersByHospital(req.user._id);
    res.json(orders);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};