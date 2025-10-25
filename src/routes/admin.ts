// backend/routes/admin.ts
import express from 'express';
import { getHospitals, getSuppliers, approveSupplier, getAllOrders, getCommissions } from '../controllers/adminController';
import { auth } from '../middleware/auth';

const router = express.Router();

router.get('/hospitals', auth(["admin"]), getHospitals);
router.get('/suppliers', auth(["admin"]), getSuppliers);
router.put('/suppliers/:id/approve', auth(["admin"]), approveSupplier);
router.get('/orders', auth(["admin"]), getAllOrders);
router.get('/commissions', auth(["admin"]), getCommissions);

export default router;
