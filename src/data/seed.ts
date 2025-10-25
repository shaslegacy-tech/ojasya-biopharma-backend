// src/data/seed.ts
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
import User from "../models/User";
import Product from "../models/Product";
import Inventory from "../models/Inventory";
import Order from "../models/Order";

const MONGO = process.env.MONGODB_URI || "mongodb://localhost:27017/ojasya_biopharma";

async function run() {
  await mongoose.connect(MONGO);
  console.log("Connected to MongoDB for seeding.");

  // Create admin, MR, supplier, hospital if not exist
  const admin = await User.findOne({ email: "admin@ojasya.com" });
  if (!admin) {
    await User.create({ name: "Admin One", email: "admin@ojasya.com", password: "password123", role: "admin", approved: true });
    console.log("Created admin");
  }

  const mr = await User.findOne({ email: "mr1@ojasya.com" });
  if (!mr) {
    await User.create({ name: "MR Rahul", email: "mr1@ojasya.com", password: "password123", role: "mr", approved: true });
    console.log("Created MR");
  }

  const supplier = await User.findOne({ email: "supplier@ojasya.com" });
  if (!supplier) {
    await User.create({ name: "Acme Supplier", email: "supplier@ojasya.com", password: "password123", role: "supplier", approved: true });
    console.log("Created supplier");
  }

  const hospital = await User.findOne({ email: "hospital@ojasya.com" });
  if (!hospital) {
    await User.create({ name: "City Hospital", email: "hospital@ojasya.com", password: "password123", role: "hospital", approved: true });
    console.log("Created hospital");
  }

  // sample product
  let product = await Product.findOne({ name: "Amoxicillin 500 mg" });
  if (!product) {
    product = await Product.create({
      name: "Amoxicillin 500 mg",
      genericName: "Amoxicillin",
      brand: "Acme Pharma",
      mrp: 120,
      tradePrice: 95,
      unit: "tablet",
      createdBy: (await User.findOne({ role: "supplier" }))?._id,
    });
    console.log("Created product", product.name);
  }

  // sample inventory
  const invExists = await Inventory.findOne({ product: product._id });
  if (!invExists) {
    await Inventory.create({
      product: product._id,
      supplier: (await User.findOne({ role: "supplier" }))?._id,
      batchNo: "BATCH-001",
      expiryDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365),
      availableQty: 1000,
      reservedQty: 0,
      costPrice: 70,
    });
    console.log("Created inventory");
  }

  // sample order
  const orders = await Order.find().limit(1);
  if (orders.length === 0) {
    const hospitalUser = await User.findOne({ role: "hospital" });
    const placedBy = await User.findOne({ role: "mr" });

    await Order.create({
      customer: hospitalUser?._id,
      placedBy: placedBy?._id,
      items: [{ product: product._id, qty: 10, price: 120 }],
      totalAmount: 120 * 10,
      paymentStatus: "UNPAID",
      assignedSupplier: (await User.findOne({ role: "supplier" }))?._id,
    });
    console.log("Created sample order");
  }

  console.log("Seeding complete.");
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});