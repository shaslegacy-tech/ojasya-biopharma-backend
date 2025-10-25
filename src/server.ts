// src/server.ts
import dotenv from "dotenv";
dotenv.config();

import express, { Request, Response, NextFunction } from "express";
import path from "path";
import fs from "fs";
import helmet from "helmet";
import compression from "compression";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import url from "url";
import { collectDefaultMetrics, register as promRegister } from "prom-client";
import connectDB, { disconnectDB } from "./utils/db";

// OpenAPI validator (correct import style for TypeScript)
import * as OpenApiValidator from "express-openapi-validator";

// Swagger UI & ReDoc
import swaggerUi from "swagger-ui-express";
import redoc from "redoc-express";

// routes
import authRoutes from "./routes/auth";
import hospitalRoutes from "./routes/hospital";
import supplierRoutes from "./routes/supplier";
import adminRoutes from "./routes/admin";
import productRoutes from "./routes/productRoutes";
import stockRoutes from "./routes/stockRoutes";
import mrRoutes from "./routes/mr";

const APP_PORT = Number(process.env.PORT ?? 8000);
const NODE_ENV = process.env.NODE_ENV ?? "development";
const CLIENT_ORIGIN = (process.env.CLIENT_ORIGIN || "http://localhost:3000,http://localhost:8000")
  .split(",")
  .map(s => s.trim());
const API_PREFIX = process.env.API_PREFIX ?? "/api/v1";

const app = express();

app.use(helmet());
app.use(compression());
app.use(cookieParser());

const corsOptions = {
  origin: "http://localhost:3000",
  credentials: true
};
app.use(cors(corsOptions));

console.log("🔐 Allowed Origins:", CLIENT_ORIGIN);

// Middleware wrapper to allow multiple + same-origin requests (for Swagger UI)
app.use((req: Request, res: Response, next: NextFunction) => {
  const originHeader = req.headers.origin as string | undefined;

  // ✅ Allow Postman / curl (no Origin header)
  if (!originHeader) {
    return cors({ origin: true, credentials: true })(req, res, next);
  }

  // ✅ Allow if explicitly listed in CLIENT_ORIGIN
  if (CLIENT_ORIGIN.includes("*") || CLIENT_ORIGIN.includes(originHeader)) {
    return cors({ origin: originHeader, credentials: true })(req, res, next);
  }

  // ✅ Allow same-origin (Swagger UI served from same host:port)
  try {
    const originUrl = new URL(originHeader);
    const serverHost = req.hostname || "localhost";
    const serverPort = String(process.env.PORT ?? "8000");
    const originPort = originUrl.port || (originUrl.protocol === "https:" ? "443" : "80");
    if (originUrl.hostname === serverHost && originPort === serverPort) {
      return cors({ origin: originHeader, credentials: true })(req, res, next);
    }
  } catch (e) {
    console.warn("CORS parse error:", e);
  }

  // ❌ Deny other origins
  res.status(403).json({ error: "CORS policy: Origin not allowed", origin: originHeader });
});

app.use(
  morgan(NODE_ENV === "production" ? "combined" : "dev", {
    skip: (req: Request) => req.path === "/healthz" || req.path === "/metrics",
  })
);

app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));

