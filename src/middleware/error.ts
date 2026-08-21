import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { AppError } from "../utils/appError.js";

/**
 * Global Express error-handling middleware.
 *
 * Handles three categories of errors:
 *   1. AppError  — operational errors with a known status code (4xx / 5xx)
 *   2. ZodError  — validation failures, formatted as field-level messages (400)
 *   3. Unknown   — unexpected errors, always returned as 500
 */
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void {
  // ── Operational / application errors ──────────────────────────────────────
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
    return;
  }

  // ── Zod validation errors ──────────────────────────────────────────────────
  if (err instanceof ZodError) {
    const errors = err.errors.map((e) => ({
      field: e.path.join("."),
      message: e.message,
    }));

    res.status(400).json({
      success: false,
      message: "Validation failed",
      errors,
    });
    return;
  }

  // ── Unknown / programming errors ───────────────────────────────────────────
  console.error("Unhandled error:", err);

  res.status(500).json({
    success: false,
    message: "An unexpected internal server error occurred",
  });
}
