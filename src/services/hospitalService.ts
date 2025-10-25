// src/services/hospitalService.ts
import Hospital from "../models/Hospital";
import { Types } from "mongoose";
import { toObjectId } from "../utils/oObjectId";

const HospitalService = {
  async createHospital(data: any, userId?: string) {
    if (userId) data.userId = toObjectId(userId);
    const doc = await Hospital.create(data);
    return doc;
  },

  async listHospitals(filter = {}) {
    return Hospital.find(filter).sort({ createdAt: -1 }).lean();
  },

  async getById(id: string) {
    return Hospital.findById(toObjectId(id)).lean();
  },

  async updateHospital(id: string, update: any) {
    return Hospital.findByIdAndUpdate(toObjectId(id), update, { new: true });
  },

  async deleteHospital(id: string) {
    return Hospital.findByIdAndDelete(id);
  },

  async approveHospital(id: string) {
    return Hospital.findByIdAndUpdate(id, { approved: true }, { new: true });
  },
};

export default HospitalService;