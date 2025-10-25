// src/controllers/authController.ts
import { Request, Response } from "express";
import * as jwt from "jsonwebtoken";
import { SignOptions } from "jsonwebtoken";
import User from "../models/User";

const JWT_SECRET = (process.env.JWT_SECRET || "supersecret") as jwt.Secret;
const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN || "1d") as string;

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role } = req.body;
    if (!email || !password || !role) {
      return res.status(400).json({ message: "email, password and role are required" });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(400).json({ message: "Email already exists" });

    // NOTE: User model pre-save will hash the password
    const user = await User.create({
      name: name || email.split("@")[0],
      email: email.toLowerCase(),
      password, // model pre-save hashes
      role,
    }) as typeof User.prototype;

    // Cast _id to string for JWT payload
    const payload = { id: user._id.toString(), role: user.role, email: user.email };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as SignOptions);

    // Set cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.status(201).json({
      message: "Registered successfully",
      data: { user: { id: user._id.toString(), name: user.name, email: user.email, role: user.role } },
    });
  } catch (err: any) {
    console.error("Register error:", err);
    return res.status(500).json({ message: "Server error", error: err.message ?? err });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "email and password required" });

    const user = await User.findOne({ email: email.toLowerCase() }) as typeof User.prototype;
    if (!user) return res.status(400).json({ message: "Invalid email or password" });

    // comparePassword instance method (returns Promise<boolean>)
    const ok = await user.comparePassword(password);
    if (!ok) return res.status(400).json({ message: "Invalid email or password" });

    const payload = { id: user._id.toString(), role: user.role, email: user.email };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as SignOptions);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.json({
      message: "Login successful",
      data: { user: { id: user._id.toString(), email: user.email, name: user.name, role: user.role } },
    });
  } catch (err: any) {
    console.error("Login err", err);
    return res.status(500).json({ message: "Server error", error: err.message ?? err });
  }
};

export const me = async (req: Request, res: Response) => {
  // req.user typed via augmentation (see src/types/express.d.ts)
  const user = (req as any).user;
  if (!user) return res.status(401).json({ message: "Unauthorized" });
  return res.json({ data: user });
};

export const logout = async (_req: Request, res: Response) => {
  res.clearCookie("token");
  return res.json({ message: "Logged out successfully" });
};