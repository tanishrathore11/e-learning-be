import { z } from "zod";
import { validate } from "./validate.js";

export const updateUserSchema = z.object({
  name: z.string().min(1, "Name is required").max(255).optional(),
  bio: z.string().max(1000).nullable().optional(),
});

export const validateUpdateUser = validate(updateUserSchema);
