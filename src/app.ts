import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import apiRoutes from "./api/route/index.js";
import { errorHandler } from "./middleware/error.js";
import { swaggerSpec } from "./config/swagger.js";
import { generalApiRateLimiter } from "./middleware/rate-limiter.js";
import { pinoHttp } from "pino-http";
import { logger } from "./util/logger.js";

const app = express();

// ─── CORS ────────────────────────────────────────────────────────────────────
app.use(cors());

// ─── Body parsing ────────────────────────────────────────────────────────────
app.use(express.json());

// ─── Logging ─────────────────────────────────────────────────────────────────
app.use(pinoHttp({ logger }));

// ─── Swagger docs ────────────────────────────────────────────────────────────
app.use("/api/v1/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ─── Global rate limiting & API routes ───────────────────────────────────────
app.use("/api/v1", generalApiRateLimiter, apiRoutes);

// ─── Global error handler (must be registered after routes) ──────────────────
app.use(errorHandler);

export default app;
