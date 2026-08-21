import { z } from "zod";
import { validate } from "./validate.js";

export const addLessonSchema = z.object({
  courseId: z.string().uuid("courseId must be a valid UUID"),
  title: z.string().min(1, "Title is required").max(255),
  type: z.enum(["VIDEO", "NOTES"]),
  content: z.string().nullable().optional(),
  videoUrl: z.string().url("videoUrl must be a valid URL").nullable().optional(),
  position: z.number().int().positive().nullable().optional(),
});

export const updateLessonSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  type: z.enum(["VIDEO", "NOTES"]).optional(),
  content: z.string().nullable().optional(),
  videoUrl: z.string().url("videoUrl must be a valid URL").nullable().optional(),
  position: z.number().int().positive().nullable().optional(),
});

export const validateAddLesson = validate(addLessonSchema);
export const validateUpdateLesson = validate(updateLessonSchema);
