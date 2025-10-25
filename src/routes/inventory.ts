// src/routes/inventory.ts
import express from "express";
import {
  createInventory,
  getInventories,
  getInventoryById,
  updateInventory,
  deleteInventory,
  getLowStock,
} from "../controllers/inventoryController";
import { auth } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { inventoryCreateSchema, inventoryUpdateSchema } from "../validators/inventoryValidator";

const router = express.Router();

// Suppliers & Admins can create inventory
router.post("/", auth(["supplier", "admin"]), validate(inventoryCreateSchema), createInventory);

// All roles can view inventories
router.get("/", auth(["hospital", "supplier", "admin"]), getInventories);
router.get("/:id", auth(["hospital", "supplier", "admin"]), getInventoryById);

// Suppliers & Admins can update or delete
router.put("/:id", auth(["supplier", "admin"]), validate(inventoryUpdateSchema), updateInventory);
router.delete("/:id", auth(["supplier", "admin"]), deleteInventory);

// Low stock alerts (for hospital + admin)
router.get("/low-stock", auth(["hospital", "admin"]), getLowStock);

export default router;