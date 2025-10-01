import { Request, Response } from "express";
import Product from "../models/Product";

// Create Product
export const createProduct = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    // Get uploaded images file paths
    const imagePaths = (req.files as Express.Multer.File[]).map(
      (file) => `/uploads/${file.filename}`
    );

    const product = await Product.create({
      ...req.body,
      images: imagePaths,
      createdBy: req.user.id,
    });

    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ message: (err as Error).message });
  }
};

// Get All Products
export const getProducts = async (_req: Request, res: Response) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
};

// Get Single Product By ID
export const getProductById = async (req: Request, res: Response) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
};

// Update Product By ID
export const updateProduct = async (req: Request, res: Response) => {
  try {
    let imagePaths: string[] | undefined = undefined;
    if (req.files) {
      imagePaths = (req.files as Express.Multer.File[]).map(
        (file) => `/uploads/${file.filename}`
      );
    }

    const updateData = {
      ...req.body,
      ...(imagePaths ? { images: imagePaths } : {}),
    };

    const product = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(400).json({ message: (err as Error).message });
  }
};

// Delete Product By ID
export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json({ message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
};
