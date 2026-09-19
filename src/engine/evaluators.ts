import type { HardConstraint } from "../schemas/intent.js";
import type { Product } from "../schemas/product.js";
import { resolveAttribute } from "./attributeResolver.js";
import { evaluateOperator } from "./operators.js";

export interface ConstraintResult {
  attribute: string;
  operator: HardConstraint["operator"];
  expected: HardConstraint["value"];
  actual: unknown;
  passed: boolean;
}

export interface EvaluationResult {
  passed: boolean;
  results: ConstraintResult[];
}

export function evaluateHardConstraints(
  constraints: HardConstraint[],
  product: Product,
  categoryTarget?: string
): EvaluationResult {
  const results: ConstraintResult[] = [];

  if (categoryTarget) {
    const categoryMatch = evaluateOperator(
      product.category,
      "EQUALS",
      categoryTarget
    );

    results.push({
      attribute: "category",
      operator: "EQUALS",
      expected: categoryTarget,
      actual: product.category,
      passed: categoryMatch,
    });

    if (!categoryMatch) {
      return {
        passed: false,
        results,
      };
    }
  }

  for (const constraint of constraints) {
    const actual = resolveAttribute(
      constraint.attribute,
      product
    );

    const passed =
      actual !== undefined &&
      evaluateOperator(
        actual,
        constraint.operator,
        constraint.value
      );

    results.push({
      attribute: constraint.attribute,
      operator: constraint.operator,
      expected: constraint.value,
      actual,
      passed,
    });
  }

  return {
    passed: results.every(
      (result) => result.passed
    ),
    results,
  };
}