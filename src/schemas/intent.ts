import { z } from "zod";

/**
 * Operators supported by the FindIt constraint engine.
 */
export const ConstraintOperatorSchema = z.enum([
  "EQUALS",
  "NOT_EQUALS",
  "LESS_THAN",
  "LESS_THAN_OR_EQUAL",
  "GREATER_THAN",
  "GREATER_THAN_OR_EQUAL",
  "IN",
  "NOT_IN",
  "CONTAINS",
]);

export type ConstraintOperator = z.infer<
  typeof ConstraintOperatorSchema
>;

/**
 * Primitive values allowed in constraint evaluation.
 */
export const PrimitiveValueSchema = z.union([
  z.string(),
  z.number(),
  z.boolean(),
]);

export type PrimitiveValue = z.infer<
  typeof PrimitiveValueSchema
>;

/**
 * A hard constraint is non-negotiable.
 */
export const HardConstraintSchema = z.object({
  attribute: z.string().min(1),

  operator: ConstraintOperatorSchema,

  value: z.union([
    PrimitiveValueSchema,
    z.array(PrimitiveValueSchema),
  ]),

  unit: z.string().min(1).toLowerCase().optional(),
}).superRefine((data, ctx) => {
  // IN and NOT_IN require an array of values.
  if (
    data.operator === "IN" ||
    data.operator === "NOT_IN"
  ) {
    if (!Array.isArray(data.value)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          `Operator '${data.operator}' requires an array value.`,
        path: ["value"],
      });
    }
  }

  // CONTAINS requires a single scalar value.
  else if (data.operator === "CONTAINS") {
    if (Array.isArray(data.value)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "Operator 'CONTAINS' requires a scalar value.",
        path: ["value"],
      });
    }
  }

  // All remaining operators require scalar values.
  else {
    if (Array.isArray(data.value)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          `Operator '${data.operator}' requires a scalar value (string, number, or boolean).`,
        path: ["value"],
      });
    }
  }
});

export type HardConstraint = z.infer<
  typeof HardConstraintSchema
>;

/**
 * A soft preference affects ranking,
 * but does not automatically eliminate a product.
 */
export const SoftPreferenceSchema = z.object({
  attribute: z.string().min(1),

  value: PrimitiveValueSchema,

  weight: z.number().min(0).max(1),
});

export type SoftPreference = z.infer<
  typeof SoftPreferenceSchema
>;

/**
 * Complete structured representation of user intent.
 */
export const IntentSchema = z.object({
  category: z.string().min(1).toLowerCase(),

  location: z.string().min(1).toUpperCase(),

  hard_constraints: z.array(HardConstraintSchema),

  soft_preferences: z.array(SoftPreferenceSchema),
});

export type Intent = z.infer<
  typeof IntentSchema
>;