// backend/validators/hospitalValidator.ts
import Joi from 'joi';

export const hospitalCreateSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  phone: Joi.string().optional(),
  contactPerson: Joi.string().optional(),
  address: Joi.string().optional(),
  city: Joi.string().optional(),
  state: Joi.string().optional(),
  zip: Joi.string().optional(),
  country: Joi.string().optional(),
  dlNumber: Joi.string().optional(),
  gstNumber: Joi.string().optional(),
});

export const hospitalUpdateSchema = Joi.object({
  name: Joi.string(),
  email: Joi.string().email(),
  phone: Joi.string(),
  contactPerson: Joi.string(),
  address: Joi.string(),
  city: Joi.string(),
  state: Joi.string(),
  zip: Joi.string(),
  country: Joi.string(),
  dlNumber: Joi.string(),
  gstNumber: Joi.string(),
});
