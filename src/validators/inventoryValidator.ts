// src/validators/inventoryValidator.ts
import * as Joi from "joi";

export const inventoryCreateSchema = Joi.object({
  productId: Joi.string().required().label("productId"),
  supplierId: Joi.string().required().label("supplierId"),
  hospitalId: Joi.string().optional().allow("", null).label("hospitalId"),
  warehouse: Joi.string().optional().allow("", null),
  batchNo: Joi.string().optional().allow("", null),
  manufactureDate: Joi.date().iso().optional().allow("", null),
  expiryDate: Joi.date().iso().optional().allow("", null),
  stock: Joi.number().integer().min(0).required(),
  price: Joi.number().precision(2).required(),
  threshold: Joi.number().integer().min(0).optional().default(10)
});

export const inventoryUpdateSchema = Joi.object({
  stock: Joi.number().integer().min(0).optional(),
  price: Joi.number().precision(2).optional(),
  threshold: Joi.number().integer().min(0).optional(),
  batchNo: Joi.string().optional().allow("", null),
  warehouse: Joi.string().optional().allow("", null),
  expiryDate: Joi.date().iso().optional().allow("", null)
});