// src/scripts/seed.ts
import dotenv from "dotenv";
dotenv.config();

import connectDB from "../utils/db";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

import User from "../models/User";
import Product from "../models/Product";
import Inventory from "../models/Inventory";
import Hospital from "../models/Hospital";
import MR from "../models/MR";
import Order from "../models/Order";
import Commission from "../models/Commission";

/**
 * Helper: cast a Mongoose document to a typed shape and ensure _id is ObjectId
 */
function asDoc<T extends { _id?: any }>(doc: any): T & { _id: mongoose.Types.ObjectId } {
  return doc as T & { _id: mongoose.Types.ObjectId };
}

/**
 * Helper: ensure a value is a mongoose.Types.ObjectId
 */
function toObjectId(value: any): mongoose.Types.ObjectId {
  if (!value) return new mongoose.Types.ObjectId();
  if (value instanceof mongoose.Types.ObjectId) return value;
  try {
    return new mongoose.Types.ObjectId(String(value));
  } catch {
    return new mongoose.Types.ObjectId();
  }
}

async function clearAll() {
  console.log("Clearing existing collections...");
  const collections = [
    "users",
    "products",
    "inventories",
    "hospitals",
    "mrs",
    "orders",
    "commissions",
  ];

  for (const name of collections) {
    try {
      await mongoose.connection.collection(name).deleteMany({});
      console.log(`  cleared ${name}`);
    } catch (err) {
      // ignore missing collections
    }
  }
}

/**
 * Build inventory doc using the correct field names from the Inventory schema.
 */
function buildInventoryDoc(
  inventoryModel: any,
  productId: mongoose.Types.ObjectId,
  supplierId: mongoose.Types.ObjectId,
  hospitalId: mongoose.Types.ObjectId | undefined,
  stock: number,
  price: number,
  threshold = 10
) {
  const paths = inventoryModel.schema?.paths || inventoryModel.paths || {};
  const doc: any = {};

  if (paths["product"]) doc.product = productId;
  else if (paths["productId"]) doc.productId = productId;
  else if (paths["product_id"]) doc.product_id = productId;

  if (paths["supplier"]) doc.supplier = supplierId;
  else if (paths["supplierId"]) doc.supplierId = supplierId;
  else if (paths["supplier_id"]) doc.supplier_id = supplierId;

  if (hospitalId) {
    if (paths["hospital"]) doc.hospital = hospitalId;
    else if (paths["hospitalId"]) doc.hospitalId = hospitalId;
    else if (paths["hospital_id"]) doc.hospital_id = hospitalId;
    else doc.hospitalId = hospitalId;
  }

  if (paths["stock"]) doc.stock = stock;
  else if (paths["availableQty"]) doc.availableQty = stock;
  else doc.stock = stock;

  if (paths["price"]) doc.price = price;
  else if (paths["costPrice"]) doc.costPrice = price;
  else doc.price = price;

  if (paths["threshold"]) doc.threshold = threshold;
  else doc.threshold = threshold;

  return doc;
}

/**
 * Build an order doc dynamically by inspecting the Order schema.
 * Accepts `productsArr` as array of { productId, quantity, price, batchNo? } using common keys.
 */
