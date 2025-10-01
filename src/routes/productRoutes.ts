import { Router } from "express";
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from "../controllers/productController";
import { auth } from "../middleware/auth";
import { upload } from "../middleware/upload";

const router = Router();

router.get("/", getProducts);
router.post("/", auth(["admin", "supplier"]), upload.array("images", 5), createProduct);
router.get("/:id", getProductById);
router.put("/:id", auth(["admin", "supplier"]), upload.array("images", 5), updateProduct);
router.delete("/:id", auth(["admin", "supplier"]), deleteProduct);

export default router;
