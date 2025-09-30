// backend/routes/supplier.ts
import express from 'express';
import { addProduct, updateProduct, deleteProduct, getInventory, getOrders, updateOrderStatus } from '../controllers/supplierController';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

router.get('/inventory', authMiddleware, getInventory);
router.post('/inventory', authMiddleware, addProduct);
router.put('/inventory/:id', authMiddleware, updateProduct);
router.delete('/inventory/:id', authMiddleware, deleteProduct);

router.get('/orders', authMiddleware, getOrders);
router.put('/orders/:id/status', authMiddleware, updateOrderStatus);

export default router;