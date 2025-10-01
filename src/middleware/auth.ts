import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

export interface AuthUser {
  id: string;
  email: string;
  role: "hospital" | "supplier" | "admin";
}

export const auth =
  (roles: ("hospital" | "supplier" | "admin")[] = []) =>
  (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies?.token; // ✅ read cookie
    if (!token) return res.status(401).json({ message: "No token provided" });

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;
      (req as any).user = decoded;

      // ✅ Role enforcement
      if (roles.length > 0 && !roles.includes(decoded.role)) {
        return res.status(403).json({ message: "Access denied" });
      }

      next();
    } catch (err) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }
  };
