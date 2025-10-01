// @types/express/index.d.ts
import { IUser } from "../../src/models/User"; // or wherever your User interface is

declare global {
  namespace Express {
    interface Request {
      user?: IUser | { _id: string; role: string }; // add what you store in JWT
    }
  }
}
