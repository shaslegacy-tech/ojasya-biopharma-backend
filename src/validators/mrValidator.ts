// src/validators/mrValidator.ts
import * as Joi from "joi";

export const mrCreateSchema = Joi.object({
  userId: Joi.string().required(),
  territories: Joi.array().items(Joi.string()).optional(),
  assignedHospitals: Joi.array().items(Joi.string()).optional(),
  phone: Joi.string().optional().allow("", null),
});

export const mrUpdateSchema = Joi.object({
  territories: Joi.array().items(Joi.string()).optional(),
  assignedHospitals: Joi.array().items(Joi.string()).optional(),
  phone: Joi.string().optional().allow("", null),
  active: Joi.boolean().optional(),
});