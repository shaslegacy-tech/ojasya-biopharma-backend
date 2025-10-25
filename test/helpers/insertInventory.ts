// test/helpers/insertInventory.ts
import Inventory from "../../src/models/Inventory";
import mongoose from "mongoose";

export const insertInventory = async (opts: {
  productId: mongoose.Types.ObjectId,
  supplierId: mongoose.Types.ObjectId,
  hospitalId?: mongoose.Types.ObjectId,
  stock?: number,
  price?: number,
  threshold?: number,
}) => {
  return Inventory.create({
    product: opts.productId,
    productId: opts.productId,
    supplier: opts.supplierId,
    supplierId: opts.supplierId,
    hospitalId: opts.hospitalId,
    stock: opts.stock ?? 0,
    price: opts.price ?? 0,
    threshold: opts.threshold ?? 10
  });
};