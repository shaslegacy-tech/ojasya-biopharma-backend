// test/jest.setup.ts
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import connectDB from "../src/utils/db";

let mongo: MongoMemoryServer;

beforeAll(async () => {
  mongo = await MongoMemoryServer.create({
    instance: { storageEngine: "ephemeralForTest" },
  });
  process.env.MONGODB_URI = mongo.getUri();
  await connectDB();
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  if (mongo) await mongo.stop();
});