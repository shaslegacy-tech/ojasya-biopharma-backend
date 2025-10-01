// src/types/express/index.d.ts
import { AuthUser } from "../../middleware/auth";

declare module "express-serve-static-core" {
  interface Request {
    user?: AuthUser;
  }
}
