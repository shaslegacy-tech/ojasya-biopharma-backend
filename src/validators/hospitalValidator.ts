// backend/validators/hospitalValidator.ts
import * as Joi from "joi";

export const hospitalCreateSchema = Joi.object({
  name: Joi.string().min(2).max(200).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().optional().allow("", null),
  contactPerson: Joi.string().optional().allow("", null),
  address: Joi.string().optional().allow("", null),
  city: Joi.string().optional().allow("", null),
  state: Joi.string().optional().allow("", null),
  zip: Joi.string().optional().allow("", null),
  country: Joi.string().optional().allow("", null),
  dlNumber: Joi.string().optional().allow("", null),
  gstNumber: Joi.string().optional().allow("", null)
});

export const hospitalUpdateSchema = Joi.object({
  name: Joi.string().min(2).max(200).optional(),
  email: Joi.string().email().optional(),
  phone: Joi.string().optional().allow("", null),
  contactPerson: Joi.string().optional().allow("", null),
  address: Joi.string().optional().allow("", null),
  city: Joi.string().optional().allow("", null),
  state: Joi.string().optional().allow("", null),
  zip: Joi.string().optional().allow("", null),
  country: Joi.string().optional().allow("", null),
  dlNumber: Joi.string().optional().allow("", null),
  gstNumber: Joi.string().optional().allow("", null),
  approved: Joi.boolean().optional()
});
