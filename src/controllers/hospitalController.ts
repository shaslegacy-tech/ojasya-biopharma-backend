// src/controllers/hospitalController.ts
import { Request, Response } from "express";
import HospitalService from "../services/hospitalService";
import OrderService from "../services/orderService";

export const createHospital = async (req: any, res: Response) => {
  try {
    const userId = req.user?.id;
    const hospital = await HospitalService.createHospital(req.body, userId);
    res.status(201).json({ data: hospital });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const listHospitals = async (req: any, res: Response) => {
  try {
    const { q, approved } = req.query;
    const filter: any = {};
    if (q) filter.name = { $regex: String(q), $options: "i" };
    if (approved !== undefined) filter.approved = approved === "true";

    const hospitals = await HospitalService.listHospitals(filter);
    res.json({ data: hospitals });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const getHospital = async (req: any, res: Response) => {
  try {
    const h = await HospitalService.getById(req.params.id);
    if (!h) return res.status(404).json({ message: "Hospital not found" });

    if (req.user.role === "hospital" && h.userId && h.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }
    res.json({ data: h });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const updateHospital = async (req: any, res: Response) => {
  try {
    const updated = await HospitalService.updateHospital(req.params.id, req.body);
    res.json({ data: updated });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const deleteHospital = async (req: any, res: Response) => {
  try {
    await HospitalService.deleteHospital(req.params.id);
    res.json({ message: "Hospital deleted" });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const approveHospital = async (req: any, res: Response) => {
  try {
    const h = await HospitalService.approveHospital(req.params.id);
    res.json({ data: h });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const placeOrder = async (req: any, res: Response) => {
  try {
    const created = await OrderService.createOrder(req.user.id, req.body);
    res.status(201).json({ data: created });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const getOrders = async (req: any, res: Response) => {
  try {
    const orders = await OrderService.getOrdersByCustomer(req.user.id);
    res.json({ data: orders });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};