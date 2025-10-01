import { Router } from "express";
import {
  createStock,
  getStocks,
  getStockById,
  updateStock,
  deleteStock,
} from "../controllers/stockController";
import { auth } from "../middleware/auth";

const router = Router();

router.get("/", auth(["admin", "supplier", "hospital"]), getStocks);
router.post("/", auth(["admin", "supplier"]), createStock);
router.get("/:id", auth(["admin", "supplier", "hospital"]), getStockById);
router.put("/:id", auth(["admin", "supplier"]), updateStock);
router.delete("/:id", auth(["admin"]), deleteStock);

export default router;
