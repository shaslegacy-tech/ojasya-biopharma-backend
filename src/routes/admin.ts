// backend/routes/admin.ts
import express from 'express';
import { getHospitals, getSuppliers, approveSupplier, getAllOrders, getCommissions } from '../controllers/adminController';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

router.get('/hospitals', authMiddleware, getHospitals);
router.get('/suppliers', authMiddleware, getSuppliers);
router.put('/suppliers/:id/approve', authMiddleware, approveSupplier);
router.get('/orders', authMiddleware, getAllOrders);
router.get('/commissions', authMiddleware, getCommissions);

export default router;