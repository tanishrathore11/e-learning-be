import { z } from "zod";
import { validate } from "./validate.js";

export const registerSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["ADMIN", "INSTRUCTOR", "STUDENT"]).optional().default("STUDENT"),
  bio: z.string().max(1000).nullable().optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const validateRegister = validate(registerSchema);
export const validateLogin = validate(loginSchema);
