import { IntentSchema, type Intent } from "../schemas/intent.js";

export function parseIntent(input: unknown): Intent {
  const result = IntentSchema.safeParse(input);

  if (!result.success) {
    throw new Error(
      `Invalid parsed intent: ${result.error.message}`
    );
  }

  return result.data;
}