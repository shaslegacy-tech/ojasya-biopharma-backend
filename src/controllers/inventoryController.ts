// src/controllers/inventoryController.ts
import { Request, Response } from "express";
import Inventory from "../models/Inventory";

export const createInventory = async (req: Request, res: Response) => {
  try {
    const { product, supplier, warehouse, batchNo, availableQty, costPrice, threshold, expiryDate } = req.body;

    if (!product || !supplier) return res.status(400).json({ message: "product and supplier required" });

    const inventory = await Inventory.create({
      product,
      supplier,
      warehouse,
      batchNo,
      availableQty: availableQty ?? 0,
      costPrice,
      threshold: threshold ?? 10,
      expiryDate,
    });

    res.status(201).json({ data: inventory });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const getInventories = async (_req: Request, res: Response) => {
  try {
    const inventories = await Inventory.find()
      .populate("product")
      .populate("supplier");
    res.json({ data: inventories });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const getInventoryById = async (req: Request, res: Response) => {
  try {
    const inv = await Inventory.findById(req.params.id).populate("product supplier");
    if (!inv) return res.status(404).json({ message: "Inventory not found" });
    res.json({ data: inv });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const updateInventory = async (req: Request, res: Response) => {
  try {
    const inv = await Inventory.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!inv) return res.status(404).json({ message: "Inventory not found" });
    res.json({ data: inv });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const deleteInventory = async (req: Request, res: Response) => {
  try {
    await Inventory.findByIdAndDelete(req.params.id);
    res.json({ message: "Inventory deleted" });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const getLowStock = async (_req: Request, res: Response) => {
  try {
    const list = await Inventory.find({ $expr: { $lt: ["$availableQty", "$threshold"] } }).populate("product supplier");
    res.json({ data: list });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};