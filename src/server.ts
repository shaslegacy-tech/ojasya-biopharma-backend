import express from 'express';
import cors from 'cors';
import connectDB from './utils/db';
import authRoutes from './routes/auth';
import hospitalRoutes from './routes/hospital';
import supplierRoutes from './routes/supplier';
import adminRoutes from './routes/admin';
import cookieParser from 'cookie-parser';
import productRoutes from './routes/productRoutes';
import path from "path";
import stockRoutes from './routes/stockRoutes';

const app = express();
app.use(cookieParser());

// CORS configuration
const corsOptions = {
  origin: "http://localhost:3000",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.use(cors(corsOptions));

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/hospital', hospitalRoutes);
app.use('/api/supplier', supplierRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/products', productRoutes ); // Serve static files from uploads directory
app.use("/api/stocks", stockRoutes);

const port = process.env.PORT || 8000;

const startServer = async () => {
  await connectDB(); // Connect to MongoDB before starting the server
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
};

startServer();
