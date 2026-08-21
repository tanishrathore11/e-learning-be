import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config/env.js";
import { AppError } from "../utils/appError.js";

interface JwtPayload {
  id: string;
  role: "ADMIN" | "INSTRUCTOR" | "STUDENT";
}

/**
 * Extracts and verifies the JWT from the Authorization header.
 * Attaches `{ id, role }` to `req.user` for downstream handlers.
 * Throws 401 if the token is missing or invalid.
 */
export function authenticateRequest(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new AppError("Authentication token is missing", 401));
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = jwt.verify(token, config.jwtSecret) as JwtPayload;
    req.user = { id: payload.id, role: payload.role };
    next();
  } catch {
    next(new AppError("Invalid or expired authentication token", 401));
  }
}
