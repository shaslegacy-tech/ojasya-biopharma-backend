// src/middleware/validateBody.ts
import { Request, Response, NextFunction } from "express";

export const requireFields = (fields: string[]) => (req: Request, res: Response, next: NextFunction) => {
  const missing = fields.filter(f => !(f in req.body));
  if (missing.length) return res.status(400).json({ message: `Missing fields: ${missing.join(", ")}` });
  next();
};