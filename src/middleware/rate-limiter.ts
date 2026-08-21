import rateLimit, { Options } from "express-rate-limit";

export interface CustomRateLimiterOptions {
  /** Time window in milliseconds (default: 15 minutes) */
  windowMs?: number;
  /** Max number of connections during windowMs (default: 100) */
  max?: number;
  /** Error message returned when limit is reached */
  message?: string;
  /** HTTP status code returned when limit is reached (default: 429) */
  statusCode?: number;
}

/**
 * Creates a route-level or global rate-limiting middleware using express-rate-limit.
 */
export function createRateLimiter(options: CustomRateLimiterOptions = {}) {
  const windowMs = options.windowMs ?? 15 * 60 * 1000;
  const limit = options.max ?? 100;
  const message = options.message ?? "Too many requests, please try again later.";
  const statusCode = options.statusCode ?? 429;

  return rateLimit({
    windowMs,
    limit,
    statusCode,
    standardHeaders: "draft-7", // draft-7 `RateLimit` headers
    legacyHeaders: false, // Disable legacy `X-RateLimit-*` headers
    handler: (_req, res) => {
      res.status(statusCode).json({
        success: false,
        message,
      });
    },
  });
}

// ─── Pre-configured Route Limiters ──────────────────────────────────────────

/**
 * Strict rate limiter for Authentication routes (login, register)
 * Limit: 10 requests per 15 minutes per IP
 */
export const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: "Too many authentication attempts. Please try again after 15 minutes.",
});

/**
 * Moderate rate limiter for Purchase and Financial operations
 * Limit: 15 requests per 1 minute per IP
 */
export const purchaseRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 15,
  message: "Too many purchase requests. Please slow down and try again shortly.",
});

/**
 * Rate limiter for Course creation and modification
 * Limit: 30 requests per 1 minute per IP
 */
export const courseMutationLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 30,
  message: "Too many course update requests. Please slow down and try again.",
});

/**
 * Rate limiter for Lesson creation and modification
 * Limit: 50 requests per 1 minute per IP
 */
export const lessonMutationLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 50,
  message: "Too many lesson update requests. Please slow down and try again.",
});

/**
 * Rate limiter for Topic creation
 * Limit: 20 requests per 1 minute per IP
 */
export const topicMutationLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 20,
  message: "Too many topic creation requests. Please try again later.",
});

/**
 * Rate limiter for Student Progress tracking (completing lessons)
 * Limit: 60 requests per 1 minute per IP
 */
export const progressRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 60,
  message: "Too many progress updates. Please slow down.",
});

/**
 * General API rate limiter for standard endpoints
 * Limit: 100 requests per 15 minutes per IP
 */
export const generalApiRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "API rate limit exceeded. Please try again later.",
});
