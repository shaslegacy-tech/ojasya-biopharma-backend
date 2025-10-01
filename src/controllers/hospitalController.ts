// backend/controllers/hospitalController.ts
import { Request, Response } from 'express';
import OrderService from '../services/orderService';
import HospitalService from '../services/hospitalService';
import Hospital from '../models/Hospital';

export const createHospital = async (req: any, res: Response) => {
  try {
    // If a logged-in hospital user creates profile, link it
    const userId = req.user?.id;
    const data = req.body;
    const hospital = await HospitalService.createHospital(data, userId);
    res.status(201).json(hospital);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const listHospitals = async (req: any, res: Response) => {
  try {
    const { q, approved } = req.query;
    const filter: any = {};
    if (q) {
      filter.name = { $regex: String(q), $options: 'i' };
    }
    if (approved !== undefined) {
      filter.approved = approved === 'true';
    }
    const hospitals = await HospitalService.listHospitals(filter);
    res.json(hospitals);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const getHospital = async (req: any, res: Response) => {
  try {
    const hospital = await HospitalService.getById(req.params.id);
    if (!hospital) return res.status(404).json({ message: 'Hospital not found' });
    // Authorization: hospital owners and admins should access; suppliers maybe not
    if (req.user.role === 'hospital') {
      // allow hospital users to access only their own profile
      if (hospital.userId && hospital.userId.toString() !== req.user.id) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }
    res.json(hospital);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const updateHospital = async (req: any, res: Response) => {
  try {
    const hospital = await Hospital.findById(req.params.id);
    if (!hospital) return res.status(404).json({ message: 'Hospital not found' });

    // Only admin or the hospital owner can update
    if (req.user.role !== 'admin' && String(hospital.userId) !== String(req.user.id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const allowed = [
      'name', 'email', 'phone', 'contactPerson', 'address',
      'city', 'state', 'zip', 'country', 'dlNumber', 'gstNumber'
    ];
    const update: any = {};
    for (const key of allowed) {
      if (key in req.body) update[key] = req.body[key];
    }

    const updated = await HospitalService.updateHospital(req.params.id, update);
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const deleteHospital = async (req: any, res: Response) => {
  try {
    // only admin can delete
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Access denied' });
    await HospitalService.deleteHospital(req.params.id);
    res.json({ message: 'Hospital deleted' });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const approveHospital = async (req: any, res: Response) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Access denied' });
    const hospital = await HospitalService.approveHospital(req.params.id);
    res.json(hospital);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

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