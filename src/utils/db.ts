// src/utils/db.ts
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/ojasya";

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable inside .env");
}

// Optional: configure mongoose globally
mongoose.set("strictQuery", false); // avoid deprecation warnings, change as you prefer

const MAX_RETRIES = Number(process.env.MONGO_CONNECT_RETRIES ?? 3);
const RETRY_DELAY_MS = Number(process.env.MONGO_CONNECT_RETRY_DELAY_MS ?? 2000);

let connecting = false;

const connectDB = async (): Promise<typeof mongoose> => {
  if (mongoose.connection.readyState === 1) {
    console.log("MongoDB is already connected.");
    return mongoose;
  }
  if (connecting) {
    // if another call is already trying to connect, wait for it to finish
    // simple polling wait
    await new Promise((resolve) => {
      const iv = setInterval(() => {
        if (mongoose.connection.readyState === 1) {
          clearInterval(iv);
          resolve(null);
        }
      }, 200);
    });
    return mongoose;
  }

  let attempts = 0;
  connecting = true;

  while (attempts <= MAX_RETRIES) {
    try {
      attempts += 1;
      // Mongoose v7+ no longer needs useNewUrlParser/useUnifiedTopology options
      await mongoose.connect(MONGODB_URI);
      console.log("MongoDB connected successfully");
      // register listeners (useful for debugging)
      mongoose.connection.on("error", (err) => {
        console.error("MongoDB connection error:", err);
      });
      mongoose.connection.on("disconnected", () => {
        console.warn("MongoDB disconnected");
      });
      connecting = false;
      return mongoose;
    } catch (err) {
      console.error(`MongoDB connection attempt ${attempts} failed:`, err);
      if (attempts > MAX_RETRIES) {
        console.error("Max MongoDB connection attempts reached. Exiting.");
        connecting = false;
        // exit or rethrow depending on your preference
        process.exit(1);
      }
      // wait then retry
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
    }
  }

  // fallback (should not reach here)
  connecting = false;
  throw new Error("Failed to connect to MongoDB");
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    console.log("MongoDB disconnected");
  } catch (err) {
    console.error("Error during MongoDB disconnect:", err);
    throw err;
  }
};

export default connectDB;
export { disconnectDB, mongoose };