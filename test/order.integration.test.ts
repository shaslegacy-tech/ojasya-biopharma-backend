// test/order.integration.test.ts
import mongoose from "mongoose";
import connectDB from "../src/utils/db";
import User from "../src/models/User";
import Hospital from "../src/models/Hospital";
import Product from "../src/models/Product";
import Inventory from "../src/models/Inventory";
import OrderService from "../src/services/orderService";
import Commission from "../src/models/Commission";
import bcrypt from "bcryptjs";

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await connectDB();
  }
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe("Order -> Commission integration", () => {
  it("creates an order and a commission record is generated", async () => {
    // create supplier, hospital user & hospital profile
    const hashed = await bcrypt.hash("Password123!", 10);
    const supplier = await User.create({ name: "Supplier", email: "sup@example", password: hashed, role: "supplier", approved: true });
    const hospitalUser = await User.create({ name: "HospitalUser", email: "hos@example", password: hashed, role: "hospital", approved: true });
    const hospital = await Hospital.create({ userId: hospitalUser._id, name: "Hosp A", email: "hosp-a@example", approved: true });

    // create products and inventory
    const p1 = await Product.create({ name: "A", category: "Medicine", price: 10, unit: "box", createdBy: supplier._id });
    const p2 = await Product.create({ name: "B", category: "Medicine", price: 20, unit: "box", createdBy: supplier._id });

   await Inventory.create({
  product: p1._id,
  productId: p1._id,
  supplier: supplier._id,
  supplierId: supplier._id,
  hospitalId: hospital._id,
  stock: 100,
  price: 9,
  threshold: 5,
});
await Inventory.create({
  product: p2._id,
  productId: p2._id,
  supplier: supplier._id,
  supplierId: supplier._id,
  hospitalId: hospital._id,
  stock: 100,
  price: 19,
  threshold: 5,
});
    // create order using OrderService (hospitalId, order payload)
    const orderPayload = {
      supplierId: supplier._id,
      products: [
        { productId: p1._id, quantity: 5, price: 9 },
        { productId: p2._id, quantity: 10, price: 19 }
      ],
      totalPrice: 5 * 9 + 10 * 19
    };

    // Create order via service (this will also call CommissionService internally per your service)
    const order = await OrderService.createOrder(String(hospital._id), orderPayload as any);

    expect(order).toBeDefined();
    expect(order._id).toBeDefined();

    // Commission should be created
    const commission = await Commission.findOne({ orderId: order._id });
    expect(commission).not.toBeNull();
    // commission amount should be 15% (per your service)
    const expected = Math.round(((order as any).totalPrice as number) * 0.15 * 100) / 100;
    const actual = (commission as any).commissionAmount;
    expect(actual).toBeCloseTo(expected, 2);
  });

  it("throws if order cannot be created with invalid payload", async () => {
    const hashed = await bcrypt.hash("Password123!", 10);
    const supplier = await User.create({ name: "Supplier", email: "sup2@example", password: hashed, role: "supplier", approved: true });
    const hospitalUser = await User.create({ name: "HospitalUser", email: "hos2@example", password: hashed, role: "hospital", approved: true });
    const hospital = await Hospital.create({ userId: hospitalUser._id, name: "Hosp B", email: "hosp-b@example", approved: true });

    // invalid products empty should cause service or mongo validation error
    await expect(OrderService.createOrder(String(hospital._id), {
      supplierId: supplier._id,
      products: [],
      totalPrice: 0
    } as any)).rejects.toThrow();
  });
});