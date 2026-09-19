import { evaluateHardConstraints } from "./evaluators.js";
import { mockProducts } from "../data/mockData.js";
import type { HardConstraint } from "../schemas/intent.js";

const product = mockProducts[0];

if (!product) {
  throw new Error("No mock product available.");
}

const constraints: HardConstraint[] = [
  {
    attribute: "price",
    operator: "LESS_THAN_OR_EQUAL",
    value: 20000,
  },
  {
    attribute: "level",
    operator: "EQUALS",
    value: "beginner",
  },
];

const evaluation = evaluateHardConstraints(
  constraints,
  product,
  "Tech & Coding"
);

console.log("\nFINDIT CONSTRAINT EVALUATION\n");

console.log(`Product: ${product.title}`);
console.log(`Passed: ${evaluation.passed}`);

console.log("\nConstraint checks:");

for (const result of evaluation.results) {
  console.log(
    `- ${result.attribute} ${result.operator} ${String(
      result.expected
    )}`
  );

  console.log(
    `  Actual: ${String(result.actual)}`
  );

  console.log(
    `  Result: ${result.passed ? "PASS" : "FAIL"}`
  );
}

console.log();