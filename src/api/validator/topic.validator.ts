import { z } from "zod";
import { validate } from "./validate.js";

export const createTopicSchema = z.object({
  name: z.string().min(1, "Topic name is required").max(255),
  description: z.string().max(1000).nullable().optional(),
});

export const validateCreateTopic = validate(createTopicSchema);