// Rate limiter
app.use(
  rateLimit({
    windowMs: 60 * 1000,
    max: 250,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

// static uploads
const uploadsPath = path.join(__dirname, "..", "uploads");
app.use("/uploads", express.static(uploadsPath, { index: false, redirect: false }));

// Prometheus metrics
collectDefaultMetrics();

// ===== OpenAPI spec path & load it (for Swagger/ReDoc and Validator) =====
const openApiPath = path.join(__dirname, "..", "openapi.json");
let openApiDocument: any = null;

try {
  const raw = fs.readFileSync(openApiPath, "utf-8");
  openApiDocument = JSON.parse(raw);
} catch (err) {
  console.warn("Could not read openapi.json at project root. Make sure openapi.json exists.", err);
}

// Serve the raw spec (handy)
if (openApiDocument) {
  app.get(`${API_PREFIX}/openapi.json`, (_req: Request, res: Response) => {
    res.json(openApiDocument);
  });

  // Swagger UI (interactive)
  app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(openApiDocument));

  // ReDoc (nice read-only docs)
  app.get(
    "/api/redoc",
    redoc({
      title: "Ojasya Biopharma API Docs",
      specUrl: `${API_PREFIX}/openapi.json`,
    })
  );
} else {
  console.warn("openapi.json not loaded — swagger/redoc endpoints are disabled until spec file is added.");
}

if (openApiDocument) {
  app.use((req: Request, _res: Response, next: NextFunction) => {
    if (API_PREFIX && req.url.startsWith(API_PREFIX)) {
      (req as any)._originalUrlForOpenApi = req.url;
      req.url = req.url.slice(API_PREFIX.length) || "/";
    }
    return next();
  });

  app.use(
    OpenApiValidator.middleware({
      apiSpec: openApiPath,
      validateRequests: true,
      validateResponses: false,
    })
  );

  // After validation, restore the original URL for downstream middleware/routes
  app.use((req: Request, _res: Response, next: NextFunction) => {
    if ((req as any)._originalUrlForOpenApi) {
      req.url = (req as any)._originalUrlForOpenApi;
      delete (req as any)._originalUrlForOpenApi;
    }
    next();
  });

  // OpenAPI validation error handler
  app.use((err: any, _req: Request, res: Response, next: NextFunction) => {
    if (err && err.status && Array.isArray(err.errors)) {
      return res.status(err.status).json({
        status: "error",
        error: {
          code: "OPENAPI_VALIDATION_ERROR",
          message: err.message,
          details: err.errors,
        },
        trace_id: Math.random().toString(36).slice(2),
      });
    }
    return next(err);
  });
}

// ===== mount routes AFTER validator (or even if validator not used) =====
app.use(`${API_PREFIX}/auth`, authRoutes);
app.use(`${API_PREFIX}/hospitals`, hospitalRoutes);
app.use(`${API_PREFIX}/suppliers`, supplierRoutes);
app.use(`${API_PREFIX}/admin`, adminRoutes);
app.use(`${API_PREFIX}/products`, productRoutes);
app.use(`${API_PREFIX}/stocks`, stockRoutes);
app.use(`${API_PREFIX}/mr`, mrRoutes);

// health & metrics
app.get("/healthz", (_req: Request, res: Response) => {
  const connected = (global as any).__MONGO_CONNECTED__ ? true : false;
  res.json({ status: "ok", env: NODE_ENV, mongoConnected: connected });
});

app.get("/metrics", async (_req: Request, res: Response) => {
  try {
    res.setHeader("Content-Type", promRegister.contentType);
    res.end(await promRegister.metrics());
  } catch (err) {
    res.status(500).end(String(err));
  }
});

// 404
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: "Not Found", path: req.originalUrl });
});

// global error handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Unhandled error:", err);
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  const payload: any = { error: message };
  if (NODE_ENV !== "production") payload.stack = err.stack;
  res.status(status).json(payload);
});

// start server with DB connection and graceful shutdown
let serverInstance: ReturnType<typeof app.listen> | null = null;

const startServer = async () => {
  try {
    await connectDB();
    (global as any).__MONGO_CONNECTED__ = true;

    serverInstance = app.listen(APP_PORT, () => {
      console.log(`Ojasya Biopharma API listening on port ${APP_PORT} (env=${NODE_ENV})`);
      console.log(`API prefix: ${API_PREFIX}`);
      if (openApiDocument) {
        console.log(`Swagger UI: http://localhost:${APP_PORT}/api/docs`);
        console.log(`ReDoc: http://localhost:${APP_PORT}/api/redoc`);
        console.log(`OpenAPI JSON: http://localhost:${APP_PORT}${API_PREFIX}/openapi.json`);
      }
    });

    const shutdown = async (signal: string) => {
      console.info(`Received ${signal}. Shutting down...`);
      try {
        if (serverInstance) serverInstance.close(() => console.log("HTTP server closed"));
        await disconnectDB();
        process.exit(0);
      } catch (err) {
        console.error("Shutdown error:", err);
        process.exit(1);
      }
    };

    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
};

if (process.env.NODE_ENV !== "test") {
  startServer();
}
// export default app;

export default app;