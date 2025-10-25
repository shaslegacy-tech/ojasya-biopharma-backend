// src/services/productService.ts
import Product from "../models/Product";
import { Types } from "mongoose";
import { toObjectId } from "../utils/oObjectId";

const ProductService = {
  async addProduct(payload: any) {
    // payload should include createdBy (supplier id)
    const doc = await Product.create({
      ...payload,
      createdBy: payload.createdBy ? toObjectId(payload.createdBy) : undefined,
    });
    return doc;
  },

  async updateProduct(productId: string, payload: any) {
    const doc = await Product.findByIdAndUpdate(productId, payload, { new: true });
    if (!doc) throw new Error("Product not found");
    return doc;
  },

  async deleteProduct(productId: string) {
    const doc = await Product.findByIdAndDelete(productId);
    if (!doc) throw new Error("Product not found");
    return doc;
  },

  async getProductsBySupplier(supplierId: string) {
    return Product.find({ createdBy: toObjectId(supplierId) });
  },

  async getAllProducts() {
    return Product.find();
  },
};

export default ProductService;