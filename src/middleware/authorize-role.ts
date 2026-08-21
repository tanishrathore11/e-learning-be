import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/appError.js";

/**
 * Role-based authorization middleware factory.
 * Usage: authorizeRole("ADMIN", "INSTRUCTOR")
 *
 * Must be used AFTER authenticateRequest so that req.user is populated.
 * Throws 403 if the authenticated user's role is not in the allowed list.
 */
export function authorizeRole(...roles: Array<"ADMIN" | "INSTRUCTOR" | "STUDENT">) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AppError("Authentication required", 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          `Access denied. Required role(s): ${roles.join(", ")}`,
          403
        )
      );
    }

    next();
  };
}
