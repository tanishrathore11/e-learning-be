import express from "express";
import swaggerUi from "swagger-ui-express";
import apiRoutes from "./api/route/index.js";
import { errorHandler } from "./middleware/error.js";
import { swaggerSpec } from "./config/swagger.js";
import { generalApiRateLimiter } from "./middleware/rate-limiter.js";

const app = express();

// ─── Body parsing ────────────────────────────────────────────────────────────
app.use(express.json());

// ─── Swagger docs ────────────────────────────────────────────────────────────
app.use("/api/v1/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ─── Global rate limiting & API routes ───────────────────────────────────────
app.use("/api/v1", generalApiRateLimiter, apiRoutes);

// ─── Global error handler (must be registered after routes) ──────────────────
app.use(errorHandler);

export default app;
