// src/utils/toObjectId.ts
import { Types } from "mongoose";
export const toObjectId = (id?: string | null) => (id ? new Types.ObjectId(id) : undefined);