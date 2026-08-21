import { z } from "zod";
import { validate } from "./validate.js";

export const createPurchaseSchema = z.object({
  items: z
    .array(
      z.union([
        z.object({
          courseId: z.string().uuid("courseId must be a valid UUID"),
        }),
        z.string().uuid("courseId must be a valid UUID").transform((courseId) => ({ courseId })),
      ])
    )
    .min(1, "At least one course item is required"),
});

export const markProgressSchema = z.object({
  enrollmentId: z.string().uuid("enrollmentId must be a valid UUID"),
  lessonId: z.string().uuid("lessonId must be a valid UUID"),
});

export const validateCreatePurchase = validate(createPurchaseSchema);
export const validateMarkProgress = validate(markProgressSchema);
