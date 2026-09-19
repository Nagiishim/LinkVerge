import type { ConstraintOperator } from "../schemas/intent.js";

/**
 * Deterministically evaluates a single constraint operator.
 *
 * The evaluator fails closed:
 * invalid runtime types never produce a successful match.
 */
export function evaluateOperator(
  actual: unknown,
  operator: ConstraintOperator,
  expected: unknown
): boolean {
  switch (operator) {
    case "EQUALS":
      return evaluateEquals(actual, expected);

    case "NOT_EQUALS":
      return evaluateNotEquals(actual, expected);

    case "LESS_THAN":
      return evaluateNumericComparison(
        actual,
        expected,
        (a, b) => a < b
      );

    case "LESS_THAN_OR_EQUAL":
      return evaluateNumericComparison(
        actual,
        expected,
        (a, b) => a <= b
      );

    case "GREATER_THAN":
      return evaluateNumericComparison(
        actual,
        expected,
        (a, b) => a > b
      );

    case "GREATER_THAN_OR_EQUAL":
      return evaluateNumericComparison(
        actual,
        expected,
        (a, b) => a >= b
      );

    case "IN":
      return evaluateIn(actual, expected);

    case "NOT_IN":
      return evaluateNotIn(actual, expected);

    case "CONTAINS":
      return evaluateContains(actual, expected);

    default:
      return false;
  }
}

function evaluateEquals(
  actual: unknown,
  expected: unknown
): boolean {
  if (
    !isPrimitive(actual) ||
    !isPrimitive(expected)
  ) {
    return false;
  }

  if (
    typeof actual === "string" &&
    typeof expected === "string"
  ) {
    return (
      actual.trim().toLowerCase() ===
      expected.trim().toLowerCase()
    );
  }

  return actual === expected;
}

function evaluateNotEquals(
  actual: unknown,
  expected: unknown
): boolean {
  if (
    !isPrimitive(actual) ||
    !isPrimitive(expected)
  ) {
    return false;
  }

  if (
    typeof actual === "string" &&
    typeof expected === "string"
  ) {
    return (
      actual.trim().toLowerCase() !==
      expected.trim().toLowerCase()
    );
  }

  return actual !== expected;
}

function evaluateNumericComparison(
  actual: unknown,
  expected: unknown,
  comparison: (
    actual: number,
    expected: number
  ) => boolean
): boolean {
  if (
    typeof actual !== "number" ||
    typeof expected !== "number" ||
    !Number.isFinite(actual) ||
    !Number.isFinite(expected)
  ) {
    return false;
  }

  return comparison(actual, expected);
}

function evaluateIn(
  actual: unknown,
  expected: unknown
): boolean {
  if (
    !isPrimitive(actual) ||
    !Array.isArray(expected)
  ) {
    return false;
  }

  if (!expected.every(isPrimitive)) {
    return false;
  }

  return expected.some((item) =>
    evaluateEquals(actual, item)
  );
}

function evaluateNotIn(
  actual: unknown,
  expected: unknown
): boolean {
  if (
    !isPrimitive(actual) ||
    !Array.isArray(expected)
  ) {
    return false;
  }

  if (!expected.every(isPrimitive)) {
    return false;
  }

  return !expected.some((item) =>
    evaluateEquals(actual, item)
  );
}

/**
 * CONTAINS supports both:
 *
 * 1. Arrays containing a value
 * 2. Strings containing a substring
 */
function evaluateContains(
  actual: unknown,
  expected: unknown
): boolean {
  if (!isPrimitive(expected)) {
    return false;
  }

  if (typeof actual === "string") {
    if (typeof expected !== "string") {
      return false;
    }

    return actual
      .toLowerCase()
      .includes(expected.toLowerCase());
  }

  if (Array.isArray(actual)) {
    if (!actual.every(isPrimitive)) {
      return false;
    }

    return actual.some((item) =>
      evaluateEquals(item, expected)
    );
  }

  return false;
}

function isPrimitive(
  value: unknown
): value is string | number | boolean {
  return (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  );
}