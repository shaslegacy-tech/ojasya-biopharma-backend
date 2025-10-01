// backend/services/hospitalService.ts
import Hospital from '../models/Hospital';
import mongoose from 'mongoose';

class HospitalService {
  static async createHospital(data: any, userId?: string) {
    if (userId) data.userId = new mongoose.Types.ObjectId(userId);
    const hospital = await Hospital.create(data);
    return hospital;
  }

  static async listHospitals(filter = {}, options = {}) {
    return Hospital.find(filter)
      .sort({ createdAt: -1 })
      .lean();
  }

  static async getById(id: string) {
    return Hospital.findById(id).lean();
  }

  static async updateHospital(id: string, update: any) {
    const hospital = await Hospital.findByIdAndUpdate(id, update, { new: true });
    return hospital;
  }

  static async deleteHospital(id: string) {
    return Hospital.findByIdAndDelete(id);
  }

  static async approveHospital(id: string) {
    const hospital = await Hospital.findByIdAndUpdate(id, { approved: true }, { new: true });
    return hospital;
  }
}

export default HospitalService;
