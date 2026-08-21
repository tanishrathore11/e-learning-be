import { z } from "zod";
import { validate } from "./validate.js";

// instructorId is NOT accepted from the body — it is injected from req.user.id in the controller
export const createCourseSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  description: z.string().max(2000).nullable().optional(),
  topicId: z.string().uuid("topicId must be a valid UUID"),
  price: z.number({ invalid_type_error: "Price must be a number" }).min(0, "Price cannot be negative"),
});

export const updateCourseSchema = z.object({
  title: z.string().min(1, "Title cannot be empty").max(255).optional(),
  description: z.string().max(2000).nullable().optional(),
  topicId: z.string().uuid("topicId must be a valid UUID").optional(),
  price: z.number({ invalid_type_error: "Price must be a number" }).min(0, "Price cannot be negative").optional(),
});

export const validateCreateCourse = validate(createCourseSchema);
export const validateUpdateCourse = validate(updateCourseSchema);
