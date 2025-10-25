// src/controllers/productController.ts
import { Request, Response } from "express";
import Product from "../models/Product";

export const createProduct = async (req: any, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const imagePaths = Array.isArray(req.files)
      ? (req.files as Express.Multer.File[]).map((f) => `/uploads/${f.filename}`)
      : [];

    const doc = await Product.create({
      ...req.body,
      images: imagePaths,
      createdBy: req.user.id,
    });
    res.status(201).json({ data: doc });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const getProducts = async (req: Request, res: Response) => {
  try {
    const { q, page = 1, limit = 30 } = req.query;
    const filter: any = {};
    if (q) filter.$text = { $search: String(q) };

    const products = await Product.find(filter)
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));
    res.json({ data: products });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const p = await Product.findById(req.params.id);
    if (!p) return res.status(404).json({ message: "Product not found" });
    res.json({ data: p });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const updateProduct = async (req: any, res: Response) => {
  try {
    const imagePaths = Array.isArray(req.files)
      ? (req.files as Express.Multer.File[]).map((f) => `/uploads/${f.filename}`)
      : undefined;

    const update: any = { ...req.body };
    if (imagePaths) update.images = imagePaths;

    const updated = await Product.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!updated) return res.status(404).json({ message: "Product not found" });
    res.json({ data: updated });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted" });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};