// backend/routes/hospital.ts
import express from 'express';
import { placeOrder, getOrders } from '../controllers/hospitalController';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

router.get('/orders', authMiddleware, getOrders);
router.post('/orders', authMiddleware, placeOrder);

export default router;