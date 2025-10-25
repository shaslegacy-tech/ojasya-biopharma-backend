// src/middleware/auth.ts
import { Request, Response, NextFunction } from "express";
import * as jwt from "jsonwebtoken";
import { Role } from "../models/enums";

const JWT_SECRET = (process.env.JWT_SECRET || "supersecret") as jwt.Secret;

export interface AuthPayload {
  id: string;
  email?: string;
  role: Role | string;
}

export const auth = (allowedRoles: (Role | string)[] = []) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // support cookie token or Authorization header
      const token =
        (req.cookies && (req.cookies as any).token) ||
        (req.headers.authorization && (req.headers.authorization as string).split(" ")[1]);

      if (!token) return res.status(401).json({ message: "No token provided" });

      const decoded = jwt.verify(token, JWT_SECRET) as AuthPayload;

      // attach typed user to request (TS augmentation handles typing)
      (req as any).user = { id: decoded.id, email: decoded.email, role: decoded.role };

      if (allowedRoles.length > 0 && !allowedRoles.includes(decoded.role)) {
        return res.status(403).json({ message: "Access denied" });
      }

      next();
    } catch (err: any) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }
  };
};