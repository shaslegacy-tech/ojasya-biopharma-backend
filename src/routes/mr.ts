// src/routes/mr.ts
import express from "express";
import {
  getAssignedHospitals,
  getAssignedHospitalById,
  createVisitNote,
  syncVisitNotes,
  createOrderByMR,
} from "../controllers/mrController";
import { auth } from "../middleware/auth"; // role-based

const router = express.Router();

// MR hospital endpoints
router.get("/hospitals", auth(["mr"]), getAssignedHospitals);
router.get("/hospitals/:id", auth(["mr", "admin"]), getAssignedHospitalById);

// Visit notes & orders
router.post("/visit-notes", auth(["mr"]), createVisitNote);
router.post("/visit-notes/sync", auth(["mr"]), syncVisitNotes);
router.post("/orders", auth(["mr"]), createOrderByMR);

export default router;