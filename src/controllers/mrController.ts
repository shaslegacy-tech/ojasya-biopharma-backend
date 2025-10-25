// src/controllers/mrController.ts
import { Request, Response } from "express";
import User from "../models/User";
import Hospital from "../models/Hospital";
import MR from "../models/MR";
import VisitNote from "../models/VisitNote"; // create model below
import OrderService from "../services/orderService";

// Helper: ensure returned hospital list is safe (strip heavy fields if needed)
const sanitizeHospital = (h: any) => {
  if (!h) return h;
  return {
    _id: h._id,
    name: h.name,
    email: h.email,
    phone: h.phone,
    contactPerson: h.contactPerson,
    address: h.address,
    city: h.city,
    state: h.state,
    zip: h.zip,
    country: h.country,
    dlNumber: h.dlNumber,
    gstNumber: h.gstNumber,
    approved: h.approved,
  };
};

/**
 * GET /api/mr/hospitals
 * Return hospitals assigned to the MR (req.user.id)
 * Optional query: ?q=search
 */
export const getAssignedHospitals = async (req: any, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const q = (req.query.q as string) || "";

    const mr = await MR.findOne({ userId }).lean();
    if (!mr) return res.status(200).json({ hospitals: [] });

    const assignedIds = Array.isArray(mr.assignedHospitals) ? mr.assignedHospitals : [];
    if (assignedIds.length === 0) return res.status(200).json({ hospitals: [] });

    const filter: any = { _id: { $in: assignedIds } };
    if (q) filter.$or = [{ name: { $regex: q, $options: "i" } }, { city: { $regex: q, $options: "i" } }];

    const hospitals = await Hospital.find(filter).lean();
    const safe = hospitals.map(sanitizeHospital);
    return res.json({ hospitals: safe });
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
};

/**
 * GET /api/mr/hospitals/:id
 * Return hospital detail if assigned to MR or admin
 */
export const getAssignedHospitalById = async (req: any, res: Response) => {
  try {
    const userId = req.user?.id;
    const role = req.user?.role;
    const hospitalId = req.params.id;

    if (!hospitalId) return res.status(400).json({ message: "hospital id required" });

    // Admins can view any hospital
    if (role === "admin") {
      const hosp = await Hospital.findById(hospitalId).lean();
      if (!hosp) return res.status(404).json({ message: "Hospital not found" });
      return res.json({ hospital: sanitizeHospital(hosp) });
    }

    // For MR role, ensure the hospital is assigned
    const mr = await MR.findOne({ userId }).lean();
    if (!mr) return res.status(403).json({ message: "No MR profile or not assigned to hospitals" });

    const assignedIds = (mr.assignedHospitals || []).map((x: any) => x.toString());
    if (!assignedIds.includes(String(hospitalId))) return res.status(403).json({ message: "Access denied to this hospital" });

    const hosp = await Hospital.findById(hospitalId).lean();
    if (!hosp) return res.status(404).json({ message: "Hospital not found" });
    return res.json({ hospital: sanitizeHospital(hosp) });
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
};

/**
 * POST /api/mr/visit-notes
 * Body: { hospitalId, subject, notes, createdAt? }
 */
export const createVisitNote = async (req: any, res: Response) => {
  try {
    const mrUserId = req.user?.id;
    const { hospitalId, subject, notes, createdAt } = req.body;
    if (!hospitalId || (!subject && !notes)) return res.status(400).json({ message: "hospitalId and notes/subject required" });

    const note = await VisitNote.create({
      mr: mrUserId,
      hospital: hospitalId,
      subject,
      notes,
      createdAt: createdAt ? new Date(createdAt) : new Date(),
      synced: true,
    });

    return res.status(201).json({ note });
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
};

/**
 * POST /api/mr/visit-notes/sync
 * Accepts array of local notes to sync: [{ hospitalId, subject, notes, createdAt, localId }]
 * Returns mapping localId -> savedId
 */
export const syncVisitNotes = async (req: any, res: Response) => {
  try {
    const mrUserId = req.user?.id;
    const payload: any[] = req.body?.notes ?? [];
    const results: any[] = [];

    for (const n of payload) {
      const note = await VisitNote.create({
        mr: mrUserId,
        hospital: n.hospitalId,
        subject: n.subject,
        notes: n.notes,
        createdAt: n.createdAt ? new Date(n.createdAt) : new Date(),
        synced: true,
      });

      results.push({ localId: n.localId, savedId: note._id });
    }

    return res.json({ results });
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
};

/**
 * (Optional) POST /api/mr/order — thin wrapper to create an order on behalf of hospital by MR
 */
export const createOrderByMR = async (req: any, res: Response) => {
  try {
    const mrUserId = req.user?.id;
    const { hospitalId, items, totalPrice, supplierId } = req.body;
    if (!hospitalId || !Array.isArray(items) || items.length === 0) return res.status(400).json({ message: "invalid payload" });

    // call existing OrderService (hospitalId, payload)
    const order = await OrderService.createOrder(hospitalId, { supplierId, items, totalPrice, mrId: mrUserId });
    return res.status(201).json({ order });
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
};