function buildOrderDoc(
  orderModel: any,
  hospitalId: mongoose.Types.ObjectId,
  supplierId: mongoose.Types.ObjectId,
  productsArr: Array<{ productId: mongoose.Types.ObjectId; quantity: number; price: number; batchNo?: string }>,
  statusPreferred = "pending",
  totalPrice?: number,
  prescriptionFileUrl?: string,
  placedById?: mongoose.Types.ObjectId
) {
  const paths = orderModel.schema?.paths || orderModel.paths || {};
  const doc: any = {};

  // map customer / hospital field
  if (paths["customer"]) doc.customer = toObjectId(hospitalId);
  else if (paths["hospitalId"]) doc.hospitalId = toObjectId(hospitalId);
  else if (paths["hospital"]) doc.hospital = toObjectId(hospitalId);
  else doc.hospitalId = toObjectId(hospitalId); // fallback key

  // map supplier / seller field
  if (paths["supplierId"]) doc.supplierId = toObjectId(supplierId);
  else if (paths["supplier"]) doc.supplier = toObjectId(supplierId);
  else doc.supplierId = toObjectId(supplierId);

  // map placedBy (who placed the order) - often a user id
  if (placedById) {
    if (paths["placedBy"]) doc.placedBy = toObjectId(placedById);
    else if (paths["placed_by"]) doc.placed_by = toObjectId(placedById);
    else if (paths["createdBy"]) doc.createdBy = toObjectId(placedById);
  }

  // Build product items according to common expected keys (include many variants)
  const builtItems = productsArr.map((it) => {
    const item: any = {};

    // product id variants
    item.productId = toObjectId(it.productId);
    item.product = toObjectId(it.productId);
    item.product_id = toObjectId(it.productId);

    // quantity variants (many schemas use different key names)
    item.quantity = it.quantity;
    item.qty = it.quantity;      // commonly required
    item.count = it.quantity;

    // price variants
    item.price = it.price;
    item.rate = it.price;
    item.unitPrice = it.price;

    // batch / expiry
    if (it.batchNo) {
      item.batchNo = it.batchNo;
      item.batch_no = it.batchNo;
    }

    return item;
  });

  // put items under the common property name (products, items, orderItems)
  if (paths["products"]) doc.products = builtItems;
  else if (paths["items"]) doc.items = builtItems;
  else if (paths["orderItems"]) doc.orderItems = builtItems;
  else doc.products = builtItems;

  // status mapping: get enum values if present
  let statusToSet = statusPreferred;
  try {
    const statusPath = orderModel.schema.path("status");
    const enumVals = (statusPath && (statusPath as any).enumValues) || (statusPath && (statusPath as any).options && (statusPath as any).options.enum) || null;
    if (enumVals && Array.isArray(enumVals) && enumVals.length > 0) {
      if (enumVals.includes(statusPreferred)) statusToSet = statusPreferred;
      else {
        const candidates = [statusPreferred, statusPreferred.toUpperCase(), statusPreferred.toLowerCase(), "PENDING", "Pending"];
        const found = candidates.find(c => enumVals.includes(c));
        if (found) statusToSet = found;
        else statusToSet = enumVals[0]; // fallback to first allowed enum
      }
    }
  } catch (e) {
    // ignore
  }

  if (paths["status"]) doc.status = statusToSet;
  else if (paths["orderStatus"]) doc.orderStatus = statusToSet;
  else doc.status = statusToSet;

  if (typeof totalPrice === "number") {
    if (paths["totalPrice"]) doc.totalPrice = totalPrice;
    else if (paths["total_amount"]) doc.total_amount = totalPrice;
    else doc.totalPrice = totalPrice;
  }

  if (prescriptionFileUrl) {
    if (paths["prescriptionFileUrl"]) doc.prescriptionFileUrl = prescriptionFileUrl;
    else if (paths["prescription"]) doc.prescription = prescriptionFileUrl;
    else doc.prescriptionFileUrl = prescriptionFileUrl;
  }

  return doc;
}

