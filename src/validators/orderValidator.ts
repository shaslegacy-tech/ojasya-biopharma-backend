// src/validators/orderValidator.ts
import * as Joi from "joi";

const orderItemSchema = Joi.object({
  productId: Joi.string().required(),
  quantity: Joi.number().integer().min(1).required(),
  price: Joi.number().precision(2).min(0).required(),
  batchNo: Joi.string().optional().allow("", null)
});

export const orderCreateSchema = Joi.object({
  hospitalId: Joi.string().required().label("hospitalId"),
  supplierId: Joi.string().required().label("supplierId"),
  products: Joi.array().items(orderItemSchema).min(1).required(),
  totalPrice: Joi.number().precision(2).min(0).required(),
  prescriptionFileUrl: Joi.string().uri().optional().allow("", null),
  source: Joi.string().optional().allow("", null)
});

export const orderUpdateSchema = Joi.object({
  status: Joi.string().valid("pending", "accepted", "delivered").required()
});