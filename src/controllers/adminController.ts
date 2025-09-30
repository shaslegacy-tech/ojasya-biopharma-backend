// backend/controllers/adminController.ts
import { Request, Response } from 'express';
import User from '../models/User';
import OrderService from '../services/orderService';
import CommissionService from '../services/commissionService';

export const getHospitals = async (req: any, res: Response) => {
  try {
    const hospitals = await User.find({ role: 'hospital' });
    res.json(hospitals);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const getSuppliers = async (req: any, res: Response) => {
  try {
    const suppliers = await User.find({ role: 'supplier' });
    res.json(suppliers);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const approveSupplier = async (req: any, res: Response) => {
  try {
    const supplier = await User.findById(req.params.id);
    if(!supplier) throw new Error('Supplier not found');
    supplier.approved = true;
    await supplier.save();
    res.json({ message: 'Supplier approved', supplier });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const getAllOrders = async (req: any, res: Response) => {
  try {
    const orders = await OrderService.getOrdersBySupplier(''); // empty to get all?
    console.log("Orders fetched:", orders);
    res.json(orders);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const getCommissions = async (req: any, res: Response) => {
  try {
    const commissions = await CommissionService.getCommissionsByAdmin();
    res.json(commissions);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};