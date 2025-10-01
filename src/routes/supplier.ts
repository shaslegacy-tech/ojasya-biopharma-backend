// backend/routes/supplier.ts
import express from 'express';
import { addProduct, updateProduct, deleteProduct, getInventory, getOrders, updateOrderStatus } from '../controllers/supplierController';
import { auth } from '../middleware/auth';

const router = express.Router();

router.get('/inventory', auth(["supplier", "admin"]), getInventory);
router.post('/inventory', auth(["supplier", "admin"]), addProduct);
router.put('/inventory/:id', auth(["supplier", "admin"]), updateProduct);
router.delete('/inventory/:id', auth(["supplier", "admin"]), deleteProduct);

router.get('/orders', auth(["supplier", "admin"]), getOrders);
router.put('/orders/:id/status', auth(["supplier", "admin"]), updateOrderStatus);

export default router;