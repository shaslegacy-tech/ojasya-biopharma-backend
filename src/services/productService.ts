// backend/services/productService.ts
import Product from '../models/Product';

class ProductService {
  static async addProduct({ name, brand, category, stock, supplierId, price }: any) {
    const product = await Product.create({ name, brand, category, stock, supplierId, price });
    return product;
  }

  static async updateProduct(productId: string, data: any) {
    const product = await Product.findByIdAndUpdate(productId, data, { new: true });
    if(!product) throw new Error('Product not found');
    return product;
  }

  static async deleteProduct(productId: string) {
    const product = await Product.findByIdAndDelete(productId);
    if(!product) throw new Error('Product not found');
    return product;
  }

  static async getProductsBySupplier(supplierId: string) {
    return Product.find({ supplierId });
  }

  static async getAllProducts() {
    return Product.find();
  }
}

export default ProductService;