async function createSeeds() {
  // Hash helper
  const hash = async (plain: string) => bcrypt.hash(plain, 10);

  // Admin user
  const admin = await User.create({
    name: "Ojasya Admin",
    email: "admin@ojasya.test",
    password: "Password123!",
    role: "admin",
    approved: true,
  });

  // Supplier user
  const supplier = await User.create({
    name: "Demo Supplier",
    email: "supplier@ojasya.test",
    password: "Password123!",
    role: "supplier",
    approved: true,
  });

  // MR user (role=mr)
  const mrUser = await User.create({
    name: "Demo MR",
    email: "mr@ojasya.test",
    password: "Password123!",
    role: "mr",
    approved: true,
  });

  // Hospital user
  const hospitalUser = await User.create({
    name: "Demo Hospital User",
    email: "hospital@ojasya.test",
    password: "Password123!",
    role: "hospital",
    approved: true,
  });

  // Hospital profile
  const hospital = await Hospital.create({
    userId: hospitalUser._id,
    name: "City Demo Hospital",
    email: "contact@citydemo.test",
    phone: "9000000000",
    contactPerson: "Dr Demo",
    address: "1 Demo Street",
    city: "DemoCity",
    state: "DemoState",
    approved: true,
  });

  // MR profile
  const mr = await MR.create({
    userId: mrUser._id,
    territories: ["DemoCity"],
    assignedHospitals: [hospital._id],
    phone: "9888888888",
    active: true,
  });

  // Products
  const productsInserted = await Product.insertMany([
    {
      name: "Paracetamol 500mg",
      brand: "Ojasya",
      category: "Medicine",
      description: "Painkiller",
      price: 50,
      unit: "tablet",
      createdBy: supplier._id,
    },
    {
      name: "Amoxicillin 250mg",
      brand: "Ojasya",
      category: "Medicine",
      description: "Antibiotic",
      price: 120,
      unit: "capsule",
      createdBy: supplier._id,
    },
  ]);

  // cast product docs and ids
  const prod0 = asDoc<any>(productsInserted[0]);
  const prod1 = asDoc<any>(productsInserted[1]);
  const supplierId = asDoc<any>(supplier)._id;
  const hospitalId = asDoc<any>(hospital)._id;

  // Inventories - use dynamic doc builder according to Inventory schema
  const invDocs = [
    buildInventoryDoc(
      Inventory,
      toObjectId(prod0._id),
      toObjectId(supplierId),
      toObjectId(hospitalId),
      200,
      45,
      10
    ),
    buildInventoryDoc(
      Inventory,
      toObjectId(prod1._id),
      toObjectId(supplierId),
      toObjectId(hospitalId),
      100,
      110,
      10
    ),
  ];

  // Insert inventories using Inventory model (let Mongoose validate)
  const insertedInventories: any[] = [];
  for (const doc of invDocs) {
    const inv = await Inventory.create(doc);
    insertedInventories.push(inv);
  }

  // Build order dynamically using buildOrderDoc
  const productsForOrder = [
    { productId: prod0._id, quantity: 10, price: 45 },
    { productId: prod1._id, quantity: 5, price: 110 },
  ];
  const totalPrice = productsForOrder.reduce((s, p) => s + p.price * p.quantity, 0);

  const orderDoc = buildOrderDoc(
    Order,
    toObjectId(hospitalId),
    toObjectId(supplierId),
    productsForOrder.map(p => ({ ...p, productId: toObjectId(p.productId) })),
    "pending",
    totalPrice,
    undefined,
    toObjectId(admin._id) // placedBy (admin placing the sample order)
  );

  // Create order using the dynamically built doc
  const order = await Order.create(orderDoc);

  // Create commission record (sample)
  // Create commission record (sample)
const commissionAmount = Math.round(((order as any).totalPrice ?? totalPrice) * 0.15 * 100) / 100;
function buildCommissionDoc(
  commissionModel: any,
  orderId: mongoose.Types.ObjectId,
  hospitalId: mongoose.Types.ObjectId,
  supplierId: mongoose.Types.ObjectId,
  commissionAmount: number,
  paid = false
) {
  const paths = commissionModel.schema?.paths || {};
  const doc: any = {};

  if (paths["order"]) doc.order = toObjectId(orderId);
  else if (paths["orderId"]) doc.orderId = toObjectId(orderId);
  else if (paths["order_id"]) doc.order_id = toObjectId(orderId);
  else doc.orderId = toObjectId(orderId);

  if (paths["hospital"]) doc.hospital = toObjectId(hospitalId);
  else if (paths["hospitalId"]) doc.hospitalId = toObjectId(hospitalId);
  else if (paths["hospital_id"]) doc.hospital_id = toObjectId(hospitalId);
  else doc.hospitalId = toObjectId(hospitalId);

  if (paths["supplier"]) doc.supplier = toObjectId(supplierId);
  else if (paths["supplierId"]) doc.supplierId = toObjectId(supplierId);
  else if (paths["supplier_id"]) doc.supplier_id = toObjectId(supplierId);
  else doc.supplierId = toObjectId(supplierId);

  doc.commissionAmount = commissionAmount;
  doc.paid = paid;

  return doc;
}

const commissionDoc = buildCommissionDoc(Commission, toObjectId(order._id), toObjectId(hospital._id), toObjectId(supplier._id), commissionAmount, false);
await Commission.create(commissionDoc);

  return {
    admin,
    supplier,
    mrUser,
    mr,
    hospitalUser,
    hospital,
    products: productsInserted,
    inventories: insertedInventories,
    order,
  };
}

(async () => {
  try {
    await connectDB();
    await clearAll();
    const created = await createSeeds();

    // --- safe summary printing to avoid TypeScript unknown errors ---
    function getIdAsString(item: any): string | undefined {
      if (!item) return undefined;
      const id = item._id ?? item.id ?? item;
      try {
        if (id && typeof id.toString === "function") return id.toString();
        return String(id);
      } catch {
        return undefined;
      }
    }

    const orderId = getIdAsString((created as any).order);
    const adminEmail = (created as any).admin?.email ?? "n/a";
    const supplierEmail = (created as any).supplier?.email ?? "n/a";
    const mrEmail = (created as any).mrUser?.email ?? "n/a";
    const hospitalEmail = (created as any).hospital?.email ?? "n/a";
    const productCount = Array.isArray((created as any).products) ? (created as any).products.length : 0;

    console.log("Seeding complete. Summary:");
    console.log({
      admin: adminEmail,
      supplier: supplierEmail,
      mr: mrEmail,
      hospital: hospitalEmail,
      productCount,
      orderId: orderId ?? "unknown",
    });

    process.exit(0);
  } catch (err: any) {
    console.error("Seed error:", err);
    process.exit(1);
  }
})();