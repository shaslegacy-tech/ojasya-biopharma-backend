import express from "express";
import { register, login, me, logout } from "../controllers/authController";
import { auth } from "../middleware/auth";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", auth(["hospital", "supplier", "admin"]), me);
router.post("/logout", logout); // ✅ new logout route

export default router;
