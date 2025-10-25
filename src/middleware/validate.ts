// src/middleware/validate.ts
import { Request, Response, NextFunction } from "express";
import * as Joi from "joi";

export const validate = (schema: Joi.ObjectSchema) => (req: Request, res: Response, next: NextFunction) => {
  const toValidate = {
    body: schema && req.body,
    query: req.query,
    params: req.params,
  };

  const { error } = schema.validate(req.body, { abortEarly: false, allowUnknown: false });
  if (error) {
    const details = error.details.map(d => ({ message: d.message, path: d.path }));
    return res.status(400).json({ message: "Validation failed", details });
  }
  next();
};