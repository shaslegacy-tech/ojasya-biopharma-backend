// src/controllers/adminController.ts
import { Request, Response } from "express";
import User from "../models/User";
import Order from "../models/Order";
import CommissionService from "../services/commissionService";

export const getHospitals = async (_req: Request, res: Response) => {
  try {
    const hospitals = await User.find({ role: "hospital" });
    res.json({ data: hospitals });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const getSuppliers = async (_req: Request, res: Response) => {
  try {
    const suppliers = await User.find({ role: "supplier" });
    res.json({ data: suppliers });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const approveSupplier = async (req: Request, res: Response) => {
  try {
    const supplier = await User.findById(req.params.id);
    if (!supplier) return res.status(404).json({ message: "Supplier not found" });
    supplier.approved = true;
    await supplier.save();
    res.json({ data: supplier });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const getAllOrders = async (_req: Request, res: Response) => {
  try {
    const orders = await Order.find().populate("items.product").populate("customer").populate("assignedSupplier");
    res.json({ data: orders });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const getCommissions = async (_req: Request, res: Response) => {
  try {
    const commissions = await CommissionService.getCommissionsByAdmin();
    res.json({ data: commissions });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};