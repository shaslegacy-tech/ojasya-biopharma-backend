// backend/controllers/supplierController.ts
import { Request, Response } from 'express';
import ProductService from '../services/productService';
import OrderService from '../services/orderService';

export const addProduct = async (req: any, res: Response) => {
  try {
    const product = await ProductService.addProduct({ ...req.body, supplierId: req.user._id });
    res.json(product);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const updateProduct = async (req: any, res: Response) => {
  try {
    const product = await ProductService.updateProduct(req.params.id, req.body);
    res.json(product);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteProduct = async (req: any, res: Response) => {
  try {
    const product = await ProductService.deleteProduct(req.params.id);
    res.json({ message: 'Deleted', product });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const getInventory = async (req: any, res: Response) => {
  try {
    const products = await ProductService.getProductsBySupplier(req.user._id);
    res.json(products);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const getOrders = async (req: any, res: Response) => {
  try {
    const orders = await OrderService.getOrdersBySupplier(req.user._id);
    res.json(orders);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const updateOrderStatus = async (req: any, res: Response) => {
  try {
    const order = await OrderService.updateOrderStatus(req.params.id, req.body.status);
    res.json(order);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};