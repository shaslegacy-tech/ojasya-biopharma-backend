// backend/routes/hospital.ts
import express from "express";
import {
  placeOrder,
  getOrders,
  createHospital,
  listHospitals,
  getHospital,
  updateHospital,
  deleteHospital,
  approveHospital,
} from "../controllers/hospitalController";
import { auth } from "../middleware/auth";
// ...
import { validate } from '../middleware/validate';
import { hospitalCreateSchema, hospitalUpdateSchema } from '../validators/hospitalValidator';

const router = express.Router();

// Create hospital profile (hospital user or admin)
router.post("/", auth(["hospital", "admin"]), createHospital);

// List hospitals (admin)
router.get("/", auth(["admin"]), listHospitals);

// Get single (admin or the hospital itself)
router.get("/:id", auth(["admin", "hospital"]), getHospital);

// Update (admin or owner hospital)
router.put("/:id", auth(["admin", "hospital"]), updateHospital);

// Delete (admin)
router.delete("/:id", auth(["admin"]), deleteHospital);

// Approve hospital (admin)
router.put("/:id/approve", auth(["admin"]), approveHospital);

// Public onboarding
router.post('/onboard', validate(hospitalCreateSchema), createHospital);

// Authenticated hospital or admin
router.post('/', auth(['hospital','admin']), validate(hospitalCreateSchema), createHospital);

router.put('/:id', auth(['admin','hospital']), validate(hospitalUpdateSchema), updateHospital);

router.get("/orders", auth(["hospital", "admin"]), getOrders);
router.post("/orders", auth(["hospital", "admin"]), placeOrder);

export default router;
