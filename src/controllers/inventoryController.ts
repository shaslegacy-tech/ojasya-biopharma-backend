import { Request, Response } from "express";
import Inventory from "../models/Inventory";

export const createInventory = async (req: Request, res: Response) => {
  try {
    const { productId, supplierId, hospitalId, stock, price, threshold } = req.body;

    const inventory = await Inventory.create({
      productId,
      supplierId,
      hospitalId,
      stock,
      price,
      threshold,
    });

    res.status(201).json(inventory);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const getInventories = async (req: Request, res: Response) => {
  try {
    const inventories = await Inventory.find()
      .populate("productId")
      .populate("supplierId")
      .populate("hospitalId");
    res.json(inventories);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const getInventoryById = async (req: Request, res: Response) => {
  try {
    const inventory = await Inventory.findById(req.params.id)
      .populate("productId")
      .populate("supplierId")
      .populate("hospitalId");
    if (!inventory) return res.status(404).json({ message: "Inventory not found" });
    res.json(inventory);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const updateInventory = async (req: Request, res: Response) => {
  try {
    const { stock, price, threshold } = req.body;
    const inventory = await Inventory.findByIdAndUpdate(
      req.params.id,
      { stock, price, threshold },
      { new: true }
    );

    if (!inventory) return res.status(404).json({ message: "Inventory not found" });
    res.json(inventory);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const deleteInventory = async (req: Request, res: Response) => {
  try {
    const inventory = await Inventory.findByIdAndDelete(req.params.id);
    if (!inventory) return res.status(404).json({ message: "Inventory not found" });
    res.json({ message: "Inventory deleted successfully" });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

// New controller to get low stock inventories
export const getLowStock = async (req: Request, res: Response) => {
  try {
    const inventories = await Inventory.find({ $expr: { $lt: ["$stock", "$threshold"] } })
      .populate("productId")
      .populate("supplierId")
      .populate("hospitalId");

    res.json(inventories);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};
