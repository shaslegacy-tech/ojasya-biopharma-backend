// src/validators/productValidator.ts
import * as Joi from "joi";

export const productCreateSchema = Joi.object({
  name: Joi.string().required(),
  genericName: Joi.string().optional().allow("", null),
  brand: Joi.string().optional().allow("", null),
  category: Joi.string().required(),
  mrp: Joi.number().required(),
  tradePrice: Joi.number().optional(),
  unit: Joi.string().required(),
  images: Joi.array().items(Joi.string().uri()).optional(),
});