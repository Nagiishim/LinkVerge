import { z } from "zod";
import {
  HardConstraintSchema,
  SoftPreferenceSchema,
} from "./intent.js";

export const ParserOutputSchema = z.object({
  category: z.string().min(1).trim(),

  location: z.string().trim().length(2).toUpperCase(),

  hard_constraints: z.array(HardConstraintSchema),

  soft_preferences: z.array(SoftPreferenceSchema),
});

export type ParserOutput = z.infer<typeof ParserOutputSchema>;