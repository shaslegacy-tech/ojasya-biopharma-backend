import { Request, Response } from "express";
import Stock from "../models/Stock";

export const createStock = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    const { product, hospital, quantity, threshold } = req.body;
    if (!product || !hospital) return res.status(400).json({ message: "Product and Hospital are required" });
    const stock = await Stock.create({
      product,
      hospital,
      supplier: req.user.id,
      quantity: quantity ?? 0,
      threshold: threshold ?? 10,
    });
    res.status(201).json(stock);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const getStocks = async (_req: Request, res: Response) => {
  try {
    const stocks = await Stock.find()
      .populate("product")
      .populate("hospital")
      .populate("supplier");
    res.json(stocks);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const getStockById = async (req: Request, res: Response) => {
  try {
    const stock = await Stock.findById(req.params.id)
      .populate("product")
      .populate("hospital")
      .populate("supplier");
    if (!stock) return res.status(404).json({ message: "Stock not found" });
    res.json(stock);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const updateStock = async (req: Request, res: Response) => {
  try {
    const stock = await Stock.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!stock) return res.status(404).json({ message: "Stock not found" });
    res.json(stock);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const deleteStock = async (req: Request, res: Response) => {
  try {
    const stock = await Stock.findByIdAndDelete(req.params.id);
    if (!stock) return res.status(404).json({ message: "Stock not found" });
    res.json({ message: "Stock deleted" });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};
