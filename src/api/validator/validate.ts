import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";

/**
 * Generic Zod validation middleware factory.
 * Pass a Zod schema and the part of the request to validate.
 * Defaults to validating `req.body`.
 *
 * On failure it calls next() with a ZodError so the global error
 * handler can format it as a 400 response.
 */
export function validate(
  schema: ZodSchema,
  target: "body" | "params" | "query" = "body"
) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[target]);
    if (!result.success) {
      next(result.error);
      return;
    }
    // Replace with the parsed (and coerced) data
    req[target] = result.data;
    next();
  };
}
