// src/types/express.d.ts
import { Role } from "../models/enums";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email?: string;
        role: Role | string;
      };
    }
  }
}

export